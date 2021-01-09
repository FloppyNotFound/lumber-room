<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fly } from "svelte/transition";
  import { toastStore } from "./toast-store";

  let toastMessage: string;
  let toastClass: string;

  let unsubscribe: () => void;

  $: isVisible = !!toastMessage?.length;

  onMount(() => {
    unsubscribe = toastStore.subscribe((toast) => {
      if (!toast) {
        return;
      }

      toastMessage = toast.message;
      toastClass = toast.type;

      setTimeout(() => (toastMessage = toastClass = void 0), 2000);
    });
  });

  onDestroy(() => unsubscribe());
</script>

<style lang="scss">
  #toast {
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    margin: 0;
    width: 100%;
    color: white;
    text-align: center;
    min-height: 2rem;

    display: flex;
    justify-content: center;
    align-items: center;

    &.info {
      background: blue;
    }

    &.warn {
      background: orange;
    }

    &.error {
      background: red;
    }

    &__content {
      padding: 1px;
    }
  }
</style>

{#if isVisible}
  <p id="toast" class={toastClass} transition:fly={{ y: -32, duration: 500 }}>
    <span id="toast__content">{toastMessage}</span>
  </p>
{/if}
