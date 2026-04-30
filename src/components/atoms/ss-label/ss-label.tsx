import { Component, Element, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/**
 * @slot - Label text.
 */
@Component({
  tag: 'ss-label',
  styleUrl: 'ss-label.scss',
  scoped: true,
})
export class SsLabel {
  @Element() el!: HTMLElement;

  @Prop() xId?: string;
  @Prop() htmlFor?: string;
  @Prop() label?: string;
  @Prop() size: Size = 'md';
  @Prop() required: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() inlineStyles?: InlineStyles;

  private getClasses() {
    const b = 'ss-label';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--required`]: this.required,
      [`${b}--disabled`]: this.disabled,
    };
  }

  private get controlId() {
    return this.htmlFor || this.el.getAttribute('for') || undefined;
  }

  render() {
    const labelAttrs = { for: this.controlId };

    return (
      <label id={this.xId} {...labelAttrs} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <slot>{this.label}</slot>
        {this.required && (
          <span class="ss-label__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
    );
  }
}
