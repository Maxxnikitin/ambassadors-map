import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { promisify } from "util";
import dbConnect from "@/lib/mongodb";
import User from "@/models/Users";
import { AxiosError } from "axios";
import { Dropbox, sharing } from "dropbox";

type ResponseData = {
  data?: unknown;
  message: string;
};

export const config = {
  api: {
    bodyParser: false, // Отключение встроенного парсера тела запроса
  },
};

const dbx = new Dropbox({
  accessToken: process.env.DROPBOX_TOKEN,
  fetch: fetch,
});

const fsUnlink = promisify(fs.unlink);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  await dbConnect();

  switch (req.method) {
    case "GET":
      try {
        const data = await User.find({});
        res.status(200).json({ data, message: "success" });
      } catch (e) {
        const error = e as AxiosError;
        res
          .status(error.response?.status ?? 405)
          .json({ message: error.message });
      }
      break;

    case "POST":
      try {
        const form = formidable({ keepExtensions: true });

        form.parse(req, async (err: Error, fields: Fields, files: Files) => {
          if (err) {
            return res.status(500).json({ message: err.message });
          }

          const fileArray =
            files.file instanceof Array ? files.file : [files.file];
          const file = fileArray[0];

          let fileUrl: string | undefined;
          let fileName: string | undefined;

          if (file) {
            const fileContent = fs.readFileSync(file.filepath);
            fileName = `${Date.now()}_${path.basename(file.filepath)}`;

            try {
              const response = await dbx.filesUpload({
                path: `/${fileName}`,
                contents: fileContent,
              });

              // Получение публичной ссылки на файл
              const sharedLinkResponse =
                await dbx.sharingCreateSharedLinkWithSettings({
                  path: response.result.path_display!,
                  settings: {
                    requested_visibility: { ".tag": "public" },
                  },
                });

              fileUrl = sharedLinkResponse.result.url.replace("dl=0", "raw=1"); // преобразование URL для прямого доступа к изображению
              await fsUnlink(file.filepath);
            } catch (uploadError) {
              return res
                .status(500)
                .json({ message: (uploadError as Error).message });
            }
          }

          const { name, usernameTG, description, coords } = fields;

          const existingUser = await User.findOne({
            usernameTG: usernameTG![0],
          });

          const newUser = {
            name: name![0],
            description: description?.[0],
            coords: JSON.parse(coords![0]),
            avatar: fileUrl,
            avatarForRemove: `/${fileName}`,
            usernameTG: usernameTG![0],
          };

          if (existingUser) {
            if (existingUser.avatarForRemove && fileUrl) {
              try {
                await dbx.filesDeleteV2({ path: existingUser.avatarForRemove });
              } catch (deleteError) {
                console.error(
                  `111111, Failed to delete old file: ${existingUser.avatarForRemove}`,
                  deleteError
                );
              }
            }
            await User.findOneAndUpdate(
              { usernameTG: newUser.usernameTG },
              newUser,
              { new: true, runValidators: true }
            );
          } else {
            await User.create(newUser);
          }

          const data = await User.find({});
          res.status(200).json({ data, message: "success" });
        });
      } catch (e) {
        const error = e as AxiosError;
        res
          .status(error.response?.status ?? 405)
          .json({ message: error.message });
      }
      break;

    default:
      res.status(405).json({ message: "Method not allowed" });
  }
}
