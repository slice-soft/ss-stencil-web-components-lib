import { Component, Element, Event, EventEmitter, Host, h, Prop, Watch } from '@stencil/core';

/**
 * One option of an `ss-search-select`, written in HTML. It is data only: it
 * draws nothing, and the select reads its value, text, `disabled` and
 * `selected` and draws the list itself, the way `ss-tabs` draws its tabs from
 * each `ss-tab`. That keeps every option in the select's own tree, where the
 * ids tying the field to the active option resolve.
 *
 * When anything about it changes, it tells the select to read the list again.
 *
 * @slot - The option's label, as text.
 */
@Component({
  tag: 'ss-option',
})
export class SsOption {
  @Element() el!: HTMLElement;

  /** Value the select reports when this option is chosen. Defaults to the label. */
  @Prop({ reflect: true }) value?: string;
  /** Whether the option can be chosen. */
  @Prop({ reflect: true }) disabled: boolean = false;
  /** Whether the option starts selected, as on a native option. */
  @Prop({ reflect: true }) selected: boolean = false;

  /** Internal: the option changed and its select should read the list again. */
  @Event({ bubbles: true, composed: false }) ssOptionChange: EventEmitter<void>;

  private observer?: MutationObserver;

  @Watch('value')
  @Watch('disabled')
  @Watch('selected')
  changed() {
    this.ssOptionChange.emit();
  }

  connectedCallback() {
    if (typeof MutationObserver === 'undefined') return;
    this.observer = new MutationObserver(() => this.ssOptionChange.emit());
    this.observer.observe(this.el, { characterData: true, childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.observer?.disconnect();
    this.observer = undefined;
  }

  render() {
    return <Host hidden />;
  }
}
