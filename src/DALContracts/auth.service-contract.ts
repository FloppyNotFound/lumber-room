export interface AuthServiceContract {
  getAccessToken(): PromiseLike<string | undefined>;

  setAccessToken(
    newAccessToken: string,
    newAccessTokenExpiresInXSeconds: number
  ): PromiseLike<string>;

  getRefreshToken(): PromiseLike<string | undefined>;

  setRefreshToken(refreshToken: string): PromiseLike<string | undefined>;

  getCodeVerifier(): PromiseLike<string | undefined>;

  setCodeVerifier(newCodeVerifier: string): PromiseLike<string>;

  logout(): PromiseLike<void>;
}
