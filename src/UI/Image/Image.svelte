<script lang="ts">
  import { onDestroy } from 'svelte';
  import type { DownloadImage } from './download-image.model';
  import Separator from '../Separator/Separator.svelte';
  import imageZoomStore from './image-zoom-store';

  export let image: DownloadImage;
  let isZoomed: boolean;

  const unsubscribe = imageZoomStore.subscribe((shouldRotate) => {
    isZoomed = shouldRotate;
  });

  onDestroy(() => {
    unsubscribe();
    imageZoomStore.set(false);
  });
</script>

<div class="image-wrapper">
  {#if !isZoomed}
    <Separator text="{image.alt}" />
  {/if}
  <div
    class="image-wrapper__image {isZoomed
      ? 'image-wrapper__image-zoomed'
      : ''}">
    <img src="{image.src}" alt="{image.alt}" />
  </div>
</div>

<style lang="scss">
  .image-wrapper {
    margin: 0 -0.5rem;

    &__image {
      img {
        width: 100%;
      }

      &-zoomed {
        img {
          width: 200%;
        }
      }
    }
  }
</style>
