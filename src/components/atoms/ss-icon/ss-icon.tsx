import { Component, h, Prop } from '@stencil/core';
import { Variant } from '../../../types/variant';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type IconSize = Size | 'inherit';

/**
 * @slot - SVG, image, or icon font glyph.
 */
@Component({
  tag: 'ss-icon',
  styleUrl: 'ss-icon.scss',
  shadow: true,
})
export class SsIcon {
  /** Id applied to the root element. */
  @Prop() xId?: string;
  /** Accessible label; when provided the icon is exposed with role img instead of being hidden. */
  @Prop() label?: string;
  /** Size of the icon; inherit follows the surrounding font size. */
  @Prop() size: IconSize = 'md';
  /** Color token applied to the icon; current uses the current text color. */
  @Prop() color: Variant | 'foreground' | 'muted' | 'current' = 'current';
  /** Hides the icon from assistive technology with aria-hidden when true and no label is provided. */
  @Prop() decorative: boolean = true;
  /** Inline CSS styles applied to the root element. */
  @Prop() inlineStyles?: InlineStyles;

  private getClasses() {
    const b = 'ss-icon';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--${this.color}`]: true,
    };
  }

  render() {
    const isDecorative = this.decorative && !this.label;

    return (
      <span
        id={this.xId}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        role={isDecorative ? undefined : 'img'}
        aria-hidden={isDecorative ? 'true' : undefined}
        aria-label={isDecorative ? undefined : this.label}
      >
        <slot />
      </span>
    );
  }
}
