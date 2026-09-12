import { Component, Element, Event, EventEmitter, h, Prop } from '@stencil/core';
import { nextId } from '../../../utils/id';
import { Orientation, rovingIndex } from '../../../utils/roving';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type TabsActivation = 'automatic' | 'manual';

/** Emitted when a different tab is selected. */
export interface SsTabsChangeEvent {
  xId?: string;
  value: string;
}

type Tab = HTMLElement & { value?: string; label?: string; disabled?: boolean; selected?: boolean; panelId?: string; tabId?: string };

/** Read the property once the tab is upgraded, the attribute before. */
const isDisabled = (tab: Tab) => (typeof tab.disabled === 'boolean' ? tab.disabled : tab.hasAttribute('disabled'));

/**
 * A set of panels, one shown at a time, chosen from a row of tabs.
 *
 * It follows the WAI-ARIA tabs pattern. The tab list is a single stop in the
 * tab order — the selected tab — and the arrow keys move between tabs,
 * wrapping, with Home and End for the ends. With automatic activation, the
 * default, moving to a tab shows its panel. With manual activation the reader
 * moves first and presses Enter or Space to show it, which is the better choice
 * when a panel is slow to render.
 *
 * The tabs are drawn here, from each `ss-tab`'s `label`, as real buttons in a
 * real tab list. Drawing them from data rather than slotting the caller's
 * markup is what keeps the roles intact: every tab is a direct child of the tab
 * list, in the same tree as the panels it controls, so the ids tying the two
 * together resolve. The trade is that a tab label is text.
 *
 * @slot - The `ss-tab` panels, in order.
 */
@Component({
  tag: 'ss-tabs',
  styleUrl: 'ss-tabs.scss',
  scoped: true,
})
export class SsTabs {
  @Element() el!: HTMLElement;

  private tabsId = nextId('ss-tabs');

  /** Id applied to the container; also included in the ssChange detail. */
  @Prop() xId?: string;
  /** Value of the selected tab. Updated on interaction, and reflected. Falls back to the first tab that can be selected. */
  @Prop({ mutable: true, reflect: true }) value?: string;
  /** Direction the tabs run in, which also decides the arrow keys: Left and Right, or Up and Down. */
  @Prop() orientation: Orientation = 'horizontal';
  /** Whether moving to a tab shows its panel (automatic) or waits for Enter or Space (manual). */
  @Prop() activation: TabsActivation = 'automatic';
  /** Accessible name for the tab list. */
  @Prop() accessibilityLabel?: string;
  /** Inline CSS styles applied to the container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when an interaction selects a different tab; detail contains xId and the tab's value. */
  @Event() ssChange: EventEmitter<SsTabsChangeEvent>;

  componentDidLoad() {
    this.syncPanels();
  }

  componentDidUpdate() {
    this.syncPanels();
  }

  private get tabs(): Tab[] {
    return Array.from(this.el.querySelectorAll<Tab>('ss-tab')).filter(tab => tab.closest('ss-tabs') === this.el);
  }

  private get buttons(): HTMLButtonElement[] {
    return Array.from(this.el.querySelectorAll<HTMLButtonElement>('.ss-tabs__tab')).filter(button => button.closest('ss-tabs') === this.el);
  }

  private tabValue(tab: Tab, index: number): string {
    return tab.value ?? tab.getAttribute('value') ?? String(index);
  }

  private tabLabel(tab: Tab, index: number): string {
    return tab.label ?? tab.getAttribute('label') ?? this.tabValue(tab, index);
  }

  /** The tab whose value matches, or else the first that can be selected. A disabled tab is never the selected one. */
  private selectedIndex(tabs: Tab[]): number {
    const matched = tabs.findIndex((tab, index) => this.tabValue(tab, index) === this.value && !isDisabled(tab));
    return matched >= 0 ? matched : tabs.findIndex(tab => !isDisabled(tab));
  }

  private tabId(index: number) {
    return `${this.tabsId}-tab-${index}`;
  }

  private panelId(index: number) {
    return `${this.tabsId}-panel-${index}`;
  }

  /** Tells each panel whether it is showing and which tab names it. */
  private syncPanels() {
    const tabs = this.tabs;
    const selected = this.selectedIndex(tabs);

    tabs.forEach((tab, index) => {
      tab.selected = index === selected;
      tab.panelId = this.panelId(index);
      tab.tabId = this.tabId(index);
    });
  }

  private select(index: number) {
    const tabs = this.tabs;
    const tab = tabs[index];
    if (!tab || isDisabled(tab) || index === this.selectedIndex(tabs)) return;

    const value = this.tabValue(tab, index);
    this.value = value;
    this.ssChange.emit({ xId: this.xId, value });
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    const tabs = this.tabs;
    const buttons = this.buttons;
    const current = buttons.indexOf(event.target as HTMLButtonElement);
    if (current < 0) return;

    const next = rovingIndex(event.key, current, tabs.length, { orientation: this.orientation, disabled: index => isDisabled(tabs[index]) });
    if (next === null) return;

    event.preventDefault();
    buttons[next]?.focus();
    if (this.activation === 'automatic') this.select(next);
  };

  render() {
    const tabs = this.tabs;
    const selected = this.selectedIndex(tabs);

    return (
      <div id={this.xId} class={{ 'ss-tabs': true, [`ss-tabs--${this.orientation}`]: true }} style={resolveInlineStyles(this.inlineStyles)}>
        <div class="ss-tabs__list" role="tablist" aria-orientation={this.orientation} aria-label={this.accessibilityLabel} onKeyDown={this.handleKeyDown}>
          {tabs.map((tab, index) => (
            <button
              type="button"
              role="tab"
              id={this.tabId(index)}
              class={{ 'ss-tabs__tab': true, 'ss-tabs__tab--selected': index === selected }}
              aria-selected={String(index === selected)}
              aria-controls={this.panelId(index)}
              tabindex={index === selected ? 0 : -1}
              disabled={isDisabled(tab)}
              onClick={() => this.select(index)}
            >
              {this.tabLabel(tab, index)}
            </button>
          ))}
        </div>

        <div class="ss-tabs__panels">
          <slot />
        </div>
      </div>
    );
  }
}
