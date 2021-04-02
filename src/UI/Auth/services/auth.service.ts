import type { DropboxAuth, DropboxAuthOptions, DropboxResponse } from "dropbox";
import type { PkceDropboxAuthAccessTokenData } from "../models/pkce-dropbox-auth-access-token-data.interface";
import type { PkceDropboxAuthTokenData } from "../models/pkce-dropbox-auth-token-data.interface";

export class AuthService {
  private static _dbx: DropboxAuth;
  private readonly _redirectUrl = "http://localhost:5000";

  /**
   * @param clientId: Dropbox Client Id
   * @param codeVerifier: A previously cached PKCE code verifier, if available
   */
  constructor(clientId: string, codeVerifier?: string, refreshToken?: string) {
    const dropboxOptions = <DropboxAuthOptions>{
      clientId,
    };

    if (!AuthService._dbx) {
      // @ts-ignore
      AuthService._dbx = new Dropbox.DropboxAuth(dropboxOptions);
      AuthService._dbx.setCodeVerifier(codeVerifier);
      AuthService._dbx.setRefreshToken(refreshToken);
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

  async requestAccessToken(
    accessCode: string
  ): Promise<PkceDropboxAuthTokenData | undefined> {
    let token: DropboxResponse<object>;

    try {
      token = await AuthService._dbx.getAccessTokenFromCode(
        this._redirectUrl,
        accessCode
      );
    } catch (error) {
      console.error(error);

      return void 0;
    }

    // @ts-ignore
    const accessToken = token.result.access_token;
    AuthService._dbx.setAccessToken(accessToken);

    // @ts-ignore
    const expiresInSeconds = token.result.expires_in;
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
    AuthService._dbx.setAccessTokenExpiresAt(expiresAt);

    // @ts-ignore
    const refreshToken = token.result.refresh_token;
    AuthService._dbx.setRefreshToken(refreshToken);
    // TODO: check scopes (will look like this: account_info.read files.content.read files.content.write files.metadata.read files.metadata.writes)

    return {
      accessToken,
      accessTokenExpiresInSeconds: expiresInSeconds,
      refreshToken,
    };
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<PkceDropboxAuthAccessTokenData | undefined> {
    AuthService._dbx.setRefreshToken(refreshToken);

    try {
      // Method actually returns a Promise, not void
      // see https://github.com/dropbox/dropbox-sdk-js/issues/606
      // @ts-ignore
      await AuthService._dbx.refreshAccessToken();
    } catch (error) {
      console.error(error);
      return void 0;
    }

    const accessToken = AuthService._dbx.getAccessToken();

    let expiresInSeconds = Math.round(
      (AuthService._dbx.getAccessTokenExpiresAt().getTime() -
        new Date().getTime()) /
        1000
    );

    if (expiresInSeconds < 0) expiresInSeconds = 0;

    return { accessToken, accessTokenExpiresInSeconds: expiresInSeconds };
  }
}
