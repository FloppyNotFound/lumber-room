<script lang="ts">
  import type { files } from "dropbox";
  import { createEventDispatcher } from "svelte";
  import type { OpenFolderEvent } from "../models/open-folder-event.model";

  export let items: files.ListFolderResult;

  const dispach = createEventDispatcher();

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

  const openFolderHandler = (path: string): void =>
    dispach("openfolder", <OpenFolderEvent>{ path });
</script>

<div>
  {#if hasFolders}
    <h2>Folders</h2>
    {#each remoteFolders as folder, i (folder.id)}
      <button on:click="{openFolderHandler.bind(this, folder.path_lower)}"
        >{i + 1}
        -
        {folder.name}</button>
    {/each}
  {/if}

  {#if hasFiles}
    <h2>Files</h2>
    {#each remoteFiles as file, i (file.id)}{i + 1} - {file.name}{/each}
  {/if}

  <!-- TODO: load more items -->
  {#if hasMore}
    There are more entries available, load them with cursor
    {cursor}
    [not implemented yet]
  {/if}
</div>
