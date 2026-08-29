/**
 * Browsers retarget `dragstart` to the closest draggable ancestor, so neither
 * a drag adapter's `canDrag()` nor `event.target` can see an inline form
 * control the gesture started in; without this capture-phase cancel,
 * selecting text in it drags the item instead. The control is focused by the
 * initiating mousedown, so a focused interactive descendant also marks the
 * drag as text selection, not an item move.
 */
export function cancelDragStartFromInteractive(
  element: Element,
  isInteractive: (target: Element) => boolean,
): () => void {
  const cancel = (event: Event): void => {
    const target = event.target;
    const focused = element.ownerDocument.activeElement;

    if (
      (target instanceof Element && isInteractive(target)) ||
      (focused !== null && element.contains(focused) && isInteractive(focused))
    ) {
      event.preventDefault();
    }
  };

  element.addEventListener("dragstart", cancel, true);

  return () => element.removeEventListener("dragstart", cancel, true);
}
