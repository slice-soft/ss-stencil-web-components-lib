import { Component, Element, h, Host, Prop } from '@stencil/core';

export type DropdownItemVariant = 'default' | 'destructive';

/**
 * One action in an `ss-dropdown` menu.
 *
 * The item is the host itself: `role="menuitem"` and the roving focus both sit
 * on the element the caller wrote, so each item is a direct child of the menu
 * in the accessibility tree and the menu can move focus by calling `focus()`
 * on it. It is never a tab stop — the menu moves focus between items.
 *
 * It does nothing on its own. The menu listens for the press and reports the
 * item's value, so a set of items needs one listener, not one per item.
 *
 * @slot - The item's text; overrides the `label` prop.
 * @slot icon - A leading icon, typically an `ss-icon`. Decorative.
 */
@Component({
  tag: 'ss-dropdown-item',
  styleUrl: 'ss-dropdown-item.scss',
  scoped: true,
})
export class SsDropdownItem {
  @Element() el!: HTMLElement;

  /** Value reported by the menu when this item is picked. Defaults to the label, then the text. */
  @Prop() value?: string;
  /** Item text, used when no slot content is provided. Also what typing a letter matches against. */
  @Prop() label?: string;
  /** Disables the item; it is skipped by the arrow keys and cannot be picked. */
  @Prop() disabled: boolean = false;
  /** Visual treatment. `destructive` marks an action that removes something. */
  @Prop() variant: DropdownItemVariant = 'default';

  private getClasses() {
    const b = 'ss-dropdown-item';
    return {
      [b]: true,
      [`${b}--${this.variant}`]: true,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    const hasIcon = !!this.el.querySelector('[slot="icon"]');

    return (
      <Host role="menuitem" tabindex="-1" aria-disabled={this.disabled ? 'true' : undefined}>
        <span class={this.getClasses()}>
          {hasIcon && (
            <span class="ss-dropdown-item__icon" aria-hidden="true">
              <slot name="icon" />
            </span>
          )}
          <span class="ss-dropdown-item__label">
            <slot>{this.label}</slot>
          </span>
        </span>
      </Host>
    );
  }
}
