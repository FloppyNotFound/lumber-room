import type { Dropbox, DropboxAuth, DropboxAuthOptions } from 'dropbox';
import type { PkceDropboxAuthAccessTokenData } from '../models/pkce-dropbox-auth-access-token-data.interface';
import type { PkceDropboxAuthAccessTokenResponse } from '../models/pkce-dropbox-auth-access-token-response.interface';
import type { PkceDropboxAuthTokenData } from '../models/pkce-dropbox-auth-token-data.interface';

export default class AuthService {
  private static _dbx: DropboxAuth;

  private readonly _redirectUrl = 'http://localhost:5000';

  // eslint-disable-next-line class-methods-use-this
  private get _dbxInstance(): DropboxAuth {
    return AuthService._dbx; // eslint-disable-line no-underscore-dangle
  }

  // eslint-disable-next-line class-methods-use-this
  private set _dbxInstace(val: DropboxAuth) {
    AuthService._dbx = val; // eslint-disable-line no-underscore-dangle
  }

  /**
   * @param clientId: Dropbox Client Id
   * @param codeVerifier: A previously cached PKCE code verifier, if available
   */
  constructor(clientId: string, codeVerifier?: string, refreshToken?: string) {
    const dropboxOptions = <DropboxAuthOptions>{
      clientId,
    };

    if (!this._dbxInstance) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const inst: DropboxAuth = new Dropbox.DropboxAuth(dropboxOptions); // eslint-disable-line
      this._dbxInstace = inst;

      if (codeVerifier) inst.setCodeVerifier(codeVerifier); // eslint-disable-line
      if (refreshToken) inst.setRefreshToken(refreshToken); // eslint-disable-line
    }
  }

  getAuthenticationUrl(): Promise<string> {
    return this._dbxInstance
      .getAuthenticationUrl(
        this._redirectUrl,
        void 0,
        'code',
        'offline',
        void 0,
        void 0,
        true
      )
      .then((res) => res.toString());
  }

  getCodeVerifier(): string | undefined {
    return this._dbxInstance.getCodeVerifier();
  }

  setCodeVerifier(verifier: string): void {
    this._dbxInstance.setCodeVerifier(verifier);
  }

  async requestAccessToken(
    accessCode: string
  ): Promise<PkceDropboxAuthTokenData | undefined> {
    let token: PkceDropboxAuthAccessTokenResponse;

    try {
      const response = await this._dbxInstance.getAccessTokenFromCode(
        this._redirectUrl,
        accessCode
      );
      token = <PkceDropboxAuthAccessTokenResponse>response.result;
    } catch (error) {
      console.error(error);

      return void 0;
    }

    const accessToken = token.access_token;
    this._dbxInstance.setAccessToken(accessToken);

    const expiresInSeconds = token.expires_in;
    const expiresAt = this._getExpiresAt(expiresInSeconds, new Date());
    this._dbxInstance.setAccessTokenExpiresAt(expiresAt);

    const refreshToken = token.refresh_token;
    this._dbxInstance.setRefreshToken(refreshToken);
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
    this._dbxInstance.setRefreshToken(refreshToken);

    try {
      // Method actually returns a Promise, not void
      // see https://github.com/dropbox/dropbox-sdk-js/issues/606
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      await this._dbxInstance.refreshAccessToken(); // eslint-disable-line @typescript-eslint/await-thenable
    } catch (error) {
      console.error(error);

      return void 0;
    }

    const newAccessToken = this._dbxInstance.getAccessToken();
    const expiresInSeconds = this.getExpiresInSeconds(
      this._dbxInstance.getAccessTokenExpiresAt(),
      new Date()
    );

    return {
      accessToken: newAccessToken,
      accessTokenExpiresInSeconds: expiresInSeconds,
    };
  }

  private _getExpiresAt = (expiresInSeconds: number, now: Date): Date => {
    const expiresAt = now;
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
    return expiresAt;
  };

  private getExpiresInSeconds = (expiresAt: Date, now: Date): number => {
    let expiresInSeconds = Math.round(
      (expiresAt.getTime() - now.getTime()) / 1000
    );

    if (expiresInSeconds < 0) expiresInSeconds = 0;

    return expiresInSeconds;
  };
}
