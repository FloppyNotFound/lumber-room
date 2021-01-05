<script lang="ts">
  import { onMount } from "svelte";
  import parseAuthQueryString from "./Auth/helpers/parse-auth-query-string";
  import Auth from "./Auth/Auth.svelte";
  import { authStore } from "./Auth/auth-store";
  import ListWrapper from "./ListWrapper/ListWrapper.svelte";
  import { LumberRoomDatabase } from "./DAL/lumber-room.database";

  const clientId = "oejf5drg46j71z6";

  const db = new LumberRoomDatabase();

  onMount(async () => {
    await db.transaction("rw", db.authTable, async () => {
      const parsedAuthString = parseAuthQueryString(window.location.hash);

      const authTable = await db.authTable.toArray();
      const cachedAccessToken = authTable.length
        ? authTable[0].accessToken
        : void 0;

      const newAccessToken =
        parsedAuthString["access_token"] ?? cachedAccessToken;

      if (cachedAccessToken !== newAccessToken) {
        await db.authTable.clear();
        await db.authTable.add({ accessToken: newAccessToken });
      }

      authStore.set(newAccessToken);
    });
  });
</script>

<style lang="scss">
  main {
    text-align: center;
    padding: 1rem;
    max-width: 240px;
    margin: 0 auto;

    h1 {
      color: red;
      text-transform: uppercase;
      font-size: 1rem;
      font-weight: 600;
    }
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>

<main>
  <section>
    <h1 data-l10n-id="app_title">APP_TITLE</h1>
  </section>
  <section>
    {#if !$authStore}
      <Auth {clientId} />
    {:else}
      <ListWrapper accessToken={$authStore} />
    {/if}
  </section>
</main>
