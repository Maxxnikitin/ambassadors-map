import { addUser, getUsers } from "@/utils/database";
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
  switch (req.method) {
    case "GET":
      try {
        const data = getUsers();

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
        const newUser = req.body;

        const data = addUser(newUser);

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
