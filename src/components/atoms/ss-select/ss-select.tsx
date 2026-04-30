import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SelectStyle = 'solid' | 'outline' | 'underline';
export type SsSelectChangeEvent = { xId?: string; name?: string; value: string | string[] };

/**
 * @slot - Native option or optgroup elements.
 */
@Component({
  tag: 'ss-select',
  styleUrl: 'ss-select.scss',
  scoped: true,
})
export class SsSelect {
  private select?: HTMLSelectElement;

  @Prop() xId?: string;
  @Prop() name?: string;
  @Prop() value?: string | string[];
  @Prop() placeholder?: string;
  @Prop() color: Variant = 'primary';
  @Prop() xStyle: SelectStyle = 'solid';
  @Prop() size: Size = 'md';
  @Prop() disabled: boolean = false;
  @Prop() required: boolean = false;
  @Prop() invalid: boolean = false;
  @Prop() multiple: boolean = false;
  @Prop() fullWidth: boolean = false;
  @Prop() accessibilityLabel?: string;
  @Prop() describedBy?: string;
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssChange: EventEmitter<SsSelectChangeEvent>;
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
  @Event() ssInvalid: EventEmitter<SsSelectChangeEvent>;

  componentDidLoad() {
    this.syncValue();
  }

  componentDidUpdate() {
    this.syncValue();
  }

  private getClasses() {
    const b = 'ss-select';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private getValue(select: HTMLSelectElement) {
    if (!this.multiple) return select.value;
    return Array.from(select.selectedOptions).map(option => option.value);
  }

  private emitValue(event: Event): SsSelectChangeEvent {
    const select = event.target as HTMLSelectElement;
    return { xId: this.xId, name: this.name, value: this.getValue(select) };
  }

  private syncValue() {
    if (!this.select || this.value === undefined) return;

    if (Array.isArray(this.value)) {
      Array.from(this.select.options).forEach(option => {
        option.selected = this.value.includes(option.value);
      });
      return;
    }

    this.select.value = this.value;
  }

  render() {
    return (
      <select
        ref={el => (this.select = el)}
        id={this.xId}
        name={this.name}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        disabled={this.disabled}
        required={this.required}
        multiple={this.multiple}
        aria-invalid={this.invalid ? 'true' : undefined}
        aria-label={this.accessibilityLabel}
        aria-describedby={this.describedBy}
        onChange={event => this.ssChange.emit(this.emitValue(event))}
        onFocus={event => this.ssFocus.emit(event)}
        onBlur={event => this.ssBlur.emit(event)}
        onInvalid={event => this.ssInvalid.emit(this.emitValue(event))}
      >
        {this.placeholder && !this.multiple && (
          <option value="" disabled selected={!this.value}>
            {this.placeholder}
          </option>
        )}
        <slot />
      </select>
    );
  }
}
