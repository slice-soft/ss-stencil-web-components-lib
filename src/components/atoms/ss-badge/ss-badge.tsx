import { Component, Element, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type BadgeStyle = 'solid' | 'subtle' | 'outline';
export type SsBadgeDismissEvent = { xId?: string };

/**
 * @slot - Badge content.
 * @slot icon - Optional leading icon.
 */
@Component({
  tag: 'ss-badge',
  styleUrl: 'ss-badge.scss',
  shadow: true,
})
export class SsBadge {
  @Element() el!: HTMLElement;

  @Prop() xId?: string;
  @Prop() label?: string;
  @Prop() variant: Variant = 'primary';
  @Prop() xStyle: BadgeStyle = 'subtle';
  @Prop() size: Size = 'sm';
  @Prop() pill: boolean = false;
  @Prop() disabled: boolean = false;
  @Prop() dismissible: boolean = false;
  @Prop() dismissLabel: string = 'Dismiss';
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssDismiss: EventEmitter<SsBadgeDismissEvent>;

  private getClasses() {
    const b = 'ss-badge';
    return {
      [b]: true,
      [`${b}--${this.variant}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--pill`]: this.pill,
      [`${b}--disabled`]: this.disabled,
    };
  }

  private handleDismiss = () => {
    if (!this.disabled) {
      this.ssDismiss.emit({ xId: this.xId });
    }
  };

  render() {
    const hasIcon = !!this.el.querySelector('[slot="icon"]');

    return (
      <span id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        {hasIcon && (
          <span class="ss-badge__icon">
            <slot name="icon" />
          </span>
        )}
        <span class="ss-badge__label">
          <slot>{this.label}</slot>
        </span>
        {this.dismissible && (
          <button class="ss-badge__dismiss" type="button" disabled={this.disabled} aria-label={this.dismissLabel} onClick={this.handleDismiss}>
            x
          </button>
        )}
      </span>
    );
  }
}
