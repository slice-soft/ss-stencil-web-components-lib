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
  @Prop() xId?: string;
  @Prop() href?: string;
  @Prop() label?: string;
  @Prop() target?: LinkTarget;
  @Prop() rel?: string;
  @Prop() download?: string;
  @Prop() variant: Variant = 'primary';
  @Prop() size: LinkSize = 'md';
  @Prop() underline: LinkUnderline = 'hover';
  @Prop() disabled: boolean = false;
  @Prop() accessibilityLabel?: string;
  @Prop() current?: string;
  @Prop() inlineStyles?: InlineStyles;

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
