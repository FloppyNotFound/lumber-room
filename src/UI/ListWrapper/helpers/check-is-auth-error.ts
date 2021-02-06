import type { files, Error, DropboxResponseError, auth } from "dropbox";

const checkIsAuthError = (
  errorResponse:
    | DropboxResponseError<Error<files.ListFolderError | auth.AuthError>>
    | Error<any>
): boolean => {
  if (!errorResponse.error?.error) {
    return false;
  }
  const tag = errorResponse.error?.error[".tag"];

  return [
    "invalid_access_token",
    "expired_access_token",
    "user_suspended",
  ].includes(tag);
};

export default checkIsAuthError;
