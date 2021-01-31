import { LumberRoomDatabase } from "../lumber-room.database";
import type { AuthTable } from "../tables/auth.table";
import type { AuthServiceContract } from "../../DALContracts/auth.service-contract";

export class AuthDbService implements AuthServiceContract {
  private _db: LumberRoomDatabase;

  constructor() {
    this._db = new LumberRoomDatabase();
  }

  getAccessToken(): PromiseLike<string> {
    return this._db.transaction("r", this._db.authTable, async () => {
      const authTable = await this._db.authTable.toArray();
      return this.getCachedAccessToken(authTable);
    });
  }

  setAccessToken(
    newAccessToken: string,
    newAccessTokenExpiresInXSeconds: number
  ): PromiseLike<string> {
    return this._db.transaction("rw", this._db.authTable, async () => {
      const authInfo = (await this._db.authTable.toArray())[0];

      await this._db.authTable.update(authInfo.id, {
        accessToken: newAccessToken,
        accessTokenValidUntil: new Date(
          new Date().getTime() + Number(newAccessTokenExpiresInXSeconds) * 1000
        ),
      });

      return newAccessToken;
    });
  }

  getCodeVerifier(): PromiseLike<string> {
    return this._db.transaction("r", this._db.authTable, async () => {
      const authTable = await this._db.authTable.toArray();
      return this.getCachedCodeVerifier(authTable);
    });
  }

  setCodeVerifier(newCodeVerifier: string): PromiseLike<string> {
    return this._db.transaction("rw", this._db.authTable, async () => {
      await this._db.authTable.clear();

      await this._db.authTable.add({
        codeVerifier: newCodeVerifier,
        accessToken: void 0,
        accessTokenValidUntil: void 0,
      });

      return newCodeVerifier;
    });
  }

  logout(): PromiseLike<void> {
    return this._db.transaction(
      "rw",
      this._db.authTable,
      async () => await this._db.authTable.clear()
    );
  }

  private getCachedCodeVerifier(authTable: AuthTable[]): string | undefined {
    const authData = authTable.length ? authTable[0] : void 0;
    if (!authData) {
      return void 0;
    }

    const { codeVerifier } = authData;

    return codeVerifier;
  }

  private getCachedAccessToken(authTable: AuthTable[]): string | undefined {
    const authData = authTable.length ? authTable[0] : void 0;
    if (!authData) {
      return void 0;
    }

    const { accessToken, accessTokenValidUntil } = authData;

    if (accessTokenValidUntil <= new Date()) {
      return void 0;
    }

    return accessToken;
  }
}
