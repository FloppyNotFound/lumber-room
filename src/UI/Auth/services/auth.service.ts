import type { DropboxAuth, DropboxAuthOptions } from "dropbox";
import type { PkceDropboxAuthAccessTokenData } from "../models/pkce-dropbox-auth-access-token-data.interface";
import type { PkceDropboxAuthAccessTokenResponse } from "../models/pkce-dropbox-auth-access-token-response.interface";
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
    let token: PkceDropboxAuthAccessTokenResponse;

    try {
      const response = await AuthService._dbx.getAccessTokenFromCode(
        this._redirectUrl,
        accessCode
      );
      token = <PkceDropboxAuthAccessTokenResponse>response.result;
    } catch (error) {
      console.error(error);

      return void 0;
    }

    const accessToken = token.access_token;
    AuthService._dbx.setAccessToken(accessToken);

    const expiresInSeconds = token.expires_in;
    const expiresAt = this.getExpiresAt(expiresInSeconds, new Date());
    AuthService._dbx.setAccessTokenExpiresAt(expiresAt);

    // @ts-ignore
    const refreshToken = token.refresh_token;
    AuthService._dbx.setRefreshToken(refreshToken);
    // TODO: check token.scope (will look like this: account_info.read files.content.read files.content.write files.metadata.read files.metadata.writes)

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

    const newAccessToken = AuthService._dbx.getAccessToken();
    const expiresInSeconds = this.getExpiresInSeconds(
      AuthService._dbx.getAccessTokenExpiresAt(),
      new Date()
    );

    return {
      accessToken: newAccessToken,
      accessTokenExpiresInSeconds: expiresInSeconds,
    };
  }

  private getExpiresAt(expiresInSeconds: number, now: Date) {
    const expiresAt = now;
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
    return expiresAt;
  }

  private getExpiresInSeconds(expiresAt: Date, now: Date): number {
    let expiresInSeconds = Math.round(
      (expiresAt.getTime() - now.getTime()) / 1000
    );

    if (expiresInSeconds < 0) expiresInSeconds = 0;

    return expiresInSeconds;
  }
}
