<script lang="ts">
  import { AuthService } from "./services/auth.service";
  import { createEventDispatcher } from "svelte";

  export let clientId: string;
  export let codeVerifier: string;

  let authLink: string;
  let authService: AuthService;

  const dispatch = createEventDispatcher();

  const loginRequested = async (): Promise<void> => {
    authService = new AuthService(clientId);

    authLink = await authService.getAuthenticationUrl();

    codeVerifier = authService.getCodeVerifier();

    dispatch("login", { codeVerifier, authLink });
  };
</script>

<h2>Please login</h2>
<button id="login" data-l10n-id="auth-login-cta" on:click="{loginRequested}"
  >Login</button>
