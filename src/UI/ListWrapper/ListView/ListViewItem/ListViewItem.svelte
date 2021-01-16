<script lang="ts">
  import type { files } from "dropbox";
  import type { OpenFileFolderEvent } from "../../models/open-file-folder-event.model";
  import { createEventDispatcher } from "svelte";
  import getFileSize from "./helpers/get-file-size";

  export let item: files.FileMetadataReference | files.FolderMetadataReference;
  export let isFolder: boolean;

  $: file = <files.FileMetadataReference>item;
  $: clickButtonHandler = (path: string): void =>
    isFolder ? openFolderHandler(path) : openFileHandler(path);

  const dispach = createEventDispatcher();

  const openFileHandler = (path: string): void =>
    dispach("openfile", <OpenFileFolderEvent>{ path });

  const openFolderHandler = (path: string): void =>
    dispach("openfolder", <OpenFileFolderEvent>{ path });

  const getModifiedDate = (date: string): string =>
    new Date(date).toDateString();

  const getFileEnding = (
    file: files.FileMetadataReference | files.FolderMetadataReference
  ) => file.name.toLowerCase();
</script>

<button
  class="list-view-item"
  on:click="{clickButtonHandler.bind(this, item.path_lower)}">
  <div class="list-view-item-content">
    {#if isFolder}
      <div class="col-1">
        <span class="icon-folder"></span>
      </div>
      <div class="col-2">
        {item.name}
      </div>
    {:else}
      <div class="col-1">
        {#if getFileEnding(item).endsWith(".pdf")}
          <span class="icon-file-pdf"></span>
        {:else if getFileEnding(item).endsWith(".jpg")}
          <span class="icon-file-picture"></span>
          <!-- TODO: Support more file types -->
        {:else}
          <span class="icon-file-empty"></span>
        {/if}
      </div>
      <div class="col-2">
        <div class="row-1">{item.name}</div>
        <div class="row-2">
          {getFileSize(file.size)} - {getModifiedDate(file.client_modified)}
        </div>
      </div>
    {/if}
  </div>
</button>

<style lang="scss">
  @import "../../../../styles/colors.scss";

  .list-view-item {
    width: 100%;
    height: 3rem;
    background: white;
    text-align: left;
    padding: 0.25rem;
    border: none;
    cursor: pointer;
    color: $app-background;

    .list-view-item-content {
      display: flex;

      .col-1 {
        margin-top: auto;
        margin-bottom: auto;

        span {
          font-size: xx-large;
        }
      }

      .col-2 {
        margin-top: auto;
        margin-left: 0.5rem;
        margin-bottom: auto;
        width: 85%;

        &,
        * {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .row-2 {
          font-size: 0.75rem;
        }
      }
    }

    &:focus,
    &:hover {
      background: $app-background;
      color: $app-foreground;
    }
  }
</style>
