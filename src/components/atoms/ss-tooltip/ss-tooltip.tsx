import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

let tooltipId = 0;

export type TooltipPlacement = 'top' | 'right' | 'bottom' | 'left';
export type TooltipTrigger = 'hover' | 'click' | 'manual';
export type SsTooltipOpenChangeEvent = { xId?: string; open: boolean };

/**
 * @slot trigger - Tooltip trigger content.
 * @slot - Tooltip content.
 */
@Component({
  tag: 'ss-tooltip',
  styleUrl: 'ss-tooltip.scss',
  shadow: true,
})
export class SsTooltip {
  private contentId = `ss-tooltip-${++tooltipId}`;

  @Prop() xId?: string;
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  @Prop() content?: string;
  @Prop() placement: TooltipPlacement = 'top';
  @Prop() trigger: TooltipTrigger = 'hover';
  @Prop() disabled: boolean = false;
  @Prop() inlineStyles?: InlineStyles;

  @Event() ssOpenChange: EventEmitter<SsTooltipOpenChangeEvent>;

  private getClasses() {
    const b = 'ss-tooltip';
    return {
      [b]: true,
      [`${b}--${this.placement}`]: true,
      [`${b}--open`]: this.open && !this.disabled,
      [`${b}--disabled`]: this.disabled,
    };
  }

  private setOpen(open: boolean) {
    if (this.disabled || this.trigger === 'manual' || this.open === open) return;
    this.open = open;
    this.ssOpenChange.emit({ xId: this.xId, open });
  }

  private toggleOpen = () => {
    if (this.trigger === 'click') {
      this.setOpen(!this.open);
    }
  };

  render() {
    const visible = this.open && !this.disabled;

    return (
      <span
        id={this.xId}
        class={this.getClasses()}
        style={resolveInlineStyles(this.inlineStyles)}
        onMouseEnter={() => this.trigger === 'hover' && this.setOpen(true)}
        onMouseLeave={() => this.trigger === 'hover' && this.setOpen(false)}
        onFocusin={() => this.trigger === 'hover' && this.setOpen(true)}
        onFocusout={() => this.trigger === 'hover' && this.setOpen(false)}
      >
        <span class="ss-tooltip__trigger" aria-describedby={visible ? this.contentId : undefined} onClick={this.toggleOpen}>
          <slot name="trigger" />
        </span>
        <span id={this.contentId} class="ss-tooltip__content" role="tooltip" aria-hidden={visible ? 'false' : 'true'}>
          <slot>{this.content}</slot>
        </span>
      </span>
    );
  }
}
