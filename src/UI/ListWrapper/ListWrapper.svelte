<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type {
    Dropbox,
    files,
    Error,
    DropboxResponseError,
    auth,
  } from "dropbox";
  import type { ListWrapperToast } from "./models/list-wrapper-toast.model";
  import ListView from "./ListView/ListView.svelte";
  import type { OpenFolderEvent } from "./models/open-folder-event.model";
  import { softkeysStore } from "../SoftKeys/softkeys-store";
  import type { Softkey } from "../SoftKeys/models/softkey.model";
  import type { DownloadImage } from "./models/download-image.model";
  import Image from "../Image/Image.svelte";
  import checkIsAuthError from "./helpers/check-is-auth-error";
  import getUrlFromBlob from "./helpers/get-url-from-blob";

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

  //#region Load Items
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
            dispatch("error", <ListWrapperToast>{
              message: <string>(<unknown>errorResponse.error),
            });
            return;
          }

          const tag = errorResponse.error?.error[".tag"];

          if (errorResponse.status === 409 && tag === "path") {
            dispatch("error", <ListWrapperToast>{ message: "Path not found" });
            loadItems("");
            return;
          }

          if (checkIsAuthError(errorResponse)) {
            dispatch("autherror");
            return;
          }

          alert(tag);
        }
      );
  };
  //#endregion

  //#region Load Item
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
        prepareSoftkeysForSubpage();
      })
      .catch((errorResponse) => {
        if (checkIsAuthError(errorResponse)) {
          dispatch("autherror");
          return;
        }

        throw errorResponse;
      })
      .catch((err: Error<string> | unknown) => {
        if (err instanceof Error) {
          dispatch("warn", <ListWrapperToast>{ message: err.message });
          return;
        }

        throw err;
      })
      .then(() => (isLoading = false));
  };
  //#endregion

  const prepareSoftkeysForSubpage = (): void => {
    softkeysStore.stack();

    softkeysStore.setRight();
    softkeysStore.setCenter();
    softkeysStore.setLeft({
      label: "Back",
      callback: () => {
        downloadImage = void 0;
        softkeysStore.pop();
      },
    } as Softkey);
  };
</script>

{#if isLoading}
  <div class="status-message">Loading...</div>
{:else if downloadImage}
  <Image image="{downloadImage}" />
{:else if listFolderResult.entries.length}
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
</style>
