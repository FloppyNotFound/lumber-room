interface OffsetItem {
  offsetParent: OffsetItem;
  offsetTop: number | undefined;
}

/**
 * @see https://stackoverflow.com/a/11986374
 * @param obj The currently focused HTML element
 */
const findScrollPosition = (obj: OffsetItem, correction: number): number => {
  if (!obj.offsetParent) {
    return 0;
  }

  let offsetItem = obj;

  let curtop = 0;
  do {
    curtop += obj.offsetTop ?? 0;
    offsetItem = offsetItem.offsetParent;
  } while (offsetItem);

  return curtop + correction;
};

const navToTabindex = (
  difference: number,
  className: string,
  correction: number
): void => {
  const currentIndex = (<HTMLElement>document.activeElement).tabIndex;
  const next = currentIndex + difference;
  const items = document.getElementsByClassName(className);
  const targetElement = <HTMLElement>items[next];

  if (!targetElement) {
    return;
  }

  targetElement.focus({ preventScroll: true });
  window.scrollTo(
    0,
    findScrollPosition(<OffsetItem>(<unknown>targetElement), correction)
  );
};

export default navToTabindex;
