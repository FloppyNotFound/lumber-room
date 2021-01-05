<script lang="ts">
  import type { Dropbox, files } from "dropbox";

  export let accessToken: string;

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
      .filesListFolder({ path: "" })
      .then((response) => (listFolderResult = response.result))
      .catch((error) => {
        // TODO: improve errorhandling
        console.error(error);
        alert(error);
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
