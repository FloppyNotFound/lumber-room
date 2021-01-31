export interface AuthTable {
  id?: number;
  codeVerifier?: string;
  accessToken?: string;
  accessTokenValidUntil?: Date;
}
