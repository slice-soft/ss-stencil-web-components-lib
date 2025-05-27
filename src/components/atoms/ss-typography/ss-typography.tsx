import { Component, JSX, Prop, State, h } from '@stencil/core';
import { Variant } from '../../../types/variant';
import { Size } from '../../../types/size';
import { parseStyleString } from '../../../utils/style';

/**
 * Componente de tipografía versátil para mostrar texto:
 * - Variantes de color (dark, light, primary, secondary)
 * - Tamaños de fuente (xs, sm, md, lg, xl)
 * - Alineación de texto (left, center, right, justify)
 * - Estilos de fuente (light, regular, medium, bold)
 * - Alturas de línea (tight, normal, relaxed)
 * - Espaciado de letras (tight, normal, wide)
 * - Personalización de estilos
 * @slot - Contenido del componente tipográfico
 */
@Component({
  tag: 'ss-typography',
  styleUrl: 'ss-typography.scss',
  scoped: true,
})
export class SsTypography {
  /**
   * id del componente tipográfico
   */
  @Prop() xId: string;
  /**
   * The HTML tag to be used for the typography component
   * @default 'p'
   */
  @Prop() as: 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span' = 'p';

  /**
   * The size of the typography component
   * @default 'md'
   */
  @Prop() fontSize: Size = 'md';

  /**
   * The text alignment for the typography component
   * @default 'left'
   */
  @Prop() align: 'left' | 'center' | 'right' | 'justify' = 'left';

  /**
   * The variant of the typography component
   * @default 'dark'
   */
  @Prop() color: Variant | 'black' | 'white' = 'black';

  /**
   * The font weight of the typography component
   * @default 'regular'
   */
  @Prop() fontWeight: 'light' | 'regular' | 'medium' | 'bold' = 'regular';

  /**
   * The line height of the typography component
   * @default 'normal'
   */
  @Prop() lineHeight: 'tight' | 'normal' | 'relaxed' = 'normal';

  /**
   * The letter spacing of the typography component
   * @default 'normal'
   */
  @Prop() letterSpacing: 'tight' | 'normal' | 'wide' = 'normal';

  /**|
   * Custom styles for the typography component
   * @default {}
   */
  @Prop() inlineStyles: { [key: string]: string } | string = {};

  /**
   * If true, the text will be truncated with an ellipsis if it overflows its container
   */
  @Prop() truncate: boolean = false;

  /**
   * If true, the text will be displayed in uppercase
   */
  @Prop() transform: 'uppercase' | 'lowercase' | 'capitalize' | 'normal' = 'normal';

  @State() styles: Record<string, string> = {};

  componentWillLoad() {
    if (typeof this.inlineStyles === 'string') {
      this.styles = parseStyleString(this.inlineStyles);
    } else if (this.inlineStyles) {
      this.styles = this.inlineStyles;
    }
  }

  private getClases() {
    const base = 'ss-typography';
    return {
      [base]: true,
      [`${base}--${this.color}`]: true,
      [`${base}--align-${this.align}`]: true,
      [`${base}--font-weight-${this.fontWeight}`]: true,
      [`${base}--line-height-${this.lineHeight}`]: true,
      [`${base}--letter-spacing-${this.letterSpacing}`]: true,
      [`${base}--font-size-${this.fontSize}`]: !!this.fontSize,
      [`${base}--truncate`]: this.truncate,
      [`${base}--transform-${this.transform}`]: this.transform !== 'normal',
    };
  }

  render() {
    const Tag = this.as as keyof JSX.IntrinsicElements;

    return (
      <Tag id={this.xId} class={this.getClases()} style={this.styles}>
        <slot />
      </Tag>
    );
  }
}
