import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type LinkSize = 'sm' | 'md' | 'lg';
export type LinkUnderline = 'none' | 'hover' | 'always';
export type LinkTarget = '_self' | '_blank' | '_parent' | '_top';
export type SsLinkClickEvent = { xId?: string; href?: string };

/**
 * @slot - Link content.
 */
@Component({
  tag: 'ss-link',
  styleUrl: 'ss-link.scss',
  shadow: true,
})
export class SsLink {
  /** Id applied to the anchor element; also included in the ssClick detail. */
  @Prop() xId?: string;
  /** Destination URL; omitted from the anchor while disabled. */
  @Prop() href?: string;
  /** Link text rendered when no slot content is provided; also the aria-label fallback. */
  @Prop() label?: string;
  /** Where to open the link: _self, _blank, _parent or _top. */
  @Prop() target?: LinkTarget;
  /** Custom rel attribute; defaults to noopener noreferrer when target is _blank. */
  @Prop() rel?: string;
  /** Native download attribute; prompts a download instead of navigating. */
  @Prop() download?: string;
  /** Color variant of the link. */
  @Prop() variant: Variant = 'primary';
  /** Size of the link: sm, md or lg. */
  @Prop() size: LinkSize = 'md';
  /** Underline behavior: none, hover or always. */
  @Prop() underline: LinkUnderline = 'hover';
  /** Disables the link: removes href, blocks clicks and sets aria-disabled. */
  @Prop() disabled: boolean = false;
  /** Accessible label for screen readers; falls back to label. */
  @Prop() accessibilityLabel?: string;
  /** Value for aria-current, for example page. */
  @Prop() current?: string;
  /** Inline CSS styles applied to the anchor element. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the link is clicked while enabled; detail contains xId and href. */
  @Event() ssClick: EventEmitter<SsLinkClickEvent>;

  private get computedRel() {
    if (this.rel) return this.rel;
    return this.target === '_blank' ? 'noopener noreferrer' : undefined;
  }

  private getClasses() {
    const b = 'ss-link';
    return {
      [b]: true,
      [`${b}--${this.variant}`]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--underline-${this.underline}`]: true,
      [`${b}--disabled`]: this.disabled,
    };
  }

  private handleClick = (event: MouseEvent) => {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.ssClick.emit({ xId: this.xId, href: this.href });
  };

  render() {
    return (
      <a
        id={this.xId}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        href={this.disabled ? undefined : this.href}
        target={this.target}
        rel={this.computedRel}
        download={this.download}
        aria-disabled={this.disabled ? 'true' : undefined}
        aria-label={this.accessibilityLabel || this.label}
        aria-current={this.current}
        tabindex={this.disabled ? -1 : undefined}
        onClick={this.handleClick}
      >
        <slot>{this.label}</slot>
      </a>
    );
  }
}
