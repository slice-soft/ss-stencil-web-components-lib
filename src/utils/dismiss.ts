export interface DismissOptions {
  /** Called when the reader asks to close, with what they did. */
  onDismiss: (reason: 'escape' | 'outside') => void;
  /** Escape closes it. */
  escape?: boolean;
  /** A press starting outside the container closes it. */
  outside?: boolean;
}

interface Layer {
  container: HTMLElement;
  escape: boolean;
  outside: boolean;
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

const top = () => layers[layers.length - 1];

function handleKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;

  const layer = top();
  if (layer?.escape) layer.dismiss('escape');
}

function handlePointerDown(event: PointerEvent) {
  const layer = top();
  if (layer?.outside && !event.composedPath().includes(layer.container)) layer.dismiss('outside');
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
