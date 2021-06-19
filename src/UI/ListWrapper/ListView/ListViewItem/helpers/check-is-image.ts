import getFileEnding from './get-file-ending';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/Media/Formats/Image_types
 */
const checkIsImage = (fileName: string): boolean => {
  const imageFileEndings = ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'png'];
  const fileEnding = getFileEnding(fileName);
  return !!fileEnding && imageFileEndings.includes(fileEnding);
};

export default checkIsImage;
