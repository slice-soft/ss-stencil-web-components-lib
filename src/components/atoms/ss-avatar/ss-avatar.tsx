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
  /** Id applied to the root element; also included in event details. */
  @Prop() xId?: string;
  /** Image URL to display; the fallback content is shown when omitted or when loading fails. */
  @Prop() src?: string;
  /** Alt text for the image; also used as the accessible label of the avatar. */
  @Prop() alt?: string;
  /** Initials shown as fallback when no image is available and no slot content is provided. */
  @Prop() initials?: string;
  /** Size of the avatar. */
  @Prop() size: AvatarSize = 'md';
  /** Shape of the avatar: circle, rounded or square. */
  @Prop() shape: AvatarShape = 'circle';
  /** Native image loading behavior; lazy defers loading until the image is near the viewport. */
  @Prop() loading: 'eager' | 'lazy' = 'lazy';
  /** Inline CSS styles applied to the root element. */
  @Prop() inlineStyles?: InlineStyles;

  @State() private imageFailed = false;

  /** Emitted when the image loads successfully; detail contains xId and src. */
  @Event() ssLoad: EventEmitter<SsAvatarImageEvent>;
  /** Emitted when the image fails to load; detail contains xId and src. */
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
