import { newSpecPage } from '@stencil/core/testing';
import { SsLabel } from '../ss-label';

describe('ss-label', () => {
  it('renders a native label with for and required marker', async () => {
    const page = await newSpecPage({
      components: [SsLabel],
      html: `<ss-label for="email" required>Email</ss-label>`,
    });
    const label = page.root.querySelector('label');

    expect((label as HTMLLabelElement).htmlFor || label.getAttribute('for')).toBe('email');
    expect(label.textContent).toContain('Email');
    expect(label.querySelector('.ss-label__required').getAttribute('aria-hidden')).toBe('true');
  });

  it('applies size and disabled state classes', async () => {
    const page = await newSpecPage({
      components: [SsLabel],
      html: `<ss-label size="sm" disabled label="Name"></ss-label>`,
    });
    const label = page.root.querySelector('label');

    expect(label.classList.contains('ss-label--sm')).toBe(true);
    expect(label.classList.contains('ss-label--disabled')).toBe(true);
  });
});
