import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SsSliderValueEvent = { xId?: string; name?: string; value: number };

@Component({
  tag: 'ss-slider',
  styleUrl: 'ss-slider.scss',
  shadow: true,
})
export class SsSlider {
  private input?: HTMLInputElement;

  @Prop() xId?: string;
  @Prop() name?: string;
  @Prop({ mutable: true }) value: number = 0;
  @Prop() min: number = 0;
  @Prop() max: number = 100;
  @Prop() step: number = 1;
  @Prop() color: Variant = 'primary';
  @Prop() size: Size = 'md';
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;
  @Prop() invalid: boolean = false;
  @Prop() fullWidth: boolean = false;
  @Prop() showValue: boolean = false;
  @Prop() valueLabel?: string;
  @Prop() accessibilityLabel?: string;
  @Prop() describedBy?: string;
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssInput: EventEmitter<SsSliderValueEvent>;
  @Event() ssChange: EventEmitter<SsSliderValueEvent>;
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
  @Event() ssInvalid: EventEmitter<SsSliderValueEvent>;

  private getClasses() {
    const b = 'ss-slider';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(value = this.value): SsSliderValueEvent {
    return { xId: this.xId, name: this.name, value };
  }

  private getEventValue(event: Event) {
    return Number((event.target as HTMLInputElement).value);
  }

  private handleInput = (event: Event) => {
    if (this.readonly) {
      event.preventDefault();
      if (this.input) this.input.value = String(this.value);
      return;
    }
    this.value = this.getEventValue(event);
    this.ssInput.emit(this.emitValue());
  };

  private handleChange = (event: Event) => {
    if (this.readonly) {
      event.preventDefault();
      if (this.input) this.input.value = String(this.value);
      return;
    }
    this.value = this.getEventValue(event);
    this.ssChange.emit(this.emitValue());
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    if (this.readonly) {
      event.preventDefault();
    }
  };

  render() {
    const renderedValue = this.valueLabel ?? String(this.value);

    return (
      <span class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          ref={el => (this.input = el)}
          id={this.xId}
          class="ss-slider__input"
          type="range"
          name={this.name}
          min={this.min}
          max={this.max}
          step={this.step}
          value={this.value}
          disabled={this.disabled}
          aria-readonly={this.readonly ? 'true' : undefined}
          aria-invalid={this.invalid ? 'true' : undefined}
          aria-label={this.accessibilityLabel}
          aria-describedby={this.describedBy}
          onInput={this.handleInput}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
          onFocus={event => this.ssFocus.emit(event)}
          onBlur={event => this.ssBlur.emit(event)}
          onInvalid={() => this.ssInvalid.emit(this.emitValue())}
        />
        {this.showValue && <output class="ss-slider__value">{renderedValue}</output>}
      </span>
    );
  }
}
