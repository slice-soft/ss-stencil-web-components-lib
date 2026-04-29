import { Component, h, Prop, Event, EventEmitter, State, Element } from '@stencil/core';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';
import { Size } from '../../../types/size';

export type ButtonStyle = 'solid' | 'outline' | 'ghost';
export type ButtonShape = 'rounded' | 'pill' | 'circle' | 'square';
export type ButtonStatus = 'active' | 'disabled' | 'loading';
export type ButtonType = 'button' | 'submit' | 'reset';
export type IconPosition = 'left' | 'right' | 'only';

/**
 * @slot icon - Icon slot (left, right, or icon-only mode).
 */
@Component({
  tag: 'ss-button',
  styleUrl: 'ss-button.scss',
  shadow: true,
})
export class SsButton {
  @Element() el!: HTMLElement;

  @Prop() xId?: string;
  @Prop() label?: string;
  @Prop() type: ButtonType = 'button';
  @Prop() disabled: boolean = false;
  /** After ssClick fires, button is disabled for disableDuration ms */
  @Prop() oneClick: boolean = true;
  @Prop() disableDuration: number = 1000;
  @Prop() size: Size = 'md';
  @Prop() variant: Variant = 'primary';
  @Prop() xStyle: ButtonStyle = 'solid';
  @Prop() inlineStyles?: InlineStyles;
  @Prop() shape: ButtonShape = 'rounded';
  @Prop() fullWidth: boolean = false;
  @Prop() status: ButtonStatus = 'active';
  @Prop() iconPosition: IconPosition = 'right';

  @State() private isTemporarilyDisabled = false;
  @State() private feedbackStatus?: ButtonStatus;

  private disableTimeout?: ReturnType<typeof setTimeout>;
  private statusTimeout?: ReturnType<typeof setTimeout>;

  @Event() ssClick: EventEmitter<string | undefined>;

  disconnectedCallback() {
    this.clearDisableTimeout();
    this.clearStatusTimeout();
  }

  private get currentStatus(): ButtonStatus {
    return this.feedbackStatus ?? this.status;
  }

  private get isDisabled() {
    const status = this.currentStatus;
    return this.disabled || this.isTemporarilyDisabled || status === 'disabled' || status === 'loading';
  }

  private clearDisableTimeout() {
    if (this.disableTimeout !== undefined) {
      clearTimeout(this.disableTimeout);
      this.disableTimeout = undefined;
    }
  }

  private clearStatusTimeout() {
    if (this.statusTimeout !== undefined) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = undefined;
    }
  }

  private scheduleTemporaryDisable() {
    this.clearDisableTimeout();
    this.isTemporarilyDisabled = true;
    this.disableTimeout = setTimeout(() => {
      this.isTemporarilyDisabled = false;
      this.disableTimeout = undefined;
    }, this.disableDuration);
  }

  private scheduleLoadingFeedback() {
    this.clearStatusTimeout();
    this.feedbackStatus = 'loading';
    this.statusTimeout = setTimeout(() => {
      this.feedbackStatus = undefined;
      this.statusTimeout = undefined;
    }, this.disableDuration);
  }

  private ssClickHandler = (event: MouseEvent) => {
    if (this.isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ssClick.emit(this.xId);
    if (this.oneClick) {
      this.scheduleTemporaryDisable();
    } else {
      this.scheduleLoadingFeedback();
    }
  };

  private getClasses() {
    const b = 'ss-button';
    return {
      [b]: true,
      [`${b}--${this.variant}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--${this.shape}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--status-${this.currentStatus}`]: true,
    };
  }

  render() {
    const disabled = this.isDisabled;
    const hasIcon = !!this.el.querySelector('[slot="icon"]');
    const showLeft = hasIcon && (this.iconPosition === 'left' || this.iconPosition === 'only');
    const showRight = hasIcon && this.iconPosition === 'right';
    const showLabel = this.iconPosition !== 'only';

    return (
      <button
        id={this.xId}
        type={this.type}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        disabled={disabled}
        aria-disabled={disabled.toString()}
        aria-busy={this.currentStatus === 'loading'}
        aria-label={this.label}
        tabindex={disabled ? -1 : 0}
        onClick={this.ssClickHandler}
      >
        {showLeft && (
          <span class="ss-button__icon ss-button__icon--left">
            <slot name="icon" />
          </span>
        )}
        {showLabel && (
          <span class="ss-button__label">
            <slot>{this.label}</slot>
          </span>
        )}
        {showRight && (
          <span class="ss-button__icon ss-button__icon--right">
            <slot name="icon" />
          </span>
        )}
      </button>
    );
  }
}
