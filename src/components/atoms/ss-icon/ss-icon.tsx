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
  @Prop() xId?: string;
  @Prop() label?: string;
  @Prop() size: IconSize = 'md';
  @Prop() color: Variant | 'foreground' | 'muted' | 'current' = 'current';
  @Prop() decorative: boolean = true;
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
