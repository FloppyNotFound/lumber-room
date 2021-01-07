<script lang="ts">
  import { onMount } from "svelte";
  import parseAuthQueryString from "./UI/Auth/helpers/parse-auth-query-string";
  import { authStore } from "./UI/Auth/auth-store";
  import { AuthService } from "./DAL/services/auth.service";
  import Auth from "./UI/Auth/Auth.svelte";
  import ListWrapper from "./UI/ListWrapper/ListWrapper.svelte";
  import Header from "./UI/Header/Header.svelte";
  import SoftKeys from "./UI/SoftKeys/SoftKeys.svelte";
  import { softkeysStore } from "./UI/SoftKeys/softkeys-store";

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

    initSoftkeys();
  });

  const initSoftkeys = (): void => {
    softkeysStore.setLeft({
      label: "Back",
      callback: () => {
        return new Promise((resolve) => {
          console.log("You clicked on SoftLeft");
          resolve();
        });
      },
    });

    softkeysStore.setCenter({
      label: "SELECT",
      callback: () => {
        return new Promise((resolve) => {
          console.log("You clicked on SoftCenter");
          resolve();
        });
      },
    });

    softkeysStore.setRight({
      label: "Options",
      callback: () => {
        return new Promise((resolve) => {
          console.log("You clicked on SoftRight");
          resolve();
        });
      },
    });
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    authStore.set(void 0);
  };
</script>

<style lang="scss">
  .app-wrapper {
    display: flex;
    flex-direction: column;

    main {
      text-align: center;
      padding: 1rem 0 2rem 0;

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
  }
</style>

<div class="app-wrapper">
  <Header />

  <main>
    <section>
      {#if !$authStore}
        <Auth {clientId} />
      {:else}
        <ListWrapper accessToken={$authStore} on:autherror={logout} />
      {/if}
    </section>
  </main>

  <SoftKeys softkeys={$softkeysStore} />
</div>
