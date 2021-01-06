<script lang="ts">
  import { onMount } from "svelte";
  import parseAuthQueryString from "./Auth/helpers/parse-auth-query-string";
  import Auth from "./Auth/Auth.svelte";
  import { authStore } from "./Auth/auth-store";
  import ListWrapper from "./ListWrapper/ListWrapper.svelte";
  import { AuthService } from "./DAL/services/auth.service";

  const clientId = "oejf5drg46j71z6";

  const authService = new AuthService();

  onMount(async () => {
    const parsedAuthString = parseAuthQueryString(window.location.hash);
    const newAccessToken = parsedAuthString["access_token"];
    const newAccessTokenExpiresInXSeconds =
      parsedAuthString["expires_in"] ?? "0";

    const accessToken = await (!newAccessToken
      ? authService.getAccessToken()
      : authService.setAccessToken(
          newAccessToken,
          newAccessTokenExpiresInXSeconds
        ));

    authStore.set(accessToken);
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
