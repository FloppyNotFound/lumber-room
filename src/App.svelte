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
    if (accessToken) {
      authStore.set(accessToken);
      initSoftkeys();
      return;
    }

    const pkceCodeVerifier = await authDbService.getCodeVerifier();
    if (!pkceCodeVerifier) {
      setLoginActive();
      return;
    }

    const pkceCode = getQueryVariable(
      window.location.search.substring(1),
      "code"
    );
    if (!pkceCode) {
      resetLogin();
      return;
    }

    const newAccessToken = await getNewAccessToken(pkceCodeVerifier, pkceCode);
    if (!newAccessToken) {
      resetLogin();
      return;
    }

    authDbService.setAccessToken(
      newAccessToken.accessToken,
      newAccessToken.accessTokenExpiresIn
    );
    authStore.set(newAccessToken.accessToken);

    initSoftkeys();

    setCursorActive(false);
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

  const setLoginActive = () => {
    setCursorActive(true);
    isLoginRequired = true;
  };

  const login = async (
    codeVerifierEvent: CustomEvent<{ codeVerifier: string; authLink: string }>
  ): Promise<void> => {
    await authDbService.setCodeVerifier(codeVerifierEvent.detail.codeVerifier);

    document.location.href = codeVerifierEvent.detail.authLink;
  };

  const resetLogin = async (): Promise<void> => {
    toastStore.warn("Your session timed out, please re-login");

    await authDbService.logout();
    authStore.set(void 0);

    setLoginActive();
  };

  const showListWrapperWarning = (msg: CustomEvent<ListWrapperToast>): void =>
    toastStore.warn(msg.detail.message);

  const showListWrapperError = (msg: CustomEvent<ListWrapperToast>): void =>
    toastStore.alert(msg.detail.message);

  const setCursorActive = (isActive: boolean) =>
    // @ts-ignore
    (navigator.spatialNavigationEnabled = isActive);

  const getNewAccessToken = async (codeVerifier: string, code: string) => {
    const authService = new AuthService(clientId, codeVerifier);
    const newAccessToken = await authService.requestAccessToken(code);
    return newAccessToken;
  };
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
          on:autherror="{resetLogin}"
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
