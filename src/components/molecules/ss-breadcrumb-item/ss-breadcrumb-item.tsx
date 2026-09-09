import { Component, h, Host, Prop } from '@stencil/core';
import type { LinkSize } from '../../atoms/ss-link/ss-link';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/**
 * One step in a breadcrumb trail.
 *
 * It exists because a separator cannot be drawn between slotted children: CSS
 * inside a shadow root cannot reach them, a scoped stylesheet does not apply to
 * them, and `::slotted` takes no pseudo-element. So each step draws its own,
 * and the trail tells it whether it is the last one — the same coordination the
 * rest of this library uses.
 *
 * The last step is the page the reader is already on, so it is text rather than
 * a link, and carries `aria-current="page"`.
 *
 * @slot - The step's text; overrides the `label` prop.
 */
@Component({
  tag: 'ss-breadcrumb-item',
  styleUrl: 'ss-breadcrumb-item.scss',
  scoped: true,
})
export class SsBreadcrumbItem {
  /** Id applied to the rendered element. */
  @Prop() xId?: string;
  /** Where this step leads. Omitted, or on the last step, it renders as plain text. */
  @Prop() href?: string;
  /** Step text, used when no slot content is provided. */
  @Prop() label?: string;
  /** Whether this is the last step. Set by `ss-breadcrumb`; it decides the separator and aria-current. */
  @Prop() last: boolean = false;
  /** Separator drawn after this step. Set by `ss-breadcrumb`. */
  @Prop() separator: string = '/';
  /** Size of the step. Set by `ss-breadcrumb`. */
  @Prop() size: LinkSize = 'md';
  /** Inline CSS styles applied to the rendered element. */
  @Prop() inlineStyles?: InlineStyles;

  private getClasses() {
    const b = 'ss-breadcrumb-item';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--current`]: this.last,
    };
  }

  render() {
    const isLink = !!this.href && !this.last;

    return (
      // `role` is set on the host so the trail keeps list semantics: a custom
      // element is not an `li`, and a browser will not treat it as one.
      <Host role="listitem">
        <span id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)}>
          {isLink ? (
            <ss-link class="ss-breadcrumb-item__link" href={this.href} size={this.size} variant="primary">
              <slot>{this.label}</slot>
            </ss-link>
          ) : (
            <span class="ss-breadcrumb-item__label" aria-current={this.last ? 'page' : undefined}>
              <slot>{this.label}</slot>
            </span>
          )}

          {!this.last && (
            <span class="ss-breadcrumb-item__separator" aria-hidden="true">
              {this.separator}
            </span>
          )}
        </span>
      </Host>
    );
  }
}
