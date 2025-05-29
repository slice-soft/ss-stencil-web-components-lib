import { newSpecPage } from '@stencil/core/testing';
import { SsInput } from '../ss-input';

describe('ss-input', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [SsInput],
      html: `<ss-input></ss-input>`,
    });
    expect(page.root).toEqualHtml(`
      <ss-input>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </ss-input>
    `);
  });
});
