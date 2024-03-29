import LumberRoomDatabase from '../lumber-room.database';
import type { AuthTable } from '../tables/auth.table';
import type { AuthServiceContract } from '../../DALContracts/auth.service-contract';

export default class AuthDbService implements AuthServiceContract {
  private _db: LumberRoomDatabase;

  private _getAuthData = (authTable: AuthTable[]): AuthTable | undefined =>
    authTable.length ? authTable[0] : void 0;

  constructor() {
    this._db = new LumberRoomDatabase();
  }

  getAccessToken(): PromiseLike<string | undefined> {
    return this._db.transaction('r', this._db.authTable, async () => {
      const authTable = await this._db.authTable.toArray();
      return this.getCachedAccessToken(authTable);
    });
  }

  setAccessToken(
    newAccessToken: string,
    newAccessTokenExpiresInSeconds: number
  ): PromiseLike<string> {
    return this._db.transaction('rw', this._db.authTable, async () => {
      const authInfo = (await this._db.authTable.toArray())[0];
      const { id } = authInfo;

      if (!id) return Promise.reject();

      await this._db.authTable.update(id, {
        accessToken: newAccessToken,
        accessTokenValidUntil: new Date(
          new Date().getTime() + Number(newAccessTokenExpiresInSeconds) * 1000
        ),
      });

      return newAccessToken;
    });
  }

  getRefreshToken(): PromiseLike<string | undefined> {
    return this._db.transaction('r', this._db.authTable, async () => {
      const authTable = await this._db.authTable.toArray();
      return this.getCachedRefreshToken(authTable);
    });
  }

  setRefreshToken(refreshToken: string): PromiseLike<string | undefined> {
    return this._db.transaction('rw', this._db.authTable, async () => {
      const authInfo = (await this._db.authTable.toArray())[0];
      const { id } = authInfo;

      if (!id) return Promise.reject();

      await this._db.authTable.update(id, {
        refreshToken,
        accessToken: void 0,
        accessTokenValidUntil: void 0,
      });

      return refreshToken;
    });
  }

  getCodeVerifier(): PromiseLike<string | undefined> {
    return this._db.transaction('r', this._db.authTable, async () => {
      const authTable = await this._db.authTable.toArray();
      return this.getCachedCodeVerifier(authTable);
    });
  }

  setCodeVerifier(newCodeVerifier: string): PromiseLike<string> {
    return this._db.transaction('rw', this._db.authTable, async () => {
      await this._db.authTable.clear();

      await this._db.authTable.add({
        codeVerifier: newCodeVerifier,
        accessToken: void 0,
        accessTokenValidUntil: void 0,
        refreshToken: void 0,
      });

      return newCodeVerifier;
    });
  }

  logout(): PromiseLike<void> {
    return this._db.transaction('rw', this._db.authTable, async () =>
      this._db.authTable.clear()
    );
  }

  private getCachedCodeVerifier(authTable: AuthTable[]): string | undefined {
    const authData = this._getAuthData(authTable);
    if (!authData) {
      return void 0;
    }

    const { codeVerifier } = authData;

    return codeVerifier;
  }

  private getCachedAccessToken(authTable: AuthTable[]): string | undefined {
    const authData = this._getAuthData(authTable);
    if (!authData) {
      return void 0;
    }

    const { accessToken, accessTokenValidUntil } = authData;

    if (!accessTokenValidUntil || accessTokenValidUntil <= new Date()) {
      return void 0;
    }

    return accessToken;
  }

  private getCachedRefreshToken(authTable: AuthTable[]): string | undefined {
    const authData = this._getAuthData(authTable);
    if (!authData) {
      return void 0;
    }

    return authData.refreshToken;
  }
}
