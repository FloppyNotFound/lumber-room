import getFileEnding from './get-file-ending';

const checkIsAudio = (fileName: string): boolean => {
  const allowedAudioFileTypes = ['mp3'];

  const fileEnding = getFileEnding(fileName);

  return !!fileEnding && allowedAudioFileTypes.includes(fileEnding);
};

export default checkIsAudio;
