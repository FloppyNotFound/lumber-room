<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type {
    Dropbox,
    files,
    Error,
    DropboxResponseError,
    auth,
  } from "dropbox";
  import type { ListWrapperError } from "./models/list-wrapper-error.model";

  export let accessToken: string;

  const dispatch = createEventDispatcher();

  let isLoading: boolean;
  let listFolderResult: files.ListFolderResult;

  $: hasFolders = !!remoteFolders?.length;
  $: remoteFolders = <files.FolderMetadataReference[]>(
    listFolderResult?.entries.filter((e) => e[".tag"] === "folder")
  );
  $: hasFiles = !!remoteFiles?.length;
  $: remoteFiles = <files.FileMetadataReference[]>(
    listFolderResult?.entries.filter((e) => e[".tag"] === "file")
  );

  $: hasMore = listFolderResult?.has_more;
  $: cursor = listFolderResult?.cursor;

  const loadItems = async (path: string = ""): Promise<void> => {
    isLoading = true;

    // @ts-ignore
    const dbx = new Dropbox.Dropbox({ accessToken });

    await (<Dropbox>dbx)
      .filesListFolder({ path, include_media_info: true })
      .then((response) => (listFolderResult = response.result))
      .then(() => (isLoading = false))
      .catch(
        (
          errorResponse: DropboxResponseError<
            Error<files.ListFolderError | auth.AuthError>
          >
        ) => {
          isLoading = false;

          if (!errorResponse.error?.error) {
            dispatch("error", <ListWrapperError>{
              message: <string>(<unknown>errorResponse.error),
            });
            return;
          }

          const tag = errorResponse.error?.error[".tag"];

          if (errorResponse.status === 409 && tag === "path") {
            dispatch("error", <ListWrapperError>{ message: "Path not found" });
            loadItems("");
            return;
          }

          if (
            [
              "invalid_access_token",
              "expired_access_token",
              "user_suspended",
            ].includes(tag)
          ) {
            // TODO: show control instead of alert
            alert("Your session has run out, you will be signed out");
            dispatch("autherror");
            return;
          }

          alert(tag);
        }
      );
  };
</script>

<h2 data-l10n-id="list-wrapper-header">List Wrapper Header</h2>
<button
  on:click={loadItems.bind(this, '')}
  disabled={isLoading}
  data-l10n-id="list-wrapper-refresh-cta">Refresh</button>

<div>
  {#if hasFolders}
    <h2>Folders</h2>
    {#each remoteFolders as folder, i (folder.id)}
      <button on:click={loadItems.bind(this, folder.path_lower)}>{i + 1}
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
