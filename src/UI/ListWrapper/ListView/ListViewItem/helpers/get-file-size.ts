const getFileSize = (size: number): string => {
  const round = (num: number): number =>
    Math.round((num + Number.EPSILON) * 100) / 100;

  if (size < 1024) {
    return round(size) + " Bytes";
  }

  size /= 1024;
  if (size < 1024) {
    return round(size) + " KB";
  }

  size /= 1024;
  if (size < 1024) {
    return round(size) + " MB";
  }

  size /= 1024;
  if (size < 1024) {
    return round(size) + " GB";
  }

  return round(size) + " TB";
};

export default getFileSize;
