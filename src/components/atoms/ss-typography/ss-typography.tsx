import { Component, JSX, Prop, h } from '@stencil/core';
import { Variant } from '../../../types/variant';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { FontWeight, LetterSpacing, LineHeight, TextAlign, TextTransform } from '../../../types/typography';

export type TypographyColor = Variant | 'foreground' | 'muted' | 'inherit' | 'black' | 'white';
export type TypographySize = Size | '4xl';
export type TypographyTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' | 'small' | 'strong' | 'em' | 'code';
export type TypographyFamily = 'sans' | 'display' | 'mono';
export type TypographyLevel = 1 | 2 | 3 | 4 | 5 | 6;

const LEVEL_SIZE: Record<TypographyLevel, TypographySize> = {
  1: '4xl',
  2: '3xl',
  3: '2xl',
  4: 'xl',
  5: 'lg',
  6: 'md',
};

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
  /**
   * Heading level (1–6). Sets the rendered tag to h{level} and applies
   * display font, bold weight, tight line-height, and a size scaled to the
   * level. All defaults are overridable via the individual props.
   */
  @Prop() level?: TypographyLevel;
  /**
   * Explicit font family. Defaults: 'display' when level is set, 'mono' when
   * as="code", 'sans' otherwise.
   */
  @Prop() family?: TypographyFamily;
  /** Explicit font size. Defaults to level-based size when level is set, 'md' otherwise. */
  @Prop() fontSize?: TypographySize;
  @Prop() align: TextAlign = 'left';
  /** 'foreground' uses the semantic foreground token and adapts to dark mode */
  @Prop() color: TypographyColor = 'foreground';
  /** Explicit font weight. Defaults to 'bold' when level is set, 'regular' otherwise. */
  @Prop() fontWeight?: FontWeight;
  /** Explicit line height. Defaults to 'tight' when level is set, 'normal' otherwise. */
  @Prop() lineHeight?: LineHeight;
  @Prop() letterSpacing: LetterSpacing = 'normal';
  @Prop() inlineStyles?: InlineStyles;
  @Prop() truncate: boolean = false;
  @Prop() transform: TextTransform = 'normal';

  private get effectiveTag(): keyof JSX.IntrinsicElements {
    if (this.level !== undefined) return `h${this.level}` as keyof JSX.IntrinsicElements;
    return this.as as keyof JSX.IntrinsicElements;
  }

  private get effectiveFontSize(): TypographySize {
    if (this.fontSize) return this.fontSize;
    if (this.level !== undefined) return LEVEL_SIZE[this.level];
    return 'md';
  }

  private get effectiveFontWeight(): FontWeight {
    if (this.fontWeight) return this.fontWeight;
    return this.level !== undefined ? 'bold' : 'regular';
  }

  private get effectiveLineHeight(): LineHeight {
    if (this.lineHeight) return this.lineHeight;
    return this.level !== undefined ? 'tight' : 'normal';
  }

  private get effectiveFamily(): TypographyFamily {
    if (this.family) return this.family;
    if (this.level !== undefined) return 'display';
    if (this.as === 'code') return 'mono';
    return 'sans';
  }

  private getClasses() {
    const b = 'ss-typography';
    const family = this.effectiveFamily;
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--align-${this.align}`]: true,
      [`${b}--font-weight-${this.effectiveFontWeight}`]: true,
      [`${b}--line-height-${this.effectiveLineHeight}`]: true,
      [`${b}--letter-spacing-${this.letterSpacing}`]: true,
      [`${b}--font-size-${this.effectiveFontSize}`]: true,
      [`${b}--truncate`]: this.truncate,
      [`${b}--transform-${this.transform}`]: this.transform !== 'normal',
      [`${b}--family-display`]: family === 'display',
      [`${b}--family-mono`]: family === 'mono',
    };
  }

  render() {
    const Tag = this.effectiveTag;
    return (
      <Tag id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <slot />
      </Tag>
    );
  }
}
