import Dexie from "dexie";
import type { AuthTable } from "./tables/auth.table";

export class LumberRoomDatabase extends Dexie {
  static readonly databaseName = "LumberRoom";

  authTable: Dexie.Table<AuthTable, number>;

  constructor() {
    super(LumberRoomDatabase.databaseName);

    this.version(1).stores({
      authTable: "++id,accessToken",
    });

    this.authTable = this.table("authTable");
  }
}
