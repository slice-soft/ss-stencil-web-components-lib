import { Component, h, Prop } from '@stencil/core';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSpacing = 'none' | 'sm' | 'md' | 'lg';

/**
 * @slot - Optional divider label.
 */
@Component({
  tag: 'ss-divider',
  styleUrl: 'ss-divider.scss',
  shadow: true,
})
export class SsDivider {
  /** Id applied to the root element. */
  @Prop() xId?: string;
  /** Orientation of the divider: horizontal or vertical. */
  @Prop() orientation: DividerOrientation = 'horizontal';
  /** Outer margin along the divider axis: none, sm, md or lg. */
  @Prop() spacing: DividerSpacing = 'md';
  /** When true the divider is purely visual; when false it gets role separator and aria-orientation. */
  @Prop() decorative: boolean = true;
  /** Label text rendered between the lines when no slot content is provided. */
  @Prop() label?: string;
  /** Inline CSS styles applied to the root element. */
  @Prop() inlineStyles?: InlineStyles;

  private getClasses() {
    const b = 'ss-divider';
    return {
      [b]: true,
      [`${b}--${this.orientation}`]: true,
      [`${b}--spacing-${this.spacing}`]: true,
      [`${b}--with-label`]: !!this.label,
    };
  }

  render() {
    return (
      <div
        id={this.xId}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        role={this.decorative ? undefined : 'separator'}
        aria-orientation={this.decorative ? undefined : this.orientation}
      >
        <span class="ss-divider__line" />
        {(this.label || !this.decorative) && (
          <span class="ss-divider__label">
            <slot>{this.label}</slot>
          </span>
        )}
        <span class="ss-divider__line" />
      </div>
    );
  }
}
