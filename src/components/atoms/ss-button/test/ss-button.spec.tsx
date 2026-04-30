import { newSpecPage } from '@stencil/core/testing';
import { SsButton } from '../ss-button';

describe('ss-button', () => {
  it('renders default', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button></ss-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-button>
        <mock:shadow-root>
          <button
            aria-disabled="false"
            class="ss-button ss-button--md ss-button--primary ss-button--rounded ss-button--solid ss-button--status-active"
            tabindex="0"
            type="button"
          >
            <span class="ss-button__label">
              <slot></slot>
            </span>
          </button>
        </mock:shadow-root>
      </ss-button>
    `);
  });

  it('renders with label', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button label="Hola"></ss-button>`,
    });
    expect(page.root.shadowRoot.querySelector('.ss-button__label').textContent).toBe('Hola');
  });

  it('renders with icon slot (left)', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button icon-position="left"><span slot="icon">icon</span>Label</ss-button>`,
    });
    page.rootInstance.el.querySelector = () => true;
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('.ss-button__icon--left')).not.toBeNull();
  });

  it('renders with icon slot (right)', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button icon-position="right"><span slot="icon">icon</span>Label</ss-button>`,
    });
    page.rootInstance.el.querySelector = () => true;
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('.ss-button__icon--right')).not.toBeNull();
  });

  it('renders with icon only', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button icon-position="only"><span slot="icon">icon</span></ss-button>`,
    });
    page.rootInstance.el.querySelector = () => true;
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('.ss-button__icon--left')).not.toBeNull();
    expect(page.root.shadowRoot.querySelector('.ss-button__label')).toBeNull();
  });

  it('applies disabled prop', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button disabled status="active"></ss-button>`,
    });
    await page.waitForChanges();
    const result = page.root.shadowRoot.querySelector('button');
    expect(result.disabled).not.toBeNull();
  });

  it('applies disabled prop', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button disabled></ss-button>`,
    });
    await page.waitForChanges();
    expect(page.root.getAttribute('disabled')).not.toBeNull();
  });

  it('applies fullWidth prop', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button full-width></ss-button>`,
    });
    expect(page.root.shadowRoot.querySelector('button').classList.contains('ss-button--full-width')).toBe(true);
  });

  it('emits ssClick event', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button x-id="btn1"></ss-button>`,
    });
    const spy = jest.fn();
    page.root.addEventListener('ssClick', spy);
    page.root.shadowRoot.querySelector('button').click();
    await page.waitForChanges();
    expect(spy).toHaveBeenCalled();
  });

  it('does not emit ssClick if disabled', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button disabled></ss-button>`,
    });
    const spy = jest.fn();
    page.root.addEventListener('ssClick', spy);
    page.root.shadowRoot.querySelector('button').click();
    await page.waitForChanges();
    expect(spy).not.toHaveBeenCalled();
  });

  it('applies variant, size, style, shape', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button variant="success" size="lg" x-style="outline" shape="pill"></ss-button>`,
    });
    const btn = page.root.shadowRoot.querySelector('button');
    expect(btn.classList.contains('ss-button--success')).toBe(true);
    expect(btn.classList.contains('ss-button--lg')).toBe(true);
    expect(btn.classList.contains('ss-button--outline')).toBe(true);
    expect(btn.classList.contains('ss-button--pill')).toBe(true);
  });

  it('shows loading state', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button status="loading"></ss-button>`,
    });
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('button').getAttribute('aria-busy')).not.toBeNull();
    expect(page.root.shadowRoot.querySelector('button').classList.contains('ss-button--status-loading')).toBe(true);
  });

  it('supports loading and accessibilityLabel props', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button loading accessibility-label="Save changes"></ss-button>`,
    });
    const button = page.root.shadowRoot.querySelector('button');

    expect(button.getAttribute('aria-label')).toBe('Save changes');
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.classList.contains('ss-button--status-loading')).toBe(true);
  });

  it('applies loading and resets status when oneClick is false', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button one-click="false" disable-duration="10"></ss-button>`,
    });

    await page.waitForChanges();

    const button = page.root.shadowRoot.querySelector('button');
    button.click();
    await page.waitForChanges();

    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.hasAttribute('aria-busy')).toBe(true);
    expect(button.classList.contains('ss-button--status-loading')).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 15));
    await page.waitForChanges();

    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.hasAttribute('aria-busy')).toBe(false);
    expect(button.classList.contains('ss-button--status-active')).toBe(true);
  });

  it('temporarily disables after click when oneClick is true', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button disable-duration="10"></ss-button>`,
    });
    const button = page.root.shadowRoot.querySelector('button');

    button.click();
    await page.waitForChanges();

    expect(button.hasAttribute('disabled')).toBe(true);

    await new Promise(resolve => setTimeout(resolve, 15));
    await page.waitForChanges();

    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('applies inlineStyles String', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button inline-styles="color: red;"></ss-button>`,
    });
    expect(page.root.shadowRoot.querySelector('button').getAttribute('style')).toBe('color: red;');
  });

  it('applies inlineStyles Object', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button></ss-button>`,
    });
    (page.root as any).inlineStyles = { color: 'red', backgroundColor: 'blue' };
    await page.waitForChanges();
    expect(page.root.shadowRoot.querySelector('button').getAttribute('style')).toBe('color: red; background-color: blue;');
  });
});
