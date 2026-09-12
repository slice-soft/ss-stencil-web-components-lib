import { Component, Element, h, Prop } from '@stencil/core';
// Types only: erased at compile time, so this adds no runtime dependency on the atom.
import type { AvatarShape, AvatarSize } from '../../atoms/ss-avatar/ss-avatar';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

/** Marks an avatar the `max` limit is hiding. Applied to the child, matched by `::slotted`. */
const HIDDEN = 'ss-avatar-group__hidden';

/**
 * Overlaps a set of avatars into one stack, with an optional count for the ones
 * it does not show.
 *
 * The stack is a single unit to assistive technology: the avatars themselves are
 * hidden from it and the group carries one name, because hearing eight names in
 * a row conveys less than "8 collaborators" when the individual identities are
 * not actionable here.
 *
 * Rendered into a shadow root so that `::slotted` can lay the avatars out. A
 * scoped stylesheet cannot: Stencil marks only the elements a component renders
 * itself with its scope class, never the children the caller slots in, so
 * `.ss-avatar-group ss-avatar { … }` would match nothing.
 *
 * @slot - The `ss-avatar` children.
 */
@Component({
  tag: 'ss-avatar-group',
  styleUrl: 'ss-avatar-group.scss',
  shadow: true,
})
export class SsAvatarGroup {
  @Element() el!: HTMLElement;

  /** Id applied to the rendered container. */
  @Prop() xId?: string;
  /** Accessible name for the stack as a whole. */
  @Prop() accessibilityLabel?: string;
  /** Size shared by every avatar, and by the overflow count. */
  @Prop() size: AvatarSize = 'md';
  /** Shape shared by every avatar. */
  @Prop() shape: AvatarShape = 'circle';
  /** Shows at most this many avatars; the rest become a count. */
  @Prop() max?: number;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /**
   * How many avatars the limit is hiding. A plain field rather than state: it is
   * derived from the light-DOM children, which are readable before the render
   * that needs it, so setting state afterwards would only force a second render.
   */
  private overflow = 0;

  componentWillRender() {
    const total = this.avatars.length;
    this.overflow = Math.max(0, total - this.limitFor(total));
  }

  componentDidLoad() {
    this.syncAvatars();
  }

  componentDidUpdate() {
    this.syncAvatars();
  }

  private get avatars(): HTMLElement[] {
    return Array.from(this.el.querySelectorAll<HTMLElement>('ss-avatar')).filter(avatar => avatar.closest('ss-avatar-group') === this.el);
  }

  /** A missing or meaningless limit shows everything rather than nothing. */
  private limitFor(total: number): number {
    return this.max && this.max > 0 ? this.max : total;
  }

  private syncAvatars() {
    const avatars = this.avatars;
    const limit = this.limitFor(avatars.length);

    avatars.forEach((avatar, index) => {
      const props = avatar as unknown as Record<string, unknown>;
      props.size = this.size;
      props.shape = this.shape;

      // Explicit add/remove rather than `toggle(name, force)`: the force
      // argument is ignored by the spec-test DOM, which would flip the class on
      // every sync instead of setting it.
      if (index >= limit) avatar.classList.add(HIDDEN);
      else avatar.classList.remove(HIDDEN);

      // The stack speaks for itself, so the parts do not speak individually.
      avatar.setAttribute('aria-hidden', 'true');
    });
  }

  private getClasses() {
    const b = 'ss-avatar-group';
    return {
      [b]: true,
      [`${b}--${this.size}`]: true,
      [`${b}--${this.shape}`]: true,
    };
  }

  render() {
    return (
      <div id={this.xId} class={this.getClasses()} style={resolveInlineStyles(this.inlineStyles)} role="img" aria-label={this.accessibilityLabel}>
        <slot />
        {this.overflow > 0 && (
          <span class="ss-avatar-group__overflow" aria-hidden="true">
            +{this.overflow}
          </span>
        )}
      </div>
    );
  }
}
