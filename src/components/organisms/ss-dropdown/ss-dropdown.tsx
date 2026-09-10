import { Component, Element, Event, EventEmitter, h, Listen, Prop, State, Watch } from '@stencil/core';
import { onDismiss } from '../../../utils/dismiss';
import { focusInto } from '../../../utils/focus';
import { markTrigger, slottedIn } from '../../../utils/popup';
import { Align, anchorTo, onResize, Placement } from '../../../utils/position';
import { rovingIndex, typeaheadIndex } from '../../../utils/roving';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SsDropdownOpenChangeEvent = { xId?: string; open: boolean };

/** Emitted when an item is picked. */
export interface SsDropdownSelectEvent {
  xId?: string;
  value: string;
}

/** Gap from the trigger, and the least space to leave against a viewport edge. */
const OFFSET = 4;
const EDGE_PADDING = 8;

type Item = HTMLElement & { value?: string; label?: string; disabled?: boolean };

const isDisabled = (item: Item) => !!item.disabled || item.hasAttribute('disabled');

/**
 * A button that opens a list of actions.
 *
 * It follows the WAI-ARIA menu button pattern, because that is what a screen
 * reader announces a `menu` as and what its users will press: the menu takes
 * focus when it opens; arrows move through the items and wrap; Home and End
 * jump to the ends; a typed letter moves to the next item starting with it;
 * Enter or Space picks one. Picking an item, or Escape, closes the menu and
 * hands focus back to the button. Tab closes it and lets focus move on — the
 * items are not tab stops, so a menu costs one stop in the page's tab order
 * however long it is.
 *
 * A menu is for actions. For a value a form submits, use `ss-select`.
 *
 * @slot trigger - The button that opens the menu, usually an `ss-button`.
 * @slot - The `ss-dropdown-item` entries, optionally separated by `ss-divider`.
 */
@Component({
  tag: 'ss-dropdown',
  styleUrl: 'ss-dropdown.scss',
  scoped: true,
})
export class SsDropdown {
  @Element() el!: HTMLElement;

  private triggerEl?: HTMLElement;
  private menuEl?: HTMLElement;
  private releaseDismiss?: () => void;
  private releaseResize?: () => void;
  /** Which item takes focus once the menu has rendered. ArrowUp on the trigger asks for the last one. */
  private pendingFocus?: 'first' | 'last';

  /** The side the menu ended up on. See `ss-tooltip` for why this is a field plus a counter. */
  private resolvedPlacement?: Placement;
  @State() placementVersion = 0;

  /** Id applied to the menu. */
  @Prop() xId?: string;
  /** Whether the menu is showing. Updated on interaction, and reflected. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** Accessible name for the menu. Defaults to the trigger's label, which is what the reader just pressed. */
  @Prop() accessibilityLabel?: string;
  /** Side of the trigger to open on. Moves to the opposite side when there is no room. */
  @Prop() placement: Placement = 'bottom';
  /** Alignment along the trigger's edge: start, center or end. A menu reads best hanging from the start. */
  @Prop() align: Align = 'start';
  /** Disables the dropdown; the menu stays closed and the trigger does nothing. */
  @Prop() disabled: boolean = false;
  /** Inline CSS styles applied to the menu. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when an interaction opens or closes the menu, not when `open` is set from outside; detail contains xId and open. */
  @Event() ssOpenChange: EventEmitter<SsDropdownOpenChangeEvent>;
  /** Emitted when an item is picked; detail contains xId and the item's value. */
  @Event() ssSelect: EventEmitter<SsDropdownSelectEvent>;

  componentDidLoad() {
    this.syncTrigger();
    if (this.visible) {
      this.pendingFocus = 'first';
      this.activate();
    }
  }

  componentDidUpdate() {
    this.syncTrigger();
    if (this.visible) this.activate();
    this.reposition();
  }

  disconnectedCallback() {
    this.deactivate();
  }

  /**
   * Closing runs before the render that hides the menu, while focus can still
   * be rescued from it. Opening only records that an item should take focus;
   * that happens after the render, once the menu can hold it.
   */
  @Watch('open')
  @Watch('disabled')
  handleVisibilityChange() {
    if (!this.visible) {
      this.pendingFocus = undefined;
      this.deactivate();
    } else {
      this.pendingFocus ??= 'first';
    }
  }

  @Listen('scroll', { target: 'window', capture: true })
  @Listen('resize', { target: 'window' })
  handleViewportChange() {
    if (this.visible) this.reposition();
  }

  private get visible() {
    return this.open && !this.disabled;
  }

  private get trigger() {
    return slottedIn(this.el, 'trigger');
  }

  private get items(): Item[] {
    return Array.from(this.el.querySelectorAll<Item>('ss-dropdown-item')).filter(item => item.closest('ss-dropdown') === this.el);
  }

  /** The trigger's own label names the menu, since that is what the reader just pressed. */
  private get menuLabel(): string | undefined {
    if (this.accessibilityLabel) return this.accessibilityLabel;

    const trigger = this.trigger as (HTMLElement & { label?: string; accessibilityLabel?: string }) | null;
    if (!trigger) return undefined;
    if (trigger.localName === 'ss-button') return trigger.accessibilityLabel || trigger.label;
    return trigger.getAttribute('aria-label') || trigger.textContent?.trim() || undefined;
  }

  private syncTrigger() {
    markTrigger(this.trigger, 'menu', this.visible);
  }

  private activate() {
    if (!this.menuEl) return;

    if (!this.releaseDismiss) {
      this.reposition();
      this.releaseResize = onResize([this.triggerEl, this.menuEl], () => this.reposition());
      this.releaseDismiss = onDismiss(this.el, { onDismiss: () => this.setOpen(false) });
    }

    this.focusPending();
  }

  private deactivate() {
    if (!this.releaseDismiss) return;

    this.releaseDismiss();
    this.releaseDismiss = undefined;
    this.releaseResize?.();
    this.releaseResize = undefined;

    // Hiding the menu would drop focus on the page. A reader still in it goes
    // back to the button; one who pressed somewhere else stays there.
    if (this.menuEl?.contains(document.activeElement)) focusInto(this.trigger);
  }

  private reposition() {
    if (!this.visible || !this.triggerEl || !this.menuEl) {
      this.resolvedPlacement = undefined;
      return;
    }

    const placement = anchorTo(this.triggerEl, this.menuEl, { placement: this.placement, align: this.align, offset: OFFSET, padding: EDGE_PADDING });

    if (this.resolvedPlacement === placement) return;
    this.resolvedPlacement = placement;
    this.placementVersion += 1;
  }

  private focusItem(index: number) {
    this.items[index]?.focus({ preventScroll: true });
  }

  private focusPending() {
    if (!this.pendingFocus) return;

    const items = this.items;
    const index = rovingIndex(this.pendingFocus === 'first' ? 'Home' : 'End', -1, items.length, { disabled: i => isDisabled(items[i]) });
    this.pendingFocus = undefined;

    // A menu with nothing to pick still holds focus, so Escape and Tab work.
    if (index === null) this.menuEl?.focus();
    else this.focusItem(index);
  }

  private setOpen(open: boolean) {
    if (this.disabled || this.open === open) return;
    this.open = open;
    this.ssOpenChange.emit({ xId: this.xId, open });
  }

  private select(item: Item) {
    if (isDisabled(item)) return;

    const value = item.value ?? item.label ?? item.textContent?.trim() ?? '';
    this.ssSelect.emit({ xId: this.xId, value });
    this.setOpen(false);
  }

  /** The item an event happened on, if it belongs to this menu. */
  private itemFrom(event: Event): Item | null {
    const item = (event.target as Element | null)?.closest?.('ss-dropdown-item') as Item | null;
    return item && item.closest('ss-dropdown') === this.el ? item : null;
  }

  private toggle = () => this.setOpen(!this.open);

  private handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    event.preventDefault();
    this.pendingFocus = event.key === 'ArrowDown' ? 'first' : 'last';
    if (this.open) this.focusPending();
    else this.setOpen(true);
  };

  private handleMenuKeyDown = (event: KeyboardEvent) => {
    const items = this.items;
    const current = items.indexOf(document.activeElement as Item);
    const disabled = (index: number) => isDisabled(items[index]);

    // Tab leaves the menu. Closing it first sends focus to the button, so the
    // browser's own Tab then moves on from there — past the menu, which is
    // where a reader expects to go.
    if (event.key === 'Tab') {
      this.setOpen(false);
      return;
    }

    if ((event.key === 'Enter' || event.key === ' ') && current >= 0) {
      event.preventDefault();
      this.select(items[current]);
      return;
    }

    const labels = items.map(item => item.label || item.textContent || '');
    const next = rovingIndex(event.key, current, items.length, { disabled }) ?? typeaheadIndex(event.key, current, labels, disabled);
    if (next === null) return;

    event.preventDefault();
    this.focusItem(next);
  };

  private handleMenuClick = (event: MouseEvent) => {
    const item = this.itemFrom(event);
    if (item) this.select(item);
  };

  /** Focus follows the pointer, so a reader who switches from mouse to keyboard carries on from where they are. */
  private handleMenuMouseOver = (event: MouseEvent) => {
    const item = this.itemFrom(event);
    if (item && !isDisabled(item) && document.activeElement !== item) item.focus({ preventScroll: true });
  };

  private getClasses() {
    const b = 'ss-dropdown';
    return {
      [b]: true,
      [`${b}--${this.resolvedPlacement ?? this.placement}`]: true,
      [`${b}--open`]: this.visible,
      [`${b}--disabled`]: this.disabled,
    };
  }

  render() {
    return (
      <span class={this.getClasses()}>
        <span class="ss-dropdown__trigger" ref={el => (this.triggerEl = el)} onClick={this.toggle} onKeyDown={this.handleTriggerKeyDown}>
          <slot name="trigger" />
        </span>

        <div
          id={this.xId}
          class="ss-dropdown__menu"
          style={resolveInlineStyles(this.inlineStyles)}
          ref={el => (this.menuEl = el)}
          role="menu"
          aria-label={this.menuLabel}
          tabindex={-1}
          hidden={!this.visible}
          onKeyDown={this.handleMenuKeyDown}
          onClick={this.handleMenuClick}
          onMouseOver={this.handleMenuMouseOver}
        >
          <slot />
        </div>
      </span>
    );
  }
}
