<script lang="ts">
  export let name: string;

  const loginRequested = (): void => {
    console.log("login requested");
    console.log("TODO");
  };
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
    <h1 data-l10n-id="app_title">Privileged app</h1>
  </section>
  <section>
    <p>Goodbye {name}</p>
    <input />
    <button
      id="login"
      data-l10n-id="login"
      on:click={loginRequested}>Login</button>
  </section>
</main>

<!-- https://github.com/kaiostech/sample-vanilla/blob/master/src/index.js -->
<!-- https://stackoverflow.com/questions/55842088/svelte-hot-reloading-issue -->
