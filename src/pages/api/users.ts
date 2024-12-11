import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import dbConnect from "@/lib/mongodb";
import User from "@/models/Users";
import { AxiosError } from "axios";
import { dropboxSaveFile } from "@/utils/dropbox-save-file";

type ResponseData = {
  data?: unknown;
  message: string;
};

export const config = {
  api: {
    bodyParser: false, // Отключение встроенного парсера тела запроса
  },
};

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

          const { name, usernameTG, description, coords } = fields;

          const existingUser = await User.findOne({
            usernameTG: usernameTG![0],
          });

          if (file) {
            const fileContent = fs.readFileSync(file.filepath);
            fileName = `${Date.now()}_${path.basename(file.filepath)}`;

            try {
              fileUrl = await dropboxSaveFile({
                fileName,
                fileContent,
                file,
                avatarForRemove: existingUser?.avatarForRemove,
              });
            } catch (uploadError) {
              return res
                .status(409)
                .json({ message: (uploadError as any).error });
            }
          }

          const newUser = {
            name: name![0],
            description: description?.[0],
            coords: JSON.parse(coords![0]),
            avatar: fileUrl,
            avatarForRemove: fileName ? `/${fileName}` : undefined,
            usernameTG: usernameTG![0],
          };

          if (existingUser) {
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
