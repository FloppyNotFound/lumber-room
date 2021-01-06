export interface AuthServiceContract {
  getAccessToken(): PromiseLike<string>;

  setAccessToken(
    newAccessToken: string,
    newAccessTokenExpiresInXSeconds: number
  ): PromiseLike<string>;
}
