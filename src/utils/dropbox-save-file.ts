import { Dropbox } from "dropbox";
import fetch from "node-fetch";
import { promisify } from "util";
import fs from "fs";
import formidable from "formidable";
import { refreshDropboxToken } from "./api-server";
import { loadTokensFromFile } from "./save-tokens";

const fsUnlink = promisify(fs.unlink);

type TArgs = {
  fileName: string;
  fileContent: Buffer;
  file: formidable.File;
  fileUrl?: string;
  avatarForRemove?: string;
};

export const dropboxSaveFile = async ({
  fileName,
  fileContent,
  fileUrl,
  file,
  avatarForRemove,
}: TArgs) => {
  let tokens = loadTokensFromFile();

  if (!tokens) {
    tokens = await refreshDropboxToken();
  }

  try {
    const dbx = new Dropbox({
      accessToken: tokens.access_token,
      fetch: fetch,
    });

    const response = await dbx.filesUpload({
      path: `/${fileName}`,
      contents: fileContent,
    });

    const sharedLinkResponse = await dbx.sharingCreateSharedLinkWithSettings({
      path: response.result.path_display!,
      settings: {
        requested_visibility: { ".tag": "public" },
      },
    });

    fileUrl = sharedLinkResponse.result.url.replace("dl=0", "raw=1"); // преобразование URL для прямого доступа к изображению
    await fsUnlink(file.filepath);

    if (avatarForRemove && fileUrl) {
      try {
        await dbx.filesDeleteV2({ path: avatarForRemove });
      } catch (deleteError) {
        console.error(
          `111111, Failed to delete old file: ${avatarForRemove}`,
          deleteError
        );
      }
    }
  } catch (e) {
    if ((e as any).message.error_summary.startsWith("expired_access_token")) {
      await refreshDropboxToken();
      dropboxSaveFile({ fileName, fileContent, fileUrl, file });
    } else {
      console.log(e);
    }
  }
};
