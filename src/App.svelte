<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "./UI/Auth/auth-store";
  import { AuthDbService } from "./DAL/services/auth-db.service";
  import Auth from "./UI/Auth/Auth.svelte";
  import ListWrapper from "./UI/ListWrapper/ListWrapper.svelte";
  import Header from "./UI/Header/Header.svelte";
  import SoftKeys from "./UI/SoftKeys/SoftKeys.svelte";
  import DPad from "./UI/DPad/DPad.svelte";
  import Toast from "./UI/Toast/Toast.svelte";
  import { softkeysStore } from "./UI/SoftKeys/softkeys-store";
  import { toastStore } from "./UI/Toast/toast-store";
  import type { ListWrapperToast } from "./UI/ListWrapper/models/list-wrapper-toast.model";
  import getQueryVariable from "./UI/Auth/helpers/get-query-variable";
  import { AuthService } from "./UI/Auth/services/auth.service";

  const clientId = "oejf5drg46j71z6";

  const authDbService = new AuthDbService();

  let isLoginRequired: boolean;

  onMount(async () => {
    const accessToken = await authDbService.getAccessToken();

    // Check if access token is cached and still valid, if not, refresh access token
    if (accessToken) {
      authStore.set(accessToken);
      initSoftkeys();
      return;
    }

    const codeVerifier = await authDbService.getCodeVerifier();
    console.log("cached code verifier", codeVerifier);

    // Cursor is needed for Dropbox login
    if (!codeVerifier) {
      // @ts-ignore
      navigator.spatialNavigationEnabled = true;
      isLoginRequired = true;
      return;
    }

    let code = getQueryVariable(window.location.search.substring(1), "code");
    if (!code) {
      // Request new code
      throw Error("Auth error");
    }

    // @ts-ignore
    navigator.spatialNavigationEnabled = false;
    const authService = new AuthService(clientId, codeVerifier);
    console.log(authService);

    await authService.getAuthenticationUrl();
    authService.setCodeVerifier(codeVerifier);
    const newAccessToken = await authService.requestAccessToken(code);

    console.log("new access token", newAccessToken);

    // todo
    authDbService.setAccessToken(<string>newAccessToken, 0);
    /* authService.setAccessToken(
          newAccessToken,
          newAccessTokenExpiresInXSeconds
        ) */

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

  const login = async (
    codeVerifierEvent: CustomEvent<{ codeVerifier: string; authLink: string }>
  ): Promise<void> => {
    console.log("save code verifier to db");

    await authDbService.setCodeVerifier(codeVerifierEvent.detail.codeVerifier);

    document.location.href = codeVerifierEvent.detail.authLink;
  };

  const logout = async (): Promise<void> => {
    toastStore.warn("Your session timed out, please re-login");
    await authDbService.logout();
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
    <section>
      {#if isLoginRequired && !$authStore}
        <Auth clientId="{clientId}" on:login="{login}" />
      {:else if !$authStore}
        <div>Authenticating...</div>
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
  <DPad className="{'list-view-item'}" correction="{-46}" />
</div>

<style lang="scss">
  .app-wrapper {
    display: flex;
    flex-direction: column;
    margin-top: -0.5rem;

    main {
      margin-top: 1.25rem;
      section {
        margin-bottom: 1.5rem;
      }
    }
  }
</style>
