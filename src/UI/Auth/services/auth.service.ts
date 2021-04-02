import type { DropboxAuth, DropboxAuthOptions } from "dropbox";
import type { DropboxPkceAuthOptions } from "../models/pkce-dropbox-auth-options.interface";

export class AuthService {
  dropboxOptions: DropboxPkceAuthOptions;

  private static _dbx: DropboxAuth;
  private readonly _redirectUrl = "http://localhost:5000";

  /**
   * @param clientId: Dropbox Client Id
   * @param codeVerifier: A previously cached PKCE code verifier, if available
   */
  constructor(clientId: string, codeVerifier?: string) {
    this.dropboxOptions = <DropboxAuthOptions>{
      clientId,
      codeVerifier,
    };

    if (!AuthService._dbx) {
      // @ts-ignore
      AuthService._dbx = new Dropbox.DropboxAuth(this.dropboxOptions);
      AuthService._dbx.setCodeVerifier(codeVerifier);
    }
  }

  // TODO: set correct redirect url
  // TODO: https://developer.kaiostech.com/getting-started/main-concepts/manifest
  // TODO: https://www.dropbox.com/lp/developers/reference/oauth-guide
  // see https://www.dropbox.com/developers/documentation/http/documentation
  getAuthenticationUrl(): Promise<string> {
    return AuthService._dbx
      .getAuthenticationUrl(
        this._redirectUrl,
        void 0,
        "code",
        "offline",
        void 0,
        void 0,
        true
      )
      .then((res) => res.toString());
  }

  getCodeVerifier(): string | undefined {
    // @ts-ignore
    return AuthService._dbx.codeVerifier;
  }

  setCodeVerifier(verifier: string): void {
    // @ts-ignore
    AuthService._dbx.codeVerifier = verifier;
  }

  requestAccessToken(
    accessCode: string
  ): Promise<void | { accessToken: string; accessTokenExpiresIn: number }> {
    return AuthService._dbx
      .getAccessTokenFromCode(this._redirectUrl, accessCode)
      .then((token) => {
        // @ts-ignore
        const accessToken = token.result.access_token;
        AuthService._dbx.setAccessToken(accessToken);

        // @ts-ignore
        const expiresIn = token.result.expires_in;
        return { accessToken, accessTokenExpiresIn: expiresIn };
      })
      .catch((error) => console.error(error));
  }
}
