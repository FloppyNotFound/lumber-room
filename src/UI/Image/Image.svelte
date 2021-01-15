<script lang="ts">
  import type { DownloadImage } from "../ListWrapper/models/download-image.model";
  import Separator from "../Separator/Separator.svelte";

  export let image: DownloadImage;
</script>

<div class="image-wrapper">
  <Separator text="{image.alt}" />
  <img class="image-wrapper__image" src="{image.src}" alt="{image.alt}" />
</div>

<style lang="scss">
  .image-wrapper {
    margin: 0 -0.5rem;

    &__image {
      width: 100%;
    }
  }
</style>
