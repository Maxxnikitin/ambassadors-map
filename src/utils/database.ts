import { TUserData } from "./types";

let users: TUserData[] = [];

export const getUsers = () => users;

export const addUser = (user: TUserData) => {
  const filtered = users.filter(
    ({ usernameTG }) => usernameTG !== user.usernameTG
  );
  users = [...filtered, user];

  return users;
};
