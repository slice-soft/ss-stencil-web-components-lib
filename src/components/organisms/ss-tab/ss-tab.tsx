import { Component, Element, forceUpdate, h, Host, Prop, Watch } from '@stencil/core';

/**
 * One tab of an `ss-tabs`: its label, and the panel shown while it is selected.
 *
 * The button the reader presses is drawn by `ss-tabs`, in its tab list. What
 * stays here is the panel, so the content sits where the caller wrote it and
 * only the label travels. `ss-tabs` tells each panel whether it is showing and
 * which tab names it — the same coordination by props the rest of the library
 * uses.
 *
 * @slot - The panel's content.
 */
@Component({
  tag: 'ss-tab',
  styleUrl: 'ss-tab.scss',
  scoped: true,
})
export class SsTab {
  @Element() el!: HTMLElement;

  private owner: HTMLElement | null = null;

  /** Value that identifies the tab; `ss-tabs` selects by it and reports it. Defaults to the tab's position. */
  @Prop() value?: string;
  /** Text of the tab. Defaults to the value. */
  @Prop() label?: string;
  /** Disables the tab; it cannot be selected and the arrow keys skip it. */
  @Prop() disabled: boolean = false;
  /** Whether this panel is showing. Set by `ss-tabs`. */
  @Prop() selected: boolean = false;
  /** Id of the panel, which the tab points at. Set by `ss-tabs`. */
  @Prop() panelId?: string;
  /** Id of the tab that names this panel. Set by `ss-tabs`. */
  @Prop() tabId?: string;

  connectedCallback() {
    this.owner = this.el.parentElement?.closest('ss-tabs') ?? null;
    this.notify();
  }

  disconnectedCallback() {
    this.notify();
    this.owner = null;
  }

  /**
   * The tab list is drawn by `ss-tabs` from these props, and nothing tells a
   * parent that a child's prop changed — so the child asks it to redraw. Adding
   * or removing a tab does the same through the connection callbacks.
   */
  @Watch('label')
  @Watch('disabled')
  @Watch('value')
  notify() {
    if (this.owner) forceUpdate(this.owner);
  }

  render() {
    return (
      <Host>
        <div id={this.panelId} class="ss-tab" role="tabpanel" aria-labelledby={this.tabId} tabindex={0} hidden={!this.selected}>
          <slot />
        </div>
      </Host>
    );
  }
}
