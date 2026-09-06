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

  /** Id applied to the rendered label element. */
  @Prop() xId?: string;
  /** Id of the form control this label is associated with, set as the for attribute. */
  @Prop() htmlFor?: string;
  /** Label text rendered when no slot content is provided. */
  @Prop() label?: string;
  /** Size of the label. */
  @Prop() size: Size = 'md';
  /** Appends a required marker (*) to the label. */
  @Prop() required: boolean = false;
  /** Applies the disabled styling. */
  @Prop() disabled: boolean = false;
  /** Inline CSS styles applied to the label element. */
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
