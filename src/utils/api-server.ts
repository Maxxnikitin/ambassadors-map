import axios, { AxiosResponse } from "axios";
import { TAuthResponse, TTGMessage, TUserData } from "./types";

export const checkResponse: <T>(res: AxiosResponse<T>) => T | Promise<T> = (
  res
) => {
  if (res.status.toString().startsWith("2")) {
    return res.data;
  }
  return Promise.reject(res);
};

export const refreshDropboxToken = async () => {
  const { data } = await axios.post<TAuthResponse>(
    "https://api.dropbox.com/oauth2/token",
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.DROPBOX_REFRESH_TOKEN!,
      client_id: process.env.DROPBOX_CLIENT_ID!,
      client_secret: process.env.DROPBOX_CLIENT_SECRET!,
    })
  );

  return data.access_token;
};
