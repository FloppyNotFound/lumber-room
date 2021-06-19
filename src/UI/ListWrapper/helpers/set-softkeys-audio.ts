import audioPlayStore from '../../Audio/audio-play-store';
import audioRestartStore from '../../Audio/audio-restart-store';
import type { Softkey } from '../../SoftKeys/models/softkey.model';
import softkeysStore from '../../SoftKeys/softkeys-store';

const setSoftkeysAudio = (goBackCallback: () => void): void => {
  softkeysStore.stack();

  softkeysStore.setCenter({
    label: 'Play/Pause',
    callback: () =>
      new Promise((resolve) => {
        audioPlayStore.update((isPlaying) => !isPlaying);
        resolve();
      }),
  });

  softkeysStore.setLeft({
    label: 'Back',
    callback: () => goBackCallback(),
  } as Softkey);

  softkeysStore.setRight({
    label: 'Restart',
    callback: () =>
      new Promise((resolve) => {
        audioRestartStore.update((toggle) => !toggle);
        resolve();
      }),
  });
};

export default setSoftkeysAudio;
