import imageZoomStore from '../../Image/image-zoom-store';
import type { Softkey } from '../../SoftKeys/models/softkey.model';
import softkeysStore from '../../SoftKeys/softkeys-store';

const setSoftkeysImage = (goBackCallback: () => void): void => {
  softkeysStore.stack();

  softkeysStore.setRight({
    label: 'Zoom',
    callback: () =>
      new Promise((resolve) => {
        imageZoomStore.update((isZoomed) => !isZoomed);
        resolve();
      }),
  });

  softkeysStore.setCenter();
  softkeysStore.setLeft({
    label: 'Back',
    callback: () => goBackCallback(),
  } as Softkey);
};

export default setSoftkeysImage;
