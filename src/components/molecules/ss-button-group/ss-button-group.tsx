import { Component, Element, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * Presents a set of related actions as one group: shared sizing and styling in
 * one place, and an accessible name for the set.
 *
 * The buttons are **not** visually joined into a single segmented control.
 * `ss-button` renders into its own shadow root and exposes no `::part`, so
 * nothing outside it can square off the corners where two buttons meet. Doing
 * that properly is an `ss-button` change — a new shape, or exported parts — not
 * something this group can reach in from the outside.
 *
 * @slot - The `ss-button` children. Other elements are laid out but not coordinated.
 */
@Component({
  tag: 'ss-button-group',
  styleUrl: 'ss-button-group.scss',
  scoped: true,
})
export class SsButtonGroup {
  @Element() el!: HTMLElement;

  /** Id applied to the rendered container. */
  @Prop() xId?: string;
  /** Accessible name for the set of actions. */
  @Prop() accessibilityLabel?: string;
  /** Lays the actions out in a row, or stacks them. */
  @Prop() orientation: ButtonGroupOrientation = 'horizontal';
  /** Size shared by every button. */
  @Prop() size?: Size;
  /** Colour variant shared by every button. */
  @Prop() variant?: Variant;
  /** Disables every button in the group. */
  @Prop() disabled: boolean = false;
  /** Expands the group, and its buttons, to the full width of the container. */
  @Prop() fullWidth: boolean = false;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  componentDidLoad() {
    this.syncButtons();
  }

  componentDidUpdate() {
    this.syncButtons();
  }

  private get buttons(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('ss-button')).filter(button => button.closest('ss-button-group') === this.el);
  }

  /**
   * Only what the group was actually given is forwarded, so a button that sets
   * its own variant to stand out from its neighbours keeps it.
   */
  private syncButtons() {
    this.buttons.forEach(button => {
      const props = button as unknown as Record<string, unknown>;
      if (this.size !== undefined) props.size = this.size;
      if (this.variant !== undefined) props.variant = this.variant;
      if (this.disabled) props.disabled = true;
      if (this.fullWidth) props.fullWidth = true;
    });
  }

  private getClasses() {
    const b = 'ss-button-group';
    return {
      [b]: true,
      [`${b}--${this.orientation}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    return (
      <div id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)} role="group" aria-label={this.accessibilityLabel}>
        <slot />
      </div>
    );
  }
}
