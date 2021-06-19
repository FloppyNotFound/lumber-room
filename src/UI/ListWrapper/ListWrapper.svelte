<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type {
    Dropbox,
    files,
    Error,
    DropboxResponseError,
    auth,
  } from 'dropbox';
  import type { ListWrapperToast } from './models/list-wrapper-toast.model';
  import ListView from './ListView/ListView.svelte';
  import softkeysStore from '../SoftKeys/softkeys-store';
  import type { Softkey } from '../SoftKeys/models/softkey.model';
  import type { DownloadImage } from './models/download-image.model';
  import Image from '../Image/Image.svelte';
  import checkIsAuthError from './helpers/check-is-auth-error';
  import getUrlFromBlob from './helpers/get-url-from-blob';
  import imageZoomStore from '../Image/image-zoom-store';
  import type { OpenFileFolderEvent } from './models/open-file-folder-event.model';

  export let accessToken: string;

  const dispatch = createEventDispatcher();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const dbx: Dropbox = new Dropbox.Dropbox({ accessToken }); // eslint-disable-line

  let isLoading: boolean;
  let listFolderResult: files.ListFolderResult;

  let downloadImage: DownloadImage | undefined;

  let historyStack: string[] = [];

  $: isOnRootLevel = historyStack.length === 1;

  onMount(async () => {
    await loadItems();
  });

  //#region Load Items
  const onLoadItems = (
    event: CustomEvent<OpenFileFolderEvent>
  ): Promise<void> => loadItems(event.detail.path);

  const loadItems = async (path = '', isNavBack = false): Promise<void> => {
    isLoading = true;

    await dbx
      .filesListFolder({ path, include_media_info: true })
      .then((response) => {
        listFolderResult = response.result;
      })
      .then(() => {
        if (!isNavBack) historyStack = [...historyStack, path];
      })
      .then(() => {
        if (isOnRootLevel) {
          softkeysStore.setLeft(void 0);

          softkeysStore.setRight({
            label: 'Logout',
            callback: (): Promise<void> =>
              new Promise((resolve) => {
                dispatch('logout');
                resolve();
              }),
          });
          return;
        }

        softkeysStore.setLeft({
          label: 'Back',
          callback: () => {
            const prevPath = historyStack.slice(-2, -1)[0];
            historyStack = historyStack.slice(0, -2);

            return loadItems(prevPath);
          },
        });
      })
      .then(() => {
        isLoading = false;
      })
      .catch(
        async (
          errorResponse: DropboxResponseError<
            Error<files.ListFolderError | auth.AuthError>
          >
        ) => {
          isLoading = false;

          if (!errorResponse.error?.error) {
            dispatch('error', <ListWrapperToast>{
              message: <string>(<unknown>errorResponse.error),
            });
            return;
          }

          const tag = errorResponse.error?.error['.tag'];

          if (errorResponse.status === 409 && tag === 'path') {
            dispatch('error', <ListWrapperToast>{ message: 'Path not found' });
            await loadItems('');
            return;
          }

          if (checkIsAuthError(errorResponse)) {
            dispatch('autherror');
            return;
          }

          console.error('Unknown auth error', tag);
        }
      );
  };
  //#endregion

  //#region Load Item
  const onLoadItem = (event: CustomEvent<OpenFileFolderEvent>): Promise<void> =>
    downloadItem(event.detail.path);

  const downloadItem = async (path: string): Promise<void> => {
    isLoading = true;

    const downloadArgs = <files.DownloadArg>{ path };

    await dbx
      .filesDownload(downloadArgs)
      .then((item) => {
        console.log('downloaded', item, item.result.is_downloadable);
        isLoading = false;

        if (item.result.is_downloadable) {
          const fileBlobResult = <{ fileBlob: Blob }>(<unknown>item.result);
          downloadImage = <DownloadImage>{
            src: getUrlFromBlob(fileBlobResult.fileBlob),
            alt: item.result.name,
          };
        } else {
          throw new Error('Unsupported file type');
        }
      })
      .then(() => {
        prepareSoftkeysForSubpage();
      })
      .catch((errorResponse) => {
        if (checkIsAuthError(errorResponse)) {
          dispatch('autherror');
          return;
        }

        throw errorResponse;
      })
      .catch((err: Error<string> | unknown) => {
        if (err instanceof Error) {
          dispatch('warn', <ListWrapperToast>{ message: err.message });
          return;
        }

        throw err;
      })
      .then(() => {
        isLoading = false;
      });
  };
  //#endregion

  const prepareSoftkeysForSubpage = (): void => {
    softkeysStore.stack();

    softkeysStore.setRight({
      label: 'Zoom',
      callback: () =>
        new Promise((resolve) => {
          imageZoomStore.update((isZoomed) => !isZoomed);
          resolve();
        }),
    });

    softkeysStore.setCenter();
    softkeysStore.setLeft({
      label: 'Back',
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
{:else if listFolderResult && listFolderResult.entries.length}
  <ListView
    items="{listFolderResult}"
    on:openfolder="{onLoadItems}"
    on:openfile="{onLoadItem}" />
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
