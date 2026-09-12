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
