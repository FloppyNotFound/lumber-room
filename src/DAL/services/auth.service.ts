import { LumberRoomDatabase } from "../lumber-room.database";
import type { AuthTable } from "../tables/auth.table";
import type { AuthServiceContract } from "../../DALContracts/auth.service-contract";

export class AuthService implements AuthServiceContract {
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
      await this._db.authTable.clear();

      await this._db.authTable.add({
        accessToken: newAccessToken,
        validUntil: new Date(
          new Date().getTime() + Number(newAccessTokenExpiresInXSeconds) * 1000
        ),
      });

      return newAccessToken;
    });
  }

  logout(): PromiseLike<void> {
    return this._db.transaction(
      "rw",
      this._db.authTable,
      async () => await this._db.authTable.clear()
    );
  }

  private getCachedAccessToken(authTable: AuthTable[]): string | undefined {
    const authData = authTable.length ? authTable[0] : void 0;
    if (!authData) {
      return void 0;
    }

    const { accessToken, validUntil } = authData;

    if (validUntil <= new Date()) {
      return void 0;
    }

    return accessToken;
  }
}
