import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { InputStyle, SsInputValueEvent } from '../../../types/control-events';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

let comboboxId = 0;

/**
 * @slot - Native option elements for the internal datalist.
 */
@Component({
  tag: 'ss-combobox',
  styleUrl: 'ss-combobox.scss',
  scoped: true,
})
export class SsCombobox {
  private readonly fallbackListId = `ss-combobox-list-${comboboxId++}`;

  @Prop() xId?: string;
  @Prop() name?: string;
  @Prop() value?: string;
  @Prop() placeholder?: string;
  @Prop() color: Variant = 'primary';
  @Prop() xStyle: InputStyle = 'solid';
  @Prop() size: Size = 'md';
  @Prop() disabled: boolean = false;
  @Prop() readonly: boolean = false;
  @Prop() required: boolean = false;
  @Prop() invalid: boolean = false;
  @Prop() autocomplete?: string;
  @Prop() minLength?: number;
  @Prop() maxLength?: number;
  @Prop() fullWidth: boolean = false;
  @Prop() listId?: string;
  @Prop() accessibilityLabel?: string;
  @Prop() describedBy?: string;
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssInput: EventEmitter<SsInputValueEvent>;
  @Event() ssChange: EventEmitter<SsInputValueEvent>;
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
  @Event() ssInvalid: EventEmitter<SsInputValueEvent>;

  private get computedListId() {
    return this.listId ?? (this.xId ? `${this.xId}-list` : this.fallbackListId);
  }

  private getClasses() {
    const b = 'ss-combobox';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--readonly`]: this.readonly,
      [`${b}--invalid`]: this.invalid,
    };
  }

  private emitValue(event: Event): SsInputValueEvent {
    return { xId: this.xId, value: (event.target as HTMLInputElement).value };
  }

  render() {
    return (
      <span class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <input
          id={this.xId}
          class="ss-combobox__input"
          type="text"
          name={this.name}
          value={this.value}
          placeholder={this.placeholder}
          list={this.computedListId}
          disabled={this.disabled}
          readOnly={this.readonly}
          required={this.required}
          autoComplete={this.autocomplete}
          minLength={this.minLength}
          maxLength={this.maxLength}
          aria-invalid={this.invalid ? 'true' : undefined}
          aria-label={this.accessibilityLabel}
          aria-describedby={this.describedBy}
          role="combobox"
          aria-autocomplete="list"
          onInput={event => this.ssInput.emit(this.emitValue(event))}
          onChange={event => this.ssChange.emit(this.emitValue(event))}
          onFocus={event => this.ssFocus.emit(event)}
          onBlur={event => this.ssBlur.emit(event)}
          onInvalid={event => this.ssInvalid.emit(this.emitValue(event))}
        />
        <datalist id={this.computedListId}>
          <slot />
        </datalist>
      </span>
    );
  }
}
