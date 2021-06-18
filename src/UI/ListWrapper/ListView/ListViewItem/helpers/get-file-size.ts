const getFileSize = (size: number | undefined): string => {
  const round = (num: number): number =>
    Math.round((num + Number.EPSILON) * 100) / 100;

  let fileSize = size ?? 0;
  if (fileSize < 1024) {
    return `${round(fileSize)} Bytes`;
  }

  fileSize /= 1024;
  if (fileSize < 1024) {
    return `${round(fileSize)} KB`;
  }

  fileSize /= 1024;
  if (fileSize < 1024) {
    return `${round(fileSize)} MB`;
  }

  fileSize /= 1024;
  if (fileSize < 1024) {
    return `${round(fileSize)} GB`;
  }

  return `${round(fileSize)} TB`;
};

export default getFileSize;
