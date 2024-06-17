import fs from "fs";
import { TAuthResponse } from "./types";

export const saveTokensToFile = ({
  access_token,
  refresh_token,
}: TAuthResponse) => {
  fs.writeFileSync(
    "tokens.json",
    JSON.stringify({ access_token, refresh_token })
  );
};

export const loadTokensFromFile = (): TAuthResponse | null => {
  if (fs.existsSync("tokens.json")) {
    const tokens = JSON.parse(fs.readFileSync("tokens.json", "utf-8"));
    return tokens;
  }
  return null;
};
