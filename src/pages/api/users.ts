import dbConnect from "@/lib/mongodb";
import User from "@/models/Users";
import { TUserData } from "@/utils/types";
import { AxiosError } from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  data?: unknown;
  message: string;
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
        const newUser = req.body as TUserData;

        const updatedUser = await User.findOneAndUpdate(
          { usernameTG: newUser.usernameTG },
          { ...newUser, description: newUser.description ?? "" },
          { new: true, runValidators: true }
        );

        if (!updatedUser) {
          await User.create(newUser);
        }

        const data = await User.find({});

        res.status(200).json({ data, message: "success" });
      } catch (e) {
        const error = e as AxiosError;
        res
          .status(error.response?.status ?? 405)
          .json({ message: error.message });
      }
      break;
  }
}
