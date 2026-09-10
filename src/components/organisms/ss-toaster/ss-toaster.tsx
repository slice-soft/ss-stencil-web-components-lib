import { Component, h, Prop } from '@stencil/core';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type ToasterPlacement = 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end';

/**
 * The corner of the screen toasts appear in.
 *
 * It pins its toasts to one corner, above everything else, and stacks them in
 * the order they were added. It is a named region, so a screen reader user can
 * jump to the notifications and back again. The announcement itself comes from
 * each toast's own live region, which is why the toaster sets no `aria-live`:
 * a live region inside another announces the same message twice.
 *
 * The region ignores the pointer, so its empty area never blocks the page under
 * it; the toasts take the pointer back.
 *
 * @slot - The `ss-toast` elements.
 */
@Component({
  tag: 'ss-toaster',
  styleUrl: 'ss-toaster.scss',
  scoped: true,
})
export class SsToaster {
  /** Id applied to the region. */
  @Prop() xId?: string;
  /** Corner of the viewport the toasts are pinned to. */
  @Prop() placement: ToasterPlacement = 'bottom-end';
  /** Accessible name for the region, which is what a screen reader lists it as. */
  @Prop() accessibilityLabel: string = 'Notifications';
  /** Inline CSS styles applied to the region. */
  @Prop() inlineStyles?: InlineStyles;

  render() {
    return (
      <section
        id={this.xId}
        class={{ 'ss-toaster': true, [`ss-toaster--${this.placement}`]: true }}
        style={resolveInlineStyles(this.inlineStyles)}
        aria-label={this.accessibilityLabel}
      >
        <slot />
      </section>
    );
  }
}
