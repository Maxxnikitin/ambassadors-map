import { TAuthResponse } from "@/utils/types";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

// В целом, уже не нужен, 1 раз нужно было сделать, чтобы рефреш токен получить

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code } = req.query;

  try {
    const { data } = await axios.post<TAuthResponse>(
      "https://api.dropbox.com/oauth2/token",
      new URLSearchParams({
        code: code as string,
        grant_type: "authorization_code",
        client_id: process.env.DROPBOX_CLIENT_ID!,
        client_secret: process.env.DROPBOX_CLIENT_SECRET!,
        redirect_uri: "http://localhost:3000/api/auth",
      })
    );

    res.status(200).json(data);
  } catch (e) {
    return res.status(409).json({ message: (e as any).error });
  }
}
