import type { files, Error, DropboxResponseError, auth } from 'dropbox';

const checkIsAuthError = (
  errorResponse:
    | DropboxResponseError<Error<files.ListFolderError | auth.AuthError>>
    | Error<{ error?: { error?: { '.tag': string } } }>
): boolean => {
  const err = errorResponse.error?.error;
  if (!err) {
    return false;
  }

  // eslint-disable-next-line
  // @ts-ignore
  const tag = <string>err['.tag'];

  return [
    'invalid_access_token',
    'expired_access_token',
    'user_suspended',
  ].includes(tag);
};

export default checkIsAuthError;
