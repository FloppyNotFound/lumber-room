<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type {
    Dropbox,
    files,
    Error,
    DropboxResponseError,
    auth,
  } from "dropbox";
  import type { ListWrapperError } from "./models/list-wrapper-error.model";
  import ListView from "./ListView/ListView.svelte";
  import type { OpenFolderEvent } from "./models/open-folder-event.model";
  import { softkeysStore } from "../SoftKeys/softkeys-store";
  import type { Softkey } from "../SoftKeys/models/softkey.model";
  import type { DownloadImage } from "./models/download-image.model";
  import Separator from "../Separator/Separator.svelte";
  import { toastStore } from "../Toast/toast-store";

  export let accessToken: string;

  const dispatch = createEventDispatcher();

  // @ts-ignore
  const dbx = new Dropbox.Dropbox({ accessToken });

  let isLoading: boolean;
  let listFolderResult: files.ListFolderResult;

  let downloadImage: DownloadImage;

  let historyStack: string[] = [];

  $: isOnRootLevel = historyStack.length === 1;

  onMount(() => loadItems());

  const loadItemsHandler = (event: CustomEvent<OpenFolderEvent>) =>
    loadItems(event.detail.path);

  const loadItems = async (
    path: string = "",
    isNavBack = false
  ): Promise<void> => {
    isLoading = true;

    await (<Dropbox>dbx)
      .filesListFolder({ path, include_media_info: true })
      .then((response) => (listFolderResult = response.result))
      .then(() =>
        !isNavBack ? (historyStack = [...historyStack, path]) : void 0
      )
      .then(() => {
        if (isOnRootLevel) {
          softkeysStore.setLeft(void 0);
          return;
        }

        softkeysStore.setLeft({
          label: "Back",
          callback: () => {
            const prevPath = historyStack.slice(-2, -1)[0];
            historyStack = historyStack.slice(0, -2);

            return loadItems(prevPath);
          },
        });
      })
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
            dispatch("autherror");
            return;
          }

          alert(tag);
        }
      );
  };

  const loadItemHandler = (event: CustomEvent<OpenFolderEvent>) =>
    downloadItem(event.detail.path);

  const downloadItem = async (path: string): Promise<void> => {
    isLoading = true;

    const downloadArgs = <files.DownloadArg>{ path };

    await (<Dropbox>dbx)
      .filesDownload(downloadArgs)
      .then((item) => {
        console.log("downloaded", item);
        isLoading = false;

        const mediaInfo = item.result.media_info;
        if (mediaInfo && mediaInfo["metadata"][".tag"] === "photo") {
          downloadImage = <DownloadImage>{
            // @ts-ignore
            src: getUrlFromBlob(item.result.fileBlob),
            alt: item.result.name,
          };
        } else {
          throw new Error("Unsupported file type");
        }
      })
      .then(() => {
        softkeysStore.stack();

        softkeysStore.setRight();
        softkeysStore.setCenter();
        softkeysStore.setLeft(<Softkey>{
          label: "Back",
          callback: () => {
            downloadImage = void 0;
            softkeysStore.pop();
          },
        });
      })
      .catch((err) => {
        if (err.message) {
          toastStore.warn(err.message);
        }

        isLoading = false;
      });
  };

  const getUrlFromBlob = (blob: Blob): string => {
    const urlCreator = window.URL || window.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);

    return imageUrl;
  };
</script>

{#if isLoading}
  <div class="status-message">Loading...</div>
{:else if downloadImage}
  <div class="image-wrapper">
    <Separator text="{downloadImage.alt}" />
    <img class="image" src="{downloadImage.src}" alt="{downloadImage.alt}" />
  </div>
{:else if listFolderResult?.entries.length}
  <ListView
    items="{listFolderResult}"
    on:openfolder="{loadItemsHandler}"
    on:openfile="{loadItemHandler}" />
{:else}
  <div class="status-message">
    <div>This folder is empty</div>
  </div>
{/if}

<style lang="scss">
  .status-message {
    height: 100%;
    text-align: center;
    margin-top: 1rem;
  }

  .image-wrapper {
    margin: 0 -0.5rem;

    .image {
      width: 100%;
    }
  }
</style>
