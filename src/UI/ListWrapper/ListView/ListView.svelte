<script lang="ts">
  import type { files } from 'dropbox';
  import Separator from '../../Separator/Separator.svelte';
  import ListViewItem from './ListViewItem/ListViewItem.svelte';
  import type { FileFolder } from './ListViewItem/models/file-folder.interface';

  export let items: files.ListFolderResult;

  $: remoteFolders = (<files.FolderMetadataReference[]>(
    items?.entries.filter((e) => e['.tag'] === 'folder')
  )).map((folder) => toFolderModel(folder));

  $: remoteFiles = (<files.FileMetadataReference[]>(
    items?.entries.filter((e) => e['.tag'] === 'file')
  )).map((file) => toFileModel(file));

  $: hasFolders = !!remoteFolders?.length;
  $: hasFiles = !!remoteFiles?.length;
  $: amountFolders = remoteFolders?.length;

  $: hasMore = items?.has_more;
  $: cursor = items?.cursor;

  const toFileModel = (file: files.FileMetadataReference): FileFolder => ({
    id: file.id,
    name: file.name,
    path: <string>file.path_lower,
    sizeBytes: file.size,
    lastModified: file.client_modified,
    isFolder: false,
  });

  const toFolderModel = (
    folder: files.FolderMetadataReference
  ): FileFolder => ({
    id: folder.id,
    name: folder.name,
    path: <string>folder.path_lower,
    isFolder: true,
  });
</script>

<div class="list-wrapper">
  {#if hasFolders}
    <Separator text="{'Folders'}" />

    <div class="list-view-items">
      {#each remoteFolders as folder, i (folder.id)}
        <ListViewItem item="{folder}" tabIndex="{i}" on:openfolder />
      {/each}
    </div>
  {/if}

  {#if hasFiles}
    <Separator text="{'Files'}" />

    <div class="list-view-items">
      {#each remoteFiles as file, i (file.id)}
        <ListViewItem
          item="{file}"
          tabIndex="{amountFolders + i}"
          on:openfile />
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
  @import '../../../styles/colors.scss';

  .list-wrapper {
    margin: 0 -0.5rem;
  }
</style>
