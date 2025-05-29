import { Component, h, Prop, Event, EventEmitter, State } from '@stencil/core';
import { parseStyleString } from '../../../utils/style';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';

export type InputStyle = 'solid' | 'outline' | 'underline';
export type SsInputType = 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'time' | 'datetime-local' | 'month' | 'week' | 'file' | 'hidden';

/**
 * Componente de entrada de texto versátil con soporte para múltiples eventos y estilos.
 * - Soporta varios tipos de entrada (texto, contraseña, email, etc.)
 * - Emit eventos para entrada, cambio, enfoque, teclado, selección, portapapeles y más.
 * - Permite estilos personalizados a través de propiedades y clases.
 * - Incluye soporte para validación HTML y eventos de interacción del usuario.
 * - Compatible con diferentes tamaños y variantes de color.
 * - Soporta estilos de entrada como sólido, contorno y subrayado.
 * * @example
 * <ss-input
 *  x-id="my-input"
 *  type="text"
 *  color="primary"
 *  value="Hello World"
 *  placeholder="Enter text"
 *  inline-styles="background-color: lightblue; border: 1px solid blue;"
 *  size="md"
 *  full-width
 *  x-style="solid"
 * ></ss-input>
 */
@Component({
  tag: 'ss-input',
  styleUrl: 'ss-input.scss',
  shadow: true,
})
export class SsInput {
  /** Identificador único para el componente */
  @Prop() xId: string;
  /** Tipo de entrada HTML */
  @Prop() type: SsInputType = 'text';
  /** Color del componente, basado en variantes predefinidas */
  @Prop() color: Variant = 'primary';
  /** Valor actual del input */
  @Prop() value?: string;
  /** Texto de marcador de posición */
  @Prop() placeholder?: string;
  /** Indica si el input está deshabilitado */
  @Prop() disabled: boolean = false;
  /** Estilos en línea personalizados, pueden ser una cadena o un objeto */
  @Prop() inlineStyles?: string | Record<string, string>;
  /** Tamaño del input, puede ser 'sm', 'md', 'lg' */
  @Prop() size: Size = 'md';
  /** Indica si el input debe ocupar todo el ancho disponible */
  @Prop() fullWidth: boolean = false;
  /** Estilo del input, puede ser 'solid', 'outline', 'underline' */
  @Prop() xStyle: InputStyle = 'solid';

  @State() styles: Record<string, string> = {};

  /** Emitted on each keystroke */
  @Event() ssInput: EventEmitter<{ xId: string; value: string }>;

  /** Emitted when the value is “committed” (on blur or Enter) */
  @Event() ssChange: EventEmitter<{ xId: string; value: string }>;

  /** Emitted when the control fails HTML/constraint validation */
  @Event() ssInvalid: EventEmitter<{ xId: string; value: string }>;

  /** Focus events */
  @Event() ssFocus: EventEmitter<FocusEvent>;
  @Event() ssBlur: EventEmitter<FocusEvent>;
  @Event() ssFocusIn: EventEmitter<FocusEvent>;
  @Event() ssFocusOut: EventEmitter<FocusEvent>;

  /** Keyboard events */
  @Event() ssKeyDown: EventEmitter<KeyboardEvent>;
  @Event() ssKeyPress: EventEmitter<KeyboardEvent>;
  @Event() ssKeyUp: EventEmitter<KeyboardEvent>;

  /** Text selection & IME composition */
  @Event() ssSelect: EventEmitter<Event>;
  @Event() ssCompositionStart: EventEmitter<CompositionEvent>;
  @Event() ssCompositionUpdate: EventEmitter<CompositionEvent>;
  @Event() ssCompositionEnd: EventEmitter<CompositionEvent>;

  /** Clipboard events */
  @Event() ssCut: EventEmitter<ClipboardEvent>;
  @Event() ssCopy: EventEmitter<ClipboardEvent>;
  @Event() ssPaste: EventEmitter<ClipboardEvent>;

  /** Mouse/pointer events */
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

  /** Drag & drop */
  @Event() ssDragStart: EventEmitter<DragEvent>;
  @Event() ssDrag: EventEmitter<DragEvent>;
  @Event() ssDragEnter: EventEmitter<DragEvent>;
  @Event() ssDragLeave: EventEmitter<DragEvent>;
  @Event() ssDragOver: EventEmitter<DragEvent>;
  @Event() ssDrop: EventEmitter<DragEvent>;
  @Event() ssDragEnd: EventEmitter<DragEvent>;

  /** Wheel (scroll) */
  @Event() ssWheel: EventEmitter<WheelEvent>;

  /** Touch events */
  @Event() ssTouchStart: EventEmitter<TouchEvent>;
  @Event() ssTouchMove: EventEmitter<TouchEvent>;
  @Event() ssTouchEnd: EventEmitter<TouchEvent>;
  @Event() ssTouchCancel: EventEmitter<TouchEvent>;

  componentWillLoad() {
    if (typeof this.inlineStyles === 'string') {
      this.styles = parseStyleString(this.inlineStyles);
    } else if (this.inlineStyles) {
      this.styles = this.inlineStyles;
    }
  }

  private getClasses() {
    const base = 'ss-input';
    return {
      [base]: true,
      [`${base}--${this.color}`]: true,
      [`${base}--${this.xStyle}`]: true,
      [`${base}--${this.size}`]: true,
      [`${base}--full-width`]: this.fullWidth,
      [`${base}--disabled`]: this.disabled,
    };
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
        onInput={(ev: InputEvent) => {
          const input = ev.target as HTMLInputElement;
          const val = input.value;
          this.ssInput.emit({ xId: this.xId, value: val });
        }}
        onChange={(ev: Event) => {
          const input = ev.target as HTMLInputElement;
          const val = input.value;
          this.ssChange.emit({ xId: this.xId, value: val });
        }}
        onInvalid={(ev: Event) => {
          const input = ev.target as HTMLInputElement;
          const val = input.value;
          this.ssInvalid.emit({ xId: this.xId, value: val });
        }}
        onFocus={ev => this.ssFocus.emit(ev)}
        onBlur={ev => this.ssBlur.emit(ev)}
        onKeyDown={ev => this.ssKeyDown.emit(ev)}
        onKeyPress={ev => this.ssKeyPress.emit(ev)}
        onKeyUp={ev => this.ssKeyUp.emit(ev)}
        onSelect={ev => this.ssSelect.emit(ev)}
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
