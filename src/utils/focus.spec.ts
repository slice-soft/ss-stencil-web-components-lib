import { getTabbable, deepestActive } from './focus';

function mount(html: string): HTMLElement {
  document.body.innerHTML = `<div id="container">${html}</div>`;
  return document.getElementById('container') as HTMLElement;
}

describe('getTabbable', () => {
  it('finds the controls in the order the browser would visit them', () => {
    const container = mount(`<a href="#a">A</a><button>B</button><input /><textarea></textarea><select></select>`);
    expect(getTabbable(container).map(el => el.tagName.toLowerCase())).toEqual(['a', 'button', 'input', 'textarea', 'select']);
  });

  it('skips a disabled control', () => {
    const container = mount(`<button>Yes</button><button disabled>No</button>`);
    expect(getTabbable(container)).toHaveLength(1);
  });

  it('skips anything taken out of the tab order', () => {
    const container = mount(`<button>Yes</button><button tabindex="-1">No</button>`);
    expect(getTabbable(container).map(el => el.textContent)).toEqual(['Yes']);
  });

  it('skips anything hidden from assistive technology', () => {
    const container = mount(`<button>Yes</button><button aria-hidden="true">No</button>`);
    expect(getTabbable(container).map(el => el.textContent)).toEqual(['Yes']);
  });

  it('includes an element made focusable with tabindex', () => {
    const container = mount(`<div tabindex="0">Focusable</div>`);
    expect(getTabbable(container)).toHaveLength(1);
  });

  it('finds a control that lives inside a shadow root', () => {
    const container = mount(`<button>Outer</button>`);
    const host = document.createElement('div');
    container.appendChild(host);
    host.attachShadow({ mode: 'open' }).innerHTML = '<button>Inner</button>';

    // A dialog holding an atom would otherwise look empty: the control that
    // takes focus is inside the atom, not beside it.
    expect(getTabbable(container).map(el => el.textContent)).toEqual(['Outer', 'Inner']);
  });

  it('finds nothing in a container with nothing to focus', () => {
    expect(getTabbable(mount(`<p>Just words</p>`))).toEqual([]);
  });
});

// The spec DOM does not track focus, so what has it is stated rather than
// produced by calling `focus()`. Real focus movement is covered in the e2e
// suite of the components that trap it.
function pretendFocus(element: HTMLElement, insideShadow?: HTMLElement) {
  Object.defineProperty(document, 'activeElement', { configurable: true, get: () => element });
  if (insideShadow && element.shadowRoot) {
    Object.defineProperty(element.shadowRoot, 'activeElement', { configurable: true, get: () => insideShadow });
  }
}

describe('deepestActive', () => {
  it('reports the focused element when it is in the document', () => {
    const container = mount(`<button id="target">Focus me</button>`);
    const button = container.querySelector('button') as HTMLElement;
    pretendFocus(button);

    expect(deepestActive()).toBe(button);
  });

  it('looks past a shadow host to what really has focus', () => {
    const container = mount(``);
    const host = document.createElement('div');
    container.appendChild(host);
    const shadow = host.attachShadow({ mode: 'open' });
    shadow.innerHTML = '<button>Inner</button>';
    const inner = shadow.querySelector('button') as HTMLElement;

    // `document.activeElement` stops at the host, which is not the answer.
    pretendFocus(host, inner);

    expect(deepestActive()).toBe(inner);
  });
});
