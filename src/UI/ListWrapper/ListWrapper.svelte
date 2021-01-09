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
  import type { OpenFolderEventItem } from "./models/open-folder-event-item.model";

  export let accessToken: string;

  const dispatch = createEventDispatcher();

  let isLoading: boolean;
  let listFolderResult: files.ListFolderResult;

  onMount(() => loadItems());

  const loadItemsHandler = (event: CustomEvent<OpenFolderEventItem>) =>
    loadItems(event.detail.path);

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
            dispatch("autherror");
            return;
          }

          alert(tag);
        }
      );
  };
</script>

{#if isLoading}
  <div>Loading...</div>
{:else}
  <ListView items="{listFolderResult}" on:openfolder="{loadItemsHandler}" />
{/if}
