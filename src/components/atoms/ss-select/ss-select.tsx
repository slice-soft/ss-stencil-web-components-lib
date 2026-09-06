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

  /** Id applied to the native select; also included in event details. */
  @Prop() xId?: string;
  /** Name of the native select for form submission. */
  @Prop() name?: string;
  /** Selected value, or an array of values when multiple is enabled. */
  @Prop() value?: string | string[];
  /** Text of a disabled empty option rendered first; only in single-selection mode. */
  @Prop() placeholder?: string;
  /** Color variant of the select. */
  @Prop() color: Variant = 'primary';
  /** Visual style: solid, outline or underline. */
  @Prop() xStyle: SelectStyle = 'solid';
  /** Size of the select. */
  @Prop() size: Size = 'md';
  /** Disables the select. */
  @Prop() disabled: boolean = false;
  /** Marks the select as required for form validation. */
  @Prop() required: boolean = false;
  /** Applies error styling and sets aria-invalid. */
  @Prop() invalid: boolean = false;
  /** Allows selecting multiple options. */
  @Prop() multiple: boolean = false;
  /** Expands the select to the full width of its container. */
  @Prop() fullWidth: boolean = false;
  /** Accessible label for screen readers. */
  @Prop() accessibilityLabel?: string;
  /** Id of the element that describes the select, set as aria-describedby. */
  @Prop() describedBy?: string;
  /** Inline CSS styles applied to the select element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the selection changes; detail contains xId, name and value (a string, or an array when multiple). */
  @Event() ssChange: EventEmitter<SsSelectChangeEvent>;
  /** Emitted when the select gains focus; detail is the native FocusEvent. */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  /** Emitted when the select loses focus; detail is the native FocusEvent. */
  @Event() ssBlur: EventEmitter<FocusEvent>;
  /** Emitted on native invalid events; detail contains xId, name and value (a string, or an array when multiple). */
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
