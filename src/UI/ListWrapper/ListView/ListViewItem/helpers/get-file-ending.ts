const getFileEnding = (fileName: string): string | undefined =>
  fileName.toLowerCase().split('.').pop()?.toLowerCase();

export default getFileEnding;
