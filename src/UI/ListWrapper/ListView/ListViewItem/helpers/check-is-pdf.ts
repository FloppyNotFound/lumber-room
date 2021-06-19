import getFileEnding from './get-file-ending';

const checkIsPdf = (fileName: string): boolean =>
  getFileEnding(fileName) === 'pdf';

export default checkIsPdf;
