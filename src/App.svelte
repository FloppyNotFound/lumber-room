<script lang="ts">
  import { onMount } from "svelte";
  import parseAuthQueryString from "./UI/Auth/helpers/parse-auth-query-string";
  import { authStore } from "./UI/Auth/auth-store";
  import { AuthService } from "./DAL/services/auth.service";
  import Auth from "./UI/Auth/Auth.svelte";
  import ListWrapper from "./UI/ListWrapper/ListWrapper.svelte";
  import Header from "./UI/Header/Header.svelte";
  import SoftKeys from "./UI/SoftKeys/SoftKeys.svelte";
  import Toast from "./UI/Toast/Toast.svelte";
  import { softkeysStore } from "./UI/SoftKeys/softkeys-store";
  import { toastStore } from "./UI/Toast/toast-store";
  import type { ListWrapperToast } from "./UI/ListWrapper/models/list-wrapper-toast.model";

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
    /* softkeysStore.setLeft({
      label: "Back",
      callback: () => {
        return new Promise((resolve) => {
          console.log("You clicked on SoftLeft");
          resolve();
        });
      },
    }); */

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
    toastStore.warn("Your session timed out, please re-login");
    await authService.logout();
    authStore.set(void 0);
  };

  const showListWrapperWarning = (msg: CustomEvent<ListWrapperToast>): void =>
    toastStore.warn(msg.detail.message);

  const showListWrapperError = (msg: CustomEvent<ListWrapperToast>): void =>
    toastStore.alert(msg.detail.message);
</script>

<div class="app-wrapper">
  <Toast />

  <Header />

  <main>
    <section style="margin-top: 0.3rem">
      {#if !$authStore}
        <Auth clientId="{clientId}" />
      {:else}
        <ListWrapper
          accessToken="{$authStore}"
          on:autherror="{logout}"
          on:warn="{showListWrapperWarning}"
          on:error="{showListWrapperError}" />
      {/if}
    </section>
  </main>

  <SoftKeys />
</div>

<style lang="scss">
  .app-wrapper {
    display: flex;
    flex-direction: column;

    main {
      padding: 0.7rem 0 2rem 0;
    }
  }
</style>
