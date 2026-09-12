import { Component, Element, h, Host, Prop } from '@stencil/core';
import type { Orientation } from '../../../utils/roving';

/**
 * One link in an `ss-nav`.
 *
 * It renders a real `<a>`, and marks it with `aria-current="page"` when it is
 * the page the reader is on — on the link itself, the element that takes focus
 * and that a screen reader announces. `ss-nav` decides which item is current
 * and tells it, through `current`.
 *
 * A disabled item keeps its place but is no longer a link anyone can follow:
 * it loses its `href`, so it drops out of the tab order, and is announced as a
 * disabled link.
 *
 * @slot - The item's text; overrides the `label` prop.
 * @slot icon - A leading icon, typically an `ss-icon`. Decorative.
 */
@Component({
  tag: 'ss-nav-item',
  styleUrl: 'ss-nav-item.scss',
  scoped: true,
})
export class SsNavItem {
  @Element() el!: HTMLElement;

  /** Where the item leads. */
  @Prop() href?: string;
  /** Item text, used when no slot content is provided. */
  @Prop() label?: string;
  /** Value that identifies the item to `ss-nav`. Defaults to the href. */
  @Prop() value?: string;
  /** Disables the item; it can no longer be followed or reached by Tab. */
  @Prop() disabled: boolean = false;
  /** Whether this is the page the reader is on. Set by `ss-nav`. */
  @Prop() current: boolean = false;
  /** Direction of the navigation it sits in. Set by `ss-nav`. */
  @Prop() orientation: Orientation = 'horizontal';

  private getClasses() {
    const b = 'ss-nav-item';
    return {
      [b]: true,
      [`${b}--${this.orientation}`]: true,
      [`${b}--current`]: this.current,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    const hasIcon = !!this.el.querySelector('[slot="icon"]');

    return (
      // `role` is set on the host so the navigation keeps list semantics: a
      // custom element is not an `li`, and a browser will not treat it as one.
      <Host role="listitem">
        <a
          class={this.getClasses()}
          href={this.disabled ? undefined : this.href}
          role={this.disabled ? 'link' : undefined}
          aria-disabled={this.disabled ? 'true' : undefined}
          aria-current={this.current ? 'page' : undefined}
        >
          {hasIcon && (
            <span class="ss-nav-item__icon" aria-hidden="true">
              <slot name="icon" />
            </span>
          )}
          <span class="ss-nav-item__label">
            <slot>{this.label}</slot>
          </span>
        </a>
      </Host>
    );
  }
}
