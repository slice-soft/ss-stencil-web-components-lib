export interface DismissOptions {
  /** Called when the reader asks to close, with what they did. */
  onDismiss: (reason: 'escape' | 'outside') => void;
  /** Escape closes it. */
  escape?: boolean;
  /** A press starting outside the container closes it. */
  outside?: boolean;
}

/**
 * Watches for the two ways a reader asks a layer to go away: pressing Escape,
 * or pressing somewhere else.
 *
 * Outside presses are judged on `pointerdown` rather than `click`, and by
 * composed path rather than by `event.target`. Both matter: a click fires after
 * the press has already moved focus and dragged, so a selection that starts
 * inside and ends outside would read as an outside press; and `event.target` is
 * retargeted to the host at a shadow boundary, so a press on a control inside a
 * dialog would look like a press on the page.
 *
 * Returns a function that stops watching.
 */
export function onDismiss(container: HTMLElement, options: DismissOptions): () => void {
  const { onDismiss: dismiss, escape = true, outside = true } = options;

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') dismiss('escape');
  };

  const handlePointerDown = (event: PointerEvent) => {
    const path = event.composedPath();
    if (!path.includes(container)) dismiss('outside');
  };

  if (escape) document.addEventListener('keydown', handleKeyDown, true);
  if (outside) document.addEventListener('pointerdown', handlePointerDown, true);

  return () => {
    document.removeEventListener('keydown', handleKeyDown, true);
    document.removeEventListener('pointerdown', handlePointerDown, true);
  };
}
