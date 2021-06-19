import getFileEnding from './get-file-ending';

const checkIsAudio = (fileName: string): boolean => {
  const allowedAudioFileTypes = ['aac', 'mp3', 'wav'];

  const fileEnding = getFileEnding(fileName);

  return !!fileEnding && allowedAudioFileTypes.includes(fileEnding);
};

export default checkIsAudio;
