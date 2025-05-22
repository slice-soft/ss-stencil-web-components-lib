import { newSpecPage } from '@stencil/core/testing';
import { SsButton } from '../ss-button';

describe('ss-button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SsButton],
      html: `<ss-button></ss-button>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-button>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ss-button>
    `);
  });
});
