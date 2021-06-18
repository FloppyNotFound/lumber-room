<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AuthService from './services/auth.service';

  export let clientId: string;

  let authLink: string;
  let authService: AuthService;

  const dispatch = createEventDispatcher();

  const loginRequested = async (): Promise<void> => {
    authService = new AuthService(clientId);

    authLink = await authService.getAuthenticationUrl();

    const verifier = authService.getCodeVerifier();

    dispatch('login', { codeVerifier: verifier, authLink });
  };
</script>

<h2>Please login</h2>
<button id="login" data-l10n-id="auth-login-cta" on:click="{loginRequested}"
  >Login</button>
