import { Component, Element, h, Prop } from '@stencil/core';
import { JoinSide } from '../../../types/join';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type ButtonGroupOrientation = 'horizontal' | 'vertical';

/**
 * Presents a set of related actions as one group: shared sizing and styling in
 * one place, and an accessible name for the set.
 *
 * With `attached`, the buttons become one segmented control. The seam is made
 * by telling each button which of its corners meet a neighbour, through `join`,
 * because `ss-button` renders into its own shadow root and no wrapper can reach
 * a border radius in there. Attaching applies to a horizontal row: a vertical
 * group would need to flatten block corners, which `join` does not describe.
 *
 * @slot - The `ss-button` children. Other elements are laid out but not coordinated.
 */
@Component({
  tag: 'ss-button-group',
  styleUrl: 'ss-button-group.scss',
  shadow: true,
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
  /** Joins the buttons into one segmented control. Horizontal groups only. */
  @Prop() attached: boolean = false;
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
    const buttons = this.buttons;

    buttons.forEach((button, index) => {
      const props = button as unknown as Record<string, unknown>;
      if (this.size !== undefined) props.size = this.size;
      if (this.variant !== undefined) props.variant = this.variant;
      if (this.disabled) props.disabled = true;
      if (this.fullWidth) props.fullWidth = true;
      props.join = this.joinFor(index, buttons.length);
    });
  }

  /** A lone button has no neighbour, so nothing about it is flattened. */
  private joinFor(index: number, total: number): JoinSide | undefined {
    if (!this.attached || this.orientation !== 'horizontal' || total < 2) return undefined;
    if (index === 0) return 'end';
    if (index === total - 1) return 'start';
    return 'both';
  }

  private getClasses() {
    const b = 'ss-button-group';
    return {
      [b]: true,
      [`${b}--${this.orientation}`]: true,
      [`${b}--full-width`]: this.fullWidth,
      [`${b}--disabled`]: this.disabled,
      [`${b}--attached`]: this.attached && this.orientation === 'horizontal',
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
