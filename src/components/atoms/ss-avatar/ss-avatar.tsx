import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarShape = 'circle' | 'rounded' | 'square';
export type SsAvatarImageEvent = { xId?: string; src?: string };

/**
 * @slot - Fallback content when no image is available.
 */
@Component({
  tag: 'ss-avatar',
  styleUrl: 'ss-avatar.scss',
  shadow: true,
})
export class SsAvatar {
  @Prop() xId?: string;
  @Prop() src?: string;
  @Prop() alt?: string;
  @Prop() initials?: string;
  @Prop() size: AvatarSize = 'md';
  @Prop() shape: AvatarShape = 'circle';
  @Prop() loading: 'eager' | 'lazy' = 'lazy';
  @Prop() inlineStyles?: InlineStyles;

  @State() private imageFailed = false;

  @Event() ssLoad: EventEmitter<SsAvatarImageEvent>;
  @Event() ssError: EventEmitter<SsAvatarImageEvent>;

  private get showImage() {
    return !!this.src && !this.imageFailed;
  }

  private get accessibleLabel() {
    return this.alt || this.initials;
  }

  private getClasses() {
    const b = 'ss-avatar';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--${this.shape}`]: true,
      [`${b}--fallback`]: !this.showImage,
    };
  }

  private handleLoad = () => {
    this.ssLoad.emit({ xId: this.xId, src: this.src });
  };

  private handleError = () => {
    this.imageFailed = true;
    this.ssError.emit({ xId: this.xId, src: this.src });
  };

  render() {
    return (
      <span id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)} role="img" aria-label={this.accessibleLabel}>
        {this.showImage ? (
          <img class="ss-avatar__image" src={this.src} alt={this.alt || ''} loading={this.loading} onLoad={this.handleLoad} onError={this.handleError} />
        ) : (
          <span class="ss-avatar__fallback" aria-hidden="true">
            <slot>{this.initials}</slot>
          </span>
        )}
      </span>
    );
  }
}
