import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ss-button',
  styleUrl: 'ss-button.scss',
  shadow: true,
})
export class SsButton {
  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }
}
