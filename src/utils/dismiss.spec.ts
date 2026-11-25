import { onDismiss } from './dismiss';

function pressEscape() {
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
}

function layer(options: { escape?: boolean } = {}) {
  const dismissed: string[] = [];
  const release = onDismiss(document.createElement('div'), { ...options, outside: false, onDismiss: reason => dismissed.push(reason) });
  return { dismissed, release };
}

describe('onDismiss with layers stacked', () => {
  it('closes only the layer on top', () => {
    // A menu open inside a dialog: Escape is for the menu.
    const dialog = layer();
    const menu = layer();

    pressEscape();

    expect(menu.dismissed).toEqual(['escape']);
    expect(dialog.dismissed).toEqual([]);

    menu.release();
    dialog.release();
  });

  it('hands Escape to the layer beneath once the top one is released', () => {
    const dialog = layer();
    const menu = layer();

    menu.release();
    pressEscape();

    expect(dialog.dismissed).toEqual(['escape']);
    dialog.release();
  });

  it('lets a top layer that refuses Escape block the ones beneath it', () => {
    // The reader cannot see what is under a dialog that must be answered, so
    // closing it from there would change the page behind their back.
    const popover = layer();
    const locked = layer({ escape: false });

    pressEscape();

    expect(popover.dismissed).toEqual([]);
    expect(locked.dismissed).toEqual([]);

    locked.release();
    popover.release();
  });

  it('stops listening once every layer is released', () => {
    const only = layer();
    only.release();

    pressEscape();

    expect(only.dismissed).toEqual([]);
  });

  it('ignores a release called twice', () => {
    const lower = layer();
    const upper = layer();

    upper.release();
    upper.release();
    pressEscape();

    expect(lower.dismissed).toEqual(['escape']);
    lower.release();
  });
});

describe('onDismiss with Escape scoped to focus', () => {
  function scoped() {
    const container = document.createElement('div');
    const input = document.createElement('input');
    container.append(input);
    document.body.append(container);
    const dismissed: string[] = [];
    const release = onDismiss(container, { escape: 'focus-within', outside: 'ignore', onDismiss: reason => dismissed.push(reason) });
    return { container, input, dismissed, release: () => (release(), container.remove()) };
  }

  function escapeFrom(target: EventTarget) {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
  }

  it('closes on Escape pressed inside it', () => {
    const panel = scoped();
    escapeFrom(panel.input);
    expect(panel.dismissed).toEqual(['escape']);
    panel.release();
  });

  it('ignores Escape pressed outside it and hands it to the layer beneath', () => {
    // A popover opened from the page, then a side panel: Escape typed in the
    // page is for the popover, not for the panel.
    const popover = layer();
    const panel = scoped();
    const outside = document.createElement('input');
    document.body.append(outside);

    escapeFrom(outside);

    expect(panel.dismissed).toEqual([]);
    expect(popover.dismissed).toEqual(['escape']);

    outside.remove();
    panel.release();
    popover.release();
  });
});
