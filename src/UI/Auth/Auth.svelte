<script lang="ts">
  import type { DropboxAuth, DropboxAuthOptions } from "dropbox";

  export let clientId: string;

  const dropboxOptions: DropboxAuthOptions = {
    clientId,
  };

  // @ts-ignore
  const dbx: DropboxAuth = new Dropbox.DropboxAuth(dropboxOptions);

  // TODO: set correct redirect url
  // TODO: https://developer.kaiostech.com/getting-started/main-concepts/manifest
  // TODO: https://www.dropbox.com/lp/developers/reference/oauth-guide
  // see https://www.dropbox.com/developers/documentation/http/documentation
  const authLink = dbx.getAuthenticationUrl(
    "http://localhost:5000",
    void 0,
    // TODO: use "code" once PKCE-Flow is fixed
    "token",
    // TODO: use "offline" once PKCE-Flow is fixed
    "online",
    void 0,
    void 0,
    // TODO: use PKCE-Flow (Crypto-Error: https://github.com/dropbox/dropbox-sdk-js/issues/489)
    false
  );

  const loginRequested = (): void => {
    document.location.href = authLink;
  };
</script>

<h2>Please login</h2>
<button id="login" data-l10n-id="auth-login-cta" on:click="{loginRequested}"
  >Login</button>
