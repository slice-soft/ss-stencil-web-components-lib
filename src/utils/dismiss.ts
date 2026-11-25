export interface DismissOptions {
  /** Called when the reader asks to close, with what they did. */
  onDismiss: (reason: 'escape' | 'outside') => void;
  /**
   * Escape closes it. `'focus-within'` closes it only when Escape is pressed
   * inside the layer, and otherwise passes Escape to the layer beneath: for a
   * panel that leaves the page usable, where Escape typed in the page is not
   * meant for it.
   */
  escape?: boolean | 'focus-within';
  /** A press outside closes the layer. Use 'ignore' to let another layer handle the press. */
  outside?: boolean | 'ignore';
}

interface Layer {
  container: HTMLElement;
  escape: boolean | 'focus-within';
  outside: boolean | 'ignore';
  dismiss: DismissOptions['onDismiss'];
}

/**
 * Every open layer, oldest first. Only the last — the one on top — hears a
 * dismissal.
 *
 * Without the stack each layer listens on the document on its own, so one key
 * reaches all of them: Escape in a menu inside a dialog closes the menu and the
 * dialog together, and a press on the dialog to close a popover takes the
 * dialog with it. A top layer that refuses a dismissal — a dialog that has to
 * be answered — blocks the layers beneath it rather than passing it down, since
 * the reader cannot see them.
 */
const layers: Layer[] = [];

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;

  const path = event.composedPath();
  let index = layers.length - 1;
  while (layers[index]?.escape === 'focus-within' && !path.includes(layers[index].container)) index -= 1;
  const layer = layers[index];
  if (layer?.escape) layer.dismiss('escape');
}

function handlePointerDown(event: PointerEvent) {
  let index = layers.length - 1;
  while (layers[index]?.outside === 'ignore') index -= 1;
  const layer = layers[index];
  if (layer?.outside === true && !event.composedPath().includes(layer.container)) layer.dismiss('outside');
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
 * The layer goes on top of any already open. Returns a function that takes it
 * off again.
 */
export function onDismiss(container: HTMLElement, options: DismissOptions): () => void {
  const layer: Layer = { container, escape: options.escape ?? true, outside: options.outside ?? true, dismiss: options.onDismiss };

  if (!layers.length) {
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
  }
  layers.push(layer);

  return () => {
    const index = layers.indexOf(layer);
    if (index === -1) return;

    layers.splice(index, 1);
    if (!layers.length) {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('pointerdown', handlePointerDown, true);
    }
  };
}
