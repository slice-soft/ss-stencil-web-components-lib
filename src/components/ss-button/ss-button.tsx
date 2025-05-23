import { Component, h, Prop, Event, EventEmitter, State, Element } from '@stencil/core';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'quaternary' | 'success' | 'warning' | 'error' | 'info';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonStyle = 'solid' | 'outline' | 'ghost';
export type ButtonShape = 'rounded' | 'pill' | 'circle' | 'square';
export type ButtonStatus = 'active' | 'disabled' | 'loading';
export type ButtonType = 'button' | 'submit' | 'reset';
export type IconPosition = 'left' | 'right' | 'only';

/**
 * Botón versátil para acciones del usuario:
 * - Variantes (primary, secondary…)
 * - Tamaños (xs–xl)
 * - Estilos (solid, outline, ghost)
 * - Formas (rounded, pill, circle, square)
 * - Control de estado (loading, disabled)
 *
 * @slot icon - Slot para el ícono (izquierda, derecha u “solo”).
 */
@Component({
  tag: 'ss-button',
  styleUrl: 'ss-button.scss',
  shadow: true,
})
export class SsButton {
  @Element() el!: HTMLElement;
  /** Atributo `id` del botón */
  @Prop() xid?: string;
  /** Texto interno o slot default */
  @Prop() label?: string;
  /** Tipo de botón: `button`|`submit`|`reset` */
  @Prop() type: ButtonType = 'button';
  /** Deshabilitado global */
  @Prop() disabled: boolean = false;
  /**
   * Sólo un clic: tras disparar ssClick
   * el botón se deshabilita durante disableDuration
   */
  @Prop() oneClick: boolean = false;
  /** Milisegundos que dura la deshabilitación */
  @Prop() disableDuration: number = 200;
  /** Tamaño: xs, sm, md, lg, xl */
  @Prop() size: ButtonSize = 'md';
  /** Variante de color */
  @Prop() variant: ButtonVariant = 'primary';
  /** Estilo visual */
  @Prop() xStyle: ButtonStyle = 'solid';
  /** Forma del botón */
  @Prop() shape: ButtonShape = 'rounded';
  /** Ocupa todo el ancho del contenedor */
  @Prop() fullWidth: boolean = false;
  /** Estado inicial: active|disabled|loading */
  @Prop() status: ButtonStatus = 'active';
  /** Posición del ícono: left|right|only */
  @Prop() iconPosition: IconPosition = 'right';
  // State
  @State() isTemporarilyDisabled: boolean = false;
  @State() renderStatus: ButtonStatus = 'active';
  /**
  * Se dispara cuando el usuario hace click
  * @event ssClick Emite el `xid` del botón
  */
  @Event() ssClick: EventEmitter<string>;

  componentWillLoad() {
    this.renderStatus = this.status;
  }

  ssClickHandler = (event: MouseEvent) => {
    if (this.disabled || this.isTemporarilyDisabled || this.status === 'disabled' || this.status === 'loading') {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ssClick.emit(this.xid);
    if (this.oneClick) {
      this.isTemporarilyDisabled = true;
      setTimeout(() => {
        this.isTemporarilyDisabled = false;
      }, this.disableDuration);
    }
  }

  private getClasses() {
    const base = 'ss-button';

    return {
      [base]: true,
      [`${base}--${this.variant}`]: true,
      [`${base}--${this.xStyle}`]: true,
      [`${base}--${this.size}`]: true,
      [`${base}--${this.shape}`]: true,
      [`${base}--full-width`]: this.fullWidth,
      [`${base}--status-${this.renderStatus}`]: true,
    };
  }

  render() {
    const isDisabled = this.disabled || this.isTemporarilyDisabled || this.status === 'disabled';
    const hasIcon = !!this.el.querySelector('[slot="icon"]');
    const showLeftIcon = hasIcon && (this.iconPosition === 'left' || this.iconPosition === 'only');
    const showRightIcon = hasIcon && this.iconPosition === 'right';
    const showLabel = this.iconPosition !== 'only';

    return (
      <button
        id={this.xid}
        type={this.type}
        class={this.getClasses()}
        disabled={isDisabled}
        aria-disabled={isDisabled.toString()}
        aria-busy={this.status === 'loading'}
        tabindex={isDisabled ? -1 : 0}
        onClick={this.ssClickHandler}
      >
        {showLeftIcon && (
          <span class="ss-button__icon ss-button__icon--left">
            <slot name="icon" />
          </span>
        )}

        {showLabel && (
          <span class="ss-button__label">
            <slot>{this.label}</slot>
          </span>
        )}

        {showRightIcon && (
          <span class="ss-button__icon ss-button__icon--right">
            <slot name="icon" />
          </span>
        )}
      </button>
    );
  }
}