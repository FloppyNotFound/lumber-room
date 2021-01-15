<script lang="ts">
  import type { files } from "dropbox";
  import { createEventDispatcher } from "svelte";
  import type { OpenFolderEvent } from "../models/open-folder-event.model";
  import getFileSize from "./helpers/get-file-size";
  import Separator from "../../Separator/Separator.svelte";

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

  const getFileEnding = (file: files.FileMetadataReference) =>
    file.name.toLowerCase();

  const openFolderHandler = (path: string): void =>
    dispach("openfolder", <OpenFolderEvent>{ path });

  const openFileHandler = (path: string): void =>
    dispach("openfile", <OpenFolderEvent>{ path });

  const getModifiedDate = (date: string): string =>
    new Date(date).toDateString();
</script>

<div>
  {#if hasFolders}
    <div class="seperator-wrapper"><Separator text="{'Folders'}" /></div>

    {#each remoteFolders as folder, _ (folder.id)}
      <div class="listview-item-wrapper">
        <button
          class="listview-item"
          on:click="{openFolderHandler.bind(this, folder.path_lower)}">
          <div class="listview-item-content">
            <div class="col-1">
              <span class="icon-folder"></span>
            </div>
            <div class="col-2">
              {folder.name}
            </div>
          </div>
        </button>
      </div>
    {/each}
  {/if}

  {#if hasFiles}
    <div class="seperator-wrapper"><Separator text="{'Files'}" /></div>

    {#each remoteFiles as file, _ (file.id)}
      <div class="listview-item-wrapper">
        <button
          class="listview-item"
          on:click="{openFileHandler.bind(this, file.path_lower)}">
          <div class="listview-item-content">
            <div class="col-1">
              {#if getFileEnding(file).endsWith(".pdf")}
                <span class="icon-file-pdf"></span>
              {:else if getFileEnding(file).endsWith(".jpg")}
                <span class="icon-file-picture"></span>
                <!-- TODO: Support more file types -->
              {:else}
                <span class="icon-file-empty"></span>
              {/if}
            </div>
            <div class="col-2">
              <div class="row-1">{file.name}</div>
              <div class="row-2">
                {getFileSize(file.size)} - {getModifiedDate(
                  file.client_modified
                )}
              </div>
            </div>
          </div>
        </button>
      </div>
    {/each}
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

  .seperator-wrapper {
    margin: 0 -0.5rem;
  }

  .listview-item-wrapper {
    margin: 0 -0.5rem;

    .listview-item {
      width: 100%;
      height: 3rem;
      background: white;
      text-align: left;
      padding: 0.25rem;
      border: none;
      cursor: pointer;
      color: $app-background;

      .listview-item-content {
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
  }
</style>
