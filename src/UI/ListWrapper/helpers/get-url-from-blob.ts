const getUrlFromBlob = (blob: Blob): string => {
  const urlCreator = window.URL || window.webkitURL;
  const imageUrl = urlCreator.createObjectURL(blob);

  return imageUrl;
};

export default getUrlFromBlob;
