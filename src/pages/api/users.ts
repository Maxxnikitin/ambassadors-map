import type { NextApiRequest, NextApiResponse } from "next";
import formidable, { Fields, Files } from "formidable";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import dbConnect from "@/lib/mongodb";
import User from "@/models/Users";
import { AxiosError } from "axios";

type ResponseData = {
  data?: unknown;
  message: string;
};

const uploadDir = path.join(process.cwd(), "/public/uploads");
const fsAccess = promisify(fs.access);
const fsMkdir = promisify(fs.mkdir);
const fsUnlink = promisify(fs.unlink);

const ensureUploadDirExists = async () => {
  try {
    await fsAccess(uploadDir);
  } catch (error) {
    await fsMkdir(uploadDir, { recursive: true });
  }
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
        await ensureUploadDirExists();

        const form = formidable({
          uploadDir,
          keepExtensions: true,
        });

        form.parse(req, async (err: Error, fields: Fields, files: Files) => {
          if (err) {
            throw new Error(err.message);
          }

          const fileArray =
            files.file instanceof Array ? files.file : [files.file];
          const file = fileArray[0];

          let fileUrl;

          if (file) {
            const filePath = file.filepath;
            const fileName = path.basename(filePath);
            fileUrl = `/uploads/${fileName}`;
          }

          const { name, usernameTG, description, coords } = fields;

          const existingUser = await User.findOne({
            usernameTG: usernameTG![0],
          });

          // Если пользователь найден и у него есть файл, удалить старый файл
          if (existingUser && existingUser.avatar && file) {
            const oldFilePath = path.join(
              process.cwd(),
              "/public",
              existingUser.avatar
            );
            try {
              await fsUnlink(oldFilePath);
            } catch (unlinkErr) {
              console.error(
                `Failed to delete old file: ${oldFilePath}`,
                unlinkErr
              );
            }
          }

          const newUser = {
            name: name![0],
            description: description?.[0],
            coords: JSON.parse(coords![0]),
            avatar: fileUrl,
            usernameTG: usernameTG![0],
          };

          if (existingUser) {
            await User.findOneAndUpdate(
              { usernameTG: newUser.usernameTG },
              { ...newUser },
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
  }
}
