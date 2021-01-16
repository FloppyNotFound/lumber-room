<script lang="ts">
  import type { files } from "dropbox";
  import Separator from "../../Separator/Separator.svelte";
  import ListViewItem from "./ListViewItem/ListViewItem.svelte";

  export let items: files.ListFolderResult;

  $: remoteFolders = <files.FolderMetadataReference[]>(
    items?.entries.filter((e) => e[".tag"] === "folder")
  );
  $: remoteFiles = <files.FileMetadataReference[]>(
    items?.entries.filter((e) => e[".tag"] === "file")
  );

  $: hasFolders = !!remoteFolders?.length;
  $: hasFiles = !!remoteFiles?.length;

  $: hasMore = items?.has_more;
  $: cursor = items?.cursor;
</script>

<div class="list-wrapper">
  {#if hasFolders}
    <Separator text="{'Folders'}" />

    <div class="list-view-items">
      {#each remoteFolders as folder, _ (folder.id)}
        <ListViewItem
          item="{folder}"
          isFolder="{true}"
          on:openfile
          on:openfolder />
      {/each}
    </div>
  {/if}

  {#if hasFiles}
    <Separator text="{'Files'}" />

    <div class="list-view-items">
      {#each remoteFiles as file, _ (file.id)}
        <ListViewItem item="{file}" on:openfile />
      {/each}
    </div>
  {/if}

  <!-- TODO: load more items -->
  {#if hasMore}
    There are more entries available, load them with cursor
    {cursor}
    [not implemented yet]
  {/if}
</div>

<style lang="scss">
  @import "../../../styles/colors.scss";

  .list-wrapper {
    margin: 0 -0.5rem;
  }
</style>
