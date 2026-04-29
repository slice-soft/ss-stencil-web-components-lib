import { Component, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { resolveInlineStyles } from '../../../utils/style';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';

export type InputStyle = 'solid' | 'outline' | 'underline';
export type SsInputType = 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'file' | 'hidden';

@Component({
  tag: 'ss-input',
  styleUrl: 'ss-input.scss',
  shadow: true,
})
export class SsInput {
  @Prop() xId: string;
  @Prop() type: SsInputType = 'text';
  @Prop() color: Variant = 'primary';
  @Prop() value?: string;
  @Prop() placeholder?: string;
  @Prop() disabled: boolean = false;
  @Prop() inlineStyles?: string | Record<string, string>;
  @Prop() size: Size = 'md';
  @Prop() fullWidth: boolean = false;
  @Prop() xStyle: InputStyle = 'solid';

  @State() private styles: Record<string, string> = {};

  // Value events
  @Event() ssInput: EventEmitter<{ xId: string; value: string }>;
  @Event() ssChange: EventEmitter<{ xId: string; value: string }>;
  @Event() ssInvalid: EventEmitter<{ xId: string; value: string }>;

  // Focus events
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
  @Event() ssFocusIn: EventEmitter<FocusEvent>;
  @Event() ssFocusOut: EventEmitter<FocusEvent>;

  // Keyboard events
  @Event() ssKeyDown: EventEmitter<KeyboardEvent>;
  @Event() ssKeyPress: EventEmitter<KeyboardEvent>;
  @Event() ssKeyUp: EventEmitter<KeyboardEvent>;

  // Text selection & IME
  @Event() ssSelect: EventEmitter<Event>;
  @Event() ssCompositionStart: EventEmitter<CompositionEvent>;
  @Event() ssCompositionUpdate: EventEmitter<CompositionEvent>;
  @Event() ssCompositionEnd: EventEmitter<CompositionEvent>;

  // Clipboard
  @Event() ssCut: EventEmitter<ClipboardEvent>;
  @Event() ssCopy: EventEmitter<ClipboardEvent>;
  @Event() ssPaste: EventEmitter<ClipboardEvent>;

  // Mouse / pointer
  @Event() ssClick: EventEmitter<MouseEvent>;
  @Event() ssDoubleClick: EventEmitter<MouseEvent>;
  @Event() ssMouseDown: EventEmitter<MouseEvent>;
  @Event() ssMouseUp: EventEmitter<MouseEvent>;
  @Event() ssMouseEnter: EventEmitter<MouseEvent>;
  @Event() ssMouseLeave: EventEmitter<MouseEvent>;
  @Event() ssMouseOver: EventEmitter<MouseEvent>;
  @Event() ssMouseOut: EventEmitter<MouseEvent>;
  @Event() ssMouseMove: EventEmitter<MouseEvent>;
  @Event() ssContextMenu: EventEmitter<MouseEvent>;

  // Drag & drop
  @Event() ssDragStart: EventEmitter<DragEvent>;
  @Event() ssDrag: EventEmitter<DragEvent>;
  @Event() ssDragEnter: EventEmitter<DragEvent>;
  @Event() ssDragLeave: EventEmitter<DragEvent>;
  @Event() ssDragOver: EventEmitter<DragEvent>;
  @Event() ssDrop: EventEmitter<DragEvent>;
  @Event() ssDragEnd: EventEmitter<DragEvent>;

  // Wheel & touch
  @Event() ssWheel: EventEmitter<WheelEvent>;
  @Event() ssTouchStart: EventEmitter<TouchEvent>;
  @Event() ssTouchMove: EventEmitter<TouchEvent>;
  @Event() ssTouchEnd: EventEmitter<TouchEvent>;
  @Event() ssTouchCancel: EventEmitter<TouchEvent>;

  componentWillLoad() {
    this.styles = resolveInlineStyles(this.inlineStyles);
  }

  private getClasses() {
    const b = 'ss-input';
    return {
      [b]: true,
      [`${b}--${this.color}`]: true,
      [`${b}--${this.xStyle}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
    };
  }

  private emitValue(ev: Event) {
    return { xId: this.xId, value: (ev.target as HTMLInputElement).value };
  }

  render() {
    return (
      <input
        id={this.xId}
        type={this.type}
        class={this.getClasses()}
        style={this.styles}
        disabled={this.disabled}
        placeholder={this.placeholder}
        value={this.value}
        onInput={ev => this.ssInput.emit(this.emitValue(ev))}
        onChange={ev => this.ssChange.emit(this.emitValue(ev))}
        onInvalid={ev => this.ssInvalid.emit(this.emitValue(ev))}
        onFocus={ev => this.ssFocus.emit(ev)}
        onBlur={ev => this.ssBlur.emit(ev)}
        onFocusin={ev => this.ssFocusIn.emit(ev)}
        onFocusout={ev => this.ssFocusOut.emit(ev)}
        onKeyDown={ev => this.ssKeyDown.emit(ev)}
        onKeyPress={ev => this.ssKeyPress.emit(ev)}
        onKeyUp={ev => this.ssKeyUp.emit(ev)}
        onSelect={ev => this.ssSelect.emit(ev)}
        onCompositionstart={ev => this.ssCompositionStart.emit(ev)}
        onCompositionupdate={ev => this.ssCompositionUpdate.emit(ev)}
        onCompositionend={ev => this.ssCompositionEnd.emit(ev)}
        onCut={ev => this.ssCut.emit(ev)}
        onCopy={ev => this.ssCopy.emit(ev)}
        onPaste={ev => this.ssPaste.emit(ev)}
        onClick={ev => this.ssClick.emit(ev)}
        onDblClick={ev => this.ssDoubleClick.emit(ev)}
        onMouseDown={ev => this.ssMouseDown.emit(ev)}
        onMouseUp={ev => this.ssMouseUp.emit(ev)}
        onMouseEnter={ev => this.ssMouseEnter.emit(ev)}
        onMouseLeave={ev => this.ssMouseLeave.emit(ev)}
        onMouseOver={ev => this.ssMouseOver.emit(ev)}
        onMouseOut={ev => this.ssMouseOut.emit(ev)}
        onMouseMove={ev => this.ssMouseMove.emit(ev)}
        onContextMenu={ev => this.ssContextMenu.emit(ev)}
        onDragStart={ev => this.ssDragStart.emit(ev)}
        onDrag={ev => this.ssDrag.emit(ev)}
        onDragEnter={ev => this.ssDragEnter.emit(ev)}
        onDragLeave={ev => this.ssDragLeave.emit(ev)}
        onDragOver={ev => this.ssDragOver.emit(ev)}
        onDrop={ev => this.ssDrop.emit(ev)}
        onDragEnd={ev => this.ssDragEnd.emit(ev)}
        onWheel={ev => this.ssWheel.emit(ev)}
        onTouchStart={ev => this.ssTouchStart.emit(ev)}
        onTouchMove={ev => this.ssTouchMove.emit(ev)}
        onTouchEnd={ev => this.ssTouchEnd.emit(ev)}
        onTouchCancel={ev => this.ssTouchCancel.emit(ev)}
      />
    );
  }
}
