<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { Dropbox, files, Error } from "dropbox";

  export let accessToken: string;

  const dispatch = createEventDispatcher();

  let listFolderResult: files.ListFolderResult;

  $: hasFolders = !!remoteFolders?.length;
  $: remoteFolders = <files.FolderMetadataReference[]>(
    listFolderResult?.entries.filter((e) => e[".tag"] === "folder")
  );
  $: hasFiles = !!remoteFiles?.length;
  $: remoteFiles = <files.FileMetadataReference[]>(
    listFolderResult?.entries.filter((e) => e[".tag"] === "file")
  );

  const loadItems = (): void => {
    // @ts-ignore
    const dbx = new Dropbox.Dropbox({ accessToken });

    (<Dropbox>dbx)
      .filesListFolder({ path: "", include_media_info: true })
      .then((response) => (listFolderResult = response.result))
      .catch((error: Error<files.ListFolderError>) => {
        // TODO: improve errorhandling
        console.error(error);
        alert(
          (error.error ?? "<no error>") +
            " // " +
            (error.error_summary ?? "<no summary>") +
            " // " +
            (error.user_message ?? "<no message>")
        );

        // TODO: only dispatch auth error if it really is an auth error
        // find out how to check if it is an auth error
        dispatch("autherror");
      });
  };
</script>

<h2 data-l10n-id="list-wrapper-header">List Wrapper</h2>
<button
  on:click={loadItems}
  data-l10n-id="list-wrapper-refresh-cta">Refresh</button>

<div>
  {#if hasFolders}
    <p>Folders</p>
    {#each remoteFolders as folder, i (folder.id)}{i + 1} - {folder.name}{/each}
  {/if}

  {#if hasFiles}
    <p>Files</p>
    {#each remoteFiles as file, i (file.id)}{i + 1} - {file.name}{/each}
  {/if}
</div>
