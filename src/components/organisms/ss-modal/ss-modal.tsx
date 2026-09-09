import { Component, Element, Event, EventEmitter, h, Prop, Watch } from '@stencil/core';
import { Size } from '../../../types/size';
import { onDismiss } from '../../../utils/dismiss';
import { trapFocus } from '../../../utils/focus';
import { nextId } from '../../../utils/id';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SsModalOpenChangeEvent = { xId?: string; open: boolean };

/**
 * A dialog that takes over the page until it is answered.
 *
 * It is the first consumer of the overlay utilities, and it is what proves
 * them: the focus trap and the dismissal behaviour are only really testable
 * through something that mounts them in a browser.
 *
 * Rendered scoped rather than shadow so the trap can see the caller's content.
 * Focus order is a property of the composed tree, and a light-DOM query inside
 * a shadow root would find only what the dialog itself renders — a dialog full
 * of the caller's controls would look empty and trap focus on nothing.
 *
 * @slot - The dialog's content.
 * @slot header - Rich header content; overrides the `heading` prop.
 * @slot footer - Actions, usually the ones that answer the dialog.
 */
@Component({
  tag: 'ss-modal',
  styleUrl: 'ss-modal.scss',
  scoped: true,
})
export class SsModal {
  @Element() el!: HTMLElement;

  private modalId = nextId('ss-modal');
  private dialogEl?: HTMLElement;
  private releaseFocus?: () => void;
  private releaseDismiss?: () => void;
  private previousBodyOverflow?: string;

  /** Id applied to the dialog element. */
  @Prop() xId?: string;
  /** Whether the dialog is showing. Updated when it is dismissed, and reflected. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** Heading text, used when no header slot content is provided. */
  @Prop() heading?: string;
  /** Accessible name, for a dialog with no visible heading. */
  @Prop() accessibilityLabel?: string;
  /** Width of the dialog. */
  @Prop() size: Size = 'md';
  /** Renders a close button in the header. */
  @Prop() dismissible: boolean = true;
  /** Accessible label for the close button. */
  @Prop() dismissLabel: string = 'Close';
  /** Escape closes the dialog. */
  @Prop() closeOnEscape: boolean = true;
  /** Pressing the backdrop closes the dialog. */
  @Prop() closeOnBackdrop: boolean = true;
  /** Inline CSS styles applied to the dialog element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the dialog opens or closes through an interaction; detail contains xId and open. */
  @Event() ssOpenChange: EventEmitter<SsModalOpenChangeEvent>;

  componentDidLoad() {
    if (this.open) this.activate();
  }

  disconnectedCallback() {
    this.deactivate();
  }

  @Watch('open')
  handleOpenChange(open: boolean) {
    if (open) this.activate();
    else this.deactivate();
  }

  private get headerId() {
    return `${this.modalId}-header`;
  }

  private get hasHeaderSlot() {
    return !!this.el.querySelector('[slot="header"]');
  }

  private get hasHeading() {
    return this.hasHeaderSlot || !!this.heading;
  }

  /**
   * Takes over: focus goes inside and stays there, Escape and the backdrop are
   * watched, and the page behind stops scrolling — otherwise a wheel over the
   * backdrop moves content the reader cannot reach.
   */
  private activate() {
    if (!this.dialogEl || this.releaseFocus) return;

    this.releaseFocus = trapFocus(this.dialogEl);
    this.releaseDismiss = onDismiss(this.dialogEl, {
      escape: this.closeOnEscape,
      outside: this.closeOnBackdrop,
      onDismiss: () => this.close(),
    });

    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  /** Hands the page back, including the focus the dialog took. */
  private deactivate() {
    this.releaseFocus?.();
    this.releaseDismiss?.();
    this.releaseFocus = undefined;
    this.releaseDismiss = undefined;

    if (this.previousBodyOverflow !== undefined) {
      document.body.style.overflow = this.previousBodyOverflow;
      this.previousBodyOverflow = undefined;
    }
  }

  private close = () => {
    if (!this.open) return;
    this.open = false;
    this.ssOpenChange.emit({ xId: this.xId, open: false });
  };

  private getClasses() {
    const b = 'ss-modal';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--open`]: this.open,
    };
  }

  render() {
    return (
      <div class={this.getClasses()} hidden={!this.open}>
        <div class="ss-modal__backdrop" />

        <div
          id={this.xId}
          class="ss-modal__dialog"
          style={resolveInlineStyles(this.inlineStyles)}
          ref={el => (this.dialogEl = el)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={this.hasHeading ? this.headerId : undefined}
          aria-label={this.hasHeading ? undefined : this.accessibilityLabel}
          tabindex={-1}
        >
          <div class="ss-modal__header">
            <ss-typography xId={this.headerId} class="ss-modal__heading" as="strong" fontSize="lg">
              {this.hasHeaderSlot ? <slot name="header" /> : this.heading}
            </ss-typography>

            {this.dismissible && (
              <button class="ss-modal__dismiss" type="button" aria-label={this.dismissLabel} onClick={this.close}>
                <span aria-hidden="true">&times;</span>
              </button>
            )}
          </div>

          <div class="ss-modal__body">
            <slot />
          </div>

          <div class="ss-modal__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    );
  }
}
