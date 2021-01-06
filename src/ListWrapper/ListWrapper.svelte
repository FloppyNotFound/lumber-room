<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type {
    Dropbox,
    files,
    Error,
    DropboxResponseError,
    auth,
  } from "dropbox";

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
      .catch(
        (
          errorResponse: DropboxResponseError<
            Error<files.ListFolderError | auth.AuthError>
          >
        ) => {
          if (!errorResponse.error?.error) {
            // TODO: show control instead of alert
            alert(errorResponse.error);
            return;
          }

          const tag = errorResponse.error?.error[".tag"];

          if (errorResponse.status === 409 && tag === "path") {
            // TODO: show control instead of alert
            alert("Path not found");
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
      )
      .finally(() => (isLoading = false));
  };
</script>

<h2 data-l10n-id="list-wrapper-header">List Wrapper</h2>
<button
  on:click={loadItems.bind(this, '')}
  disabled={isLoading}
  data-l10n-id="list-wrapper-refresh-cta">Refresh</button>

<div>
  {#if hasFolders}
    <p>Folders</p>
    {#each remoteFolders as folder, i (folder.id)}
      <button on:click={loadItems.bind(this, folder.path_lower)}>{i + 1}
        -
        {folder.name}</button>
    {/each}
  {/if}

  {#if hasFiles}
    <p>Files</p>
    {#each remoteFiles as file, i (file.id)}{i + 1} - {file.name}{/each}
  {/if}

  <!-- TODO: load more items -->
  {#if hasMore}
    There are more entries available, load them with cursor
    {cursor}
    [not implemented yet]
  {/if}
</div>
