import axios, { AxiosResponse } from "axios";
import { TTGMessage, TUserData } from "./types";

const TELEGRAM_API_URL = process.env.NEXT_PUBLIC_TELEGRAM_API_URL;
const TG_CHAT_NAME = process.env.NEXT_PUBLIC_TG_CHAT_NAME;

export const checkResponse: <T>(res: AxiosResponse<T>) => T | Promise<T> = (
  res
) => {
  if (res.status.toString().startsWith("2")) {
    return res.data;
  }
  return Promise.reject(res);
};

export const getUsersDataFront = () =>
  axios
    .get(`/api/users`)
    .then((res: AxiosResponse<{ data: TUserData[] }>) => checkResponse(res));

export const postUserDataFront = (newUser: TUserData) =>
  axios
    .post(`/api/users`, newUser)
    .then((res: AxiosResponse<{ data: TUserData[] }>) => checkResponse(res));

export const getTGUpdatesFront = async (username: string): Promise<number> => {
  let allUpdates: TTGMessage[] = [];
  let offset = 0;

  try {
    while (true) {
      const { data } = await axios.get(
        `${TELEGRAM_API_URL}/getUpdates?offset=${offset}`
      );
      allUpdates = allUpdates.concat(data.result);
      if (data.result.length < 100) {
        break;
      }

      offset = data.result[data.result.length - 1].update_id + 1;
    }

    for (const update of allUpdates) {
      if (update.message) {
        const user = update.message.from;
        if (user.username.toLowerCase() === username.toLowerCase()) {
          return user.id;
        }
      }
    }

    throw new Error("User not found");
  } catch (error) {
    console.error("Error fetching updates:", error);
    throw error;
  }
};

export const getIsUserAmbassadorFront = async (
  userId: number
): Promise<boolean> => {
  try {
    const response = await axios.get(`${TELEGRAM_API_URL}/getChatMember`, {
      params: {
        chat_id: TG_CHAT_NAME,
        user_id: userId,
      },
    });

    const status = response.data.result.status;
    const isMember = status !== "left" && status !== "kicked";

    return isMember;
  } catch (error) {
    console.error("Error fetching updates:", error);
    throw error;
  }
};
