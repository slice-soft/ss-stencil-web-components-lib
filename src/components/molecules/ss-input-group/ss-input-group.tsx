import { Component, Element, h, Prop, State } from '@stencil/core';
import { JoinSide } from '../../../types/join';
import { Size } from '../../../types/size';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/** Controls this group will join and size. Anything else is laid out untouched. */
const CONTROLS = 'ss-input,ss-select,ss-combobox,input,select';

/**
 * Joins a control to the addons beside it — a currency symbol, a unit, a button
 * — so the set reads as one field.
 *
 * The seam is made by telling the control which of its corners meet a
 * neighbour, through `join`, rather than by styling it: `ss-input` renders into
 * its own shadow root, and no wrapper can reach a border radius in there. That
 * is also why the addon, not the control, is what this component draws.
 *
 * @slot - The control the addons attach to.
 * @slot start - Content before the control.
 * @slot end - Content after the control.
 */
@Component({
  tag: 'ss-input-group',
  styleUrl: 'ss-input-group.scss',
  shadow: true,
})
export class SsInputGroup {
  @Element() el!: HTMLElement;

  /** Id applied to the rendered container. */
  @Prop() xId?: string;
  /** Size shared by the control and the addons. */
  @Prop() size: Size = 'md';
  /** Disables the control. */
  @Prop() disabled: boolean = false;
  /** Expands the group, and its control, to the full width of the container. */
  @Prop() fullWidth: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /**
   * Bumped when slotted content changes, purely to schedule a render. The addon
   * state itself is read from the light DOM below: `slotchange` does not fire
   * in the spec-test DOM, and the seam is core behaviour that has to be
   * verifiable there, not only in a browser.
   */
  @State() slotVersion = 0;

  private filled = { start: false, end: false };

  componentWillRender() {
    this.filled = { start: this.hasAddon('start'), end: this.hasAddon('end') };
  }

  componentDidLoad() {
    this.syncControl();
  }

  componentDidUpdate() {
    this.syncControl();
  }

  private get control(): HTMLElement | undefined {
    return Array.from(this.el.querySelectorAll<HTMLElement>(CONTROLS)).find(
      el => !el.hasAttribute('slot') && el.closest('ss-input-group') === this.el && !el.parentElement?.closest('ss-input,ss-select,ss-combobox'),
    );
  }

  /** The side, if any, on which the control meets an addon. */
  private get join(): JoinSide | undefined {
    if (this.filled.start && this.filled.end) return 'both';
    if (this.filled.start) return 'start';
    if (this.filled.end) return 'end';
    return undefined;
  }

  private syncControl() {
    const control = this.control;
    if (!control) return;

    const props = control as unknown as Record<string, unknown>;
    if ('join' in control) props.join = this.join;
    if ('size' in control) props.size = this.size;
    if (this.disabled) props.disabled = true;
    if (this.fullWidth && 'fullWidth' in control) props.fullWidth = true;
  }

  private hasAddon(name: string): boolean {
    const addon = this.el.querySelector(`[slot="${name}"]`);
    return !!addon && addon.closest('ss-input-group') === this.el;
  }

  /** A slotchange means the addons may have changed; re-read them on the next render. */
  private trackSlot = () => {
    this.slotVersion += 1;
  };

  private getClasses() {
    const b = 'ss-input-group';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--has-start`]: this.filled.start,
      [`${b}--has-end`]: this.filled.end,
    };
  }

  render() {
    return (
      <div id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
        <span class="ss-input-group__addon ss-input-group__addon--start">
          <slot name="start" onSlotchange={this.trackSlot} />
        </span>
        <span class="ss-input-group__control">
          <slot />
        </span>
        <span class="ss-input-group__addon ss-input-group__addon--end">
          <slot name="end" onSlotchange={this.trackSlot} />
        </span>
      </div>
    );
  }
}
