import { Component, JSX, Prop, h } from '@stencil/core';
import { Variant } from '../../../types/variant';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type TypographyColor = Variant | 'foreground' | 'muted' | 'black' | 'white';
export type TypographySize = Size | '4xl';
export type TypographyTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
export type FontWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
export type LineHeight = 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose';
export type LetterSpacing = 'tight' | 'normal' | 'wide' | 'wider';
export type TextTransform = 'uppercase' | 'lowercase' | 'capitalize' | 'normal';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * @slot - Typography content
 */
@Component({
  tag: 'ss-typography',
  styleUrl: 'ss-typography.scss',
  scoped: true,
})
export class SsTypography {
  @Prop() xId?: string;
  @Prop() as: TypographyTag = 'p';
  @Prop() fontSize: TypographySize = 'md';
  @Prop() align: TextAlign = 'left';
  /** 'foreground' uses the semantic foreground token and adapts to dark mode */
  @Prop() color: TypographyColor = 'foreground';
  @Prop() fontWeight: FontWeight = 'regular';
  @Prop() lineHeight: LineHeight = 'normal';
  @Prop() letterSpacing: LetterSpacing = 'normal';
  @Prop() inlineStyles?: InlineStyles;
  @Prop() truncate: boolean = false;
  @Prop() transform: TextTransform = 'normal';

  private getClasses() {
    const b = 'ss-typography';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--align-${this.align}`]: true,
      [`${b}--font-weight-${this.fontWeight}`]: true,
      [`${b}--line-height-${this.lineHeight}`]: true,
      [`${b}--letter-spacing-${this.letterSpacing}`]: true,
      [`${b}--font-size-${this.fontSize}`]: !!this.fontSize,
      [`${b}--truncate`]: this.truncate,
      [`${b}--transform-${this.transform}`]: this.transform !== 'normal',
    };
  }

  render() {
    const Tag = this.as as keyof JSX.IntrinsicElements;
    return (
      <Tag id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <slot />
      </Tag>
    );
  }
}
