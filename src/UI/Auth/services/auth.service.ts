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
      // @ts-ignore
      AuthService._dbx.codeVerifier = codeVerifier;
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
        void 0,
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

  requestAccessToken(accessCode: string): Promise<unknown> {
    console.log(
      "requestAccessToken with access code",
      accessCode,
      AuthService._dbx
    );

    return AuthService._dbx
      .getAccessTokenFromCode(this._redirectUrl, accessCode)
      .then((token) => {
        console.log("token", token);

        // @ts-ignore
        const refreshToken = token.result.refresh_token;
        AuthService._dbx.setRefreshToken(refreshToken);
      })
      .catch((error) => console.error(error));
  }
}
// https://www.dropbox.com/oauth2/authorize?client_id=<APP_KEY>&response_type=code&code_challenge=<CHALLENGE>&code_challenge_method=<METHOD>
// https://www.dropbox.com/oauth2/authorize?response_type=code&client_id=oejf5drg46j71z6&redirect_uri=http://localhost:5000&token_access_type=offline&code_challenge_method=S256&code_challenge=NTQsMTQxLDE3MywzLDIxMywxMDUsNzIsMTE3LDc0LDE3MSwyMjgsMTkyLDExNCwyMzcsNDQsMTg4LDI4LDIyMyw1OSw0Niw3OCwzNSw5NCwxMzYsODYsMTA5LDE5NCwx
