export type TUserData = {
  name?: string;
  usernameTG?: string;
  avatar?: string;
  description?: string;
  coords?: [number, number];
};

export type TTGMessage = {
  update_id: number;
  message: {
    from: {
      first_name: string;
      id: number;
      is_bot: boolean;
      is_premium: boolean;
      language_code: string;
      last_name: string;
      username: string;
    };
  };
};
