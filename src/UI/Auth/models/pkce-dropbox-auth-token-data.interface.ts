import type { PkceDropboxAuthAccessTokenData } from "./pkce-dropbox-auth-access-token-data.interface";

export interface PkceDropboxAuthTokenData
  extends PkceDropboxAuthAccessTokenData {
  refreshToken: string;
}
