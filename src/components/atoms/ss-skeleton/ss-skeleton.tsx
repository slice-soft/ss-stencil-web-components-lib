import { Component, h, Host, Prop } from '@stencil/core';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SkeletonShape = 'text' | 'rect' | 'circle';

/**
 * A placeholder that holds the place of content still loading, in roughly its
 * shape, and pulses slowly while it waits.
 *
 * It is hidden from assistive technology: a placeholder has nothing to say.
 * Mark the region that is loading with `aria-busy="true"` instead, and remove
 * it when the content arrives.
 *
 * The size comes from the layout around it or from `inlineStyles` (`width`,
 * `height`). Text lines are one line of the surrounding font tall, and the
 * last of several is shorter, as a paragraph's last line is.
 */
@Component({
  tag: 'ss-skeleton',
  styleUrl: 'ss-skeleton.scss',
  shadow: true,
})
export class SsSkeleton {
  /** Id applied to the root element. */
  @Prop() xId?: string;
  /** Shape of the content it stands for: lines of text, a block (an image, a card), or a circle (an avatar). */
  @Prop() shape: SkeletonShape = 'text';
  /** Number of text lines. Only for the text shape. */
  @Prop() lines: number = 1;
  /** Inline CSS styles applied to the root element; `width` and `height` size it. */
  @Prop() inlineStyles?: InlineStyles;

  render() {
    const lines = this.shape === 'text' ? Math.max(1, Math.floor(this.lines) || 1) : 0;

    return (
      <Host aria-hidden="true">
        <div id={this.xId} class={{ 'ss-skeleton': true, [`ss-skeleton--${this.shape}`]: true }} style={resolveInlineStyles(this.inlineStyles)}>
          {Array.from({ length: lines }, () => (
            <span class="ss-skeleton__line" />
          ))}
        </div>
      </Host>
    );
  }
}
