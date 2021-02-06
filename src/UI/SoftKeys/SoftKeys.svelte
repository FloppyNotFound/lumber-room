<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { SoftkeyBinding } from "./enums/softkey-binding.enum";
  import type { Softkeys } from "./models/softkeys.model";
  import { softkeysStore } from "./softkeys-store";

  let softkeys: Softkeys = {};

  let unsubscribe: () => void;

  onMount(
    () =>
      (unsubscribe = softkeysStore.subscribe(
        (keys) => (softkeys = softkeys = keys)
      ))
  );

  onDestroy(() => unsubscribe());

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

<footer class="footer">
  <div class="footer__softkeys">
    {#if softkeys.left}
      <h5
        class="footer__softkeys-left"
        on:click="{keyDownHandler.bind(this, { key: 'SoftLeft' })}">
        {softkeys.left.label}
      </h5>
    {/if}
    {#if softkeys.center}
      <h5
        class="footer__softkeys-center"
        on:click="{keyDownHandler.bind(this, { key: 'Enter' })}">
        {softkeys.center.label}
      </h5>
    {/if}
    {#if softkeys.right}
      <h5
        class="footer__softkeys-right"
        on:click="{keyDownHandler.bind(this, { key: 'SoftRight' })}">
        {softkeys.right.label}
      </h5>
    {/if}
  </div>
</footer>

<style lang="scss">
  @import "../../styles/colors.scss";

  .footer {
    width: 100%;
    position: fixed;
    bottom: 0;
    right: 0;
    left: 0;

    &__softkeys {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      background-color: $app-softkeys-background;
      color: $app-softkeys-foreground;
      padding: 0 0.25rem;
      align-items: center;

      h5 {
        margin: 0.125rem 0;
        font-weight: 600;
        cursor: pointer;
      }

      &-left {
        grid-column: 1;
      }

      &-center {
        font-size: 1rem;
        margin-left: auto !important;
        margin-right: auto !important;
        grid-column: 2;
      }

      &-right {
        margin-left: auto !important;
        grid-column: 3;
      }
    }
  }
</style>
