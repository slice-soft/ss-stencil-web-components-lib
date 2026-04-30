import { Component, h, Prop } from '@stencil/core';
import { Size } from '../../../types/size';
import { Variant } from '../../../types/variant';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

@Component({
  tag: 'ss-spinner',
  styleUrl: 'ss-spinner.scss',
  shadow: true,
})
export class SsSpinner {
  @Prop() xId?: string;
  @Prop() size: Size = 'md';
  @Prop() color: Variant | 'foreground' | 'muted' | 'current' = 'primary';
  @Prop() label: string = 'Loading';
  @Prop() inlineStyles?: InlineStyles;

  private getClasses() {
    const b = 'ss-spinner';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--${this.color}`]: true,
    };
  }

  render() {
    return (
      <span id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)} role="status" aria-live="polite" aria-label={this.label}>
        <span class="ss-spinner__track" aria-hidden="true" />
      </span>
    );
  }
}
