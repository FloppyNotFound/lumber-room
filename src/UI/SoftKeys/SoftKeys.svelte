<script lang="ts">
  import { SoftkeyBinding } from "./enums/softkey-binding.enum";
  import type { Softkeys } from "./models/softkeys.model";

  export let softkeys: Softkeys = {};

  const keyDownHandler = (evt: KeyboardEvent): void => {
    switch (evt.key) {
      case SoftkeyBinding.Left: {
        if (!softkeys.left?.callback) {
          return;
        }

        softkeys.left.callback();
        break;
      }
      case SoftkeyBinding.Center: {
        if (!softkeys.center?.callback) {
          return;
        }

        softkeys.center.callback();
        break;
      }
      case SoftkeyBinding.Right: {
        if (!softkeys.right?.callback) {
          return;
        }

        softkeys.right.callback();
        break;
      }
    }
  };

  document.addEventListener("keydown", keyDownHandler);
</script>

<style lang="scss">
  .footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;

    &__softkeys {
      display: flex;
      justify-content: space-between;
      background-color: #cccccc;
      color: #323232;
      padding: 0 0.5rem 0 0.5rem;

      h5 {
        margin: 0.25rem;
        font-weight: 600;
      }
    }
  }
</style>

<footer class="footer">
  <div class="footer__softkeys">
    {#if softkeys.left}
      <h5 on:click={keyDownHandler.bind(this, { key: 'SoftLeft' })}>
        {softkeys.left.label}
      </h5>
    {/if}
    {#if softkeys.center}
      <h5 on:click={keyDownHandler.bind(this, { key: 'Enter' })}>
        {softkeys.center.label}
      </h5>
    {/if}
    {#if softkeys.right}
      <h5 on:click={keyDownHandler.bind(this, { key: 'SoftRight' })}>
        {softkeys.right.label}
      </h5>
    {/if}
  </div>
</footer>
