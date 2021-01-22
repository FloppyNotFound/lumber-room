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
  window.scrollTo(0, findScrollPosition(targetElement, correction));
};

/**
 * @see https://stackoverflow.com/a/11986374
 * @param obj The currently focused HTML element
 */
const findScrollPosition = (obj: any, correction: number): number => {
  if (!obj.offsetParent) {
    return 0;
  }

  let curtop = 0;
  do {
    curtop += obj.offsetTop;
  } while ((obj = obj.offsetParent));

  return curtop + correction;
};

export default navToTabindex;
