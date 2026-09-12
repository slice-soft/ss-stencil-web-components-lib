import { Component, h, Prop, State } from '@stencil/core';
import { slotHasContent } from '../../../utils/slot';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type CardStyle = 'elevated' | 'outlined' | 'filled';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

/**
 * A surface that groups related content, with optional media, header and footer
 * regions around it.
 *
 * It is layout only: no elevation logic, no click behaviour and no events. A
 * card that should act as a link or a button holds one in its content, so the
 * accessible role stays on the element that actually has it; a clickable
 * container would have to invent the keyboard and role semantics that
 * `ss-button` and `ss-link` already provide.
 *
 * Each region collapses when nothing is slotted into it, so an unused header
 * leaves no gap and draws no divider.
 *
 * @slot - The card's content.
 * @slot media - Full-bleed media above the content, such as an image.
 * @slot header - A title row above the content.
 * @slot footer - Actions or metadata below the content.
 */
@Component({
  tag: 'ss-card',
  styleUrl: 'ss-card.scss',
  shadow: true,
})
export class SsCard {
  /** Id applied to the rendered container. */
  @Prop() xId?: string;
  /** Visual style: raised off the page, outlined, or filled with a surface tone. */
  @Prop() xStyle: CardStyle = 'elevated';
  /** Inner spacing applied to the header, content and footer regions. */
  @Prop() padding: CardPadding = 'md';
  /** Expands the card to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Which optional regions currently hold content, tracked through slotchange. */
  @State() filled: Record<string, boolean> = { media: false, header: false, footer: false };

  private trackSlot(name: string) {
    return (event: Event) => {
      const has = slotHasContent(event);
      if (this.filled[name] !== has) this.filled = { ...this.filled, [name]: has };
    };
  }

  private getClasses() {
    const b = 'ss-card';
    return {
      [b]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--padding-${this.padding}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--has-media`]: this.filled.media,
      [`${b}--has-header`]: this.filled.header,
      [`${b}--has-footer`]: this.filled.footer,
    };
  }

  render() {
    return (
      <div id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <div class="ss-card__media">
          <slot name="media" onSlotchange={this.trackSlot('media')} />
        </div>
        <div class="ss-card__header">
          <slot name="header" onSlotchange={this.trackSlot('header')} />
        </div>
        <div class="ss-card__content">
          <slot />
        </div>
        <div class="ss-card__footer">
          <slot name="footer" onSlotchange={this.trackSlot('footer')} />
        </div>
      </div>
    );
  }
}
