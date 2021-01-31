import type { DropboxAuthOptions } from "dropbox";

export interface DropboxPkceAuthOptions extends DropboxAuthOptions {
  codeChallenge?: string;
  codeVerifier?: string;
}
