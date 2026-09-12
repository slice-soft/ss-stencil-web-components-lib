import { Component, Element, Event, EventEmitter, h, Prop } from '@stencil/core';
import { nextId } from '../../../utils/id';
import { slottedIn } from '../../../utils/popup';
import { type InlineStyles, resolveInlineStyles } from '../../../utils/style';

export type SsAccordionItemOpenChangeEvent = { xId?: string; value?: string; open: boolean };

/**
 * A heading that shows and hides the section under it.
 *
 * It follows the WAI-ARIA disclosure pattern the accordion is built from: the
 * heading holds a button that says whether the section is expanded and which
 * region it controls, and the region is named by that button. The heading is a
 * real heading, so a screen reader user moving through a page by headings
 * still finds every section — collapsed ones included. Pick `heading-level` to
 * fit the page's outline.
 *
 * It works alone as a single disclosure. Inside an `ss-accordion` it also takes
 * part in single-open behaviour and arrow-key movement between headers.
 *
 * @slot - The section's content.
 * @slot heading - Rich heading content; overrides the `heading` prop.
 */
@Component({
  tag: 'ss-accordion-item',
  styleUrl: 'ss-accordion-item.scss',
  scoped: true,
})
export class SsAccordionItem {
  @Element() el!: HTMLElement;

  private itemId = nextId('ss-accordion-item');

  /** Id applied to the item's container; also included in the ssOpenChange detail. */
  @Prop() xId?: string;
  /** Value that identifies the item in events. */
  @Prop() value?: string;
  /** Heading text, used when no heading slot content is provided. */
  @Prop() heading?: string;
  /** Level of the heading element, 1 to 6, so the section fits the page's outline. */
  @Prop() headingLevel: number = 3;
  /** Whether the section is expanded. Updated on interaction, and reflected. */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;
  /** Disables the header; the section keeps its current state. */
  @Prop() disabled: boolean = false;
  /** Inline CSS styles applied to the item's container. */
  @Prop() inlineStyles?: InlineStyles;

  /** Emitted when the header is pressed; detail contains xId, value and the new open state. */
  @Event() ssOpenChange: EventEmitter<SsAccordionItemOpenChangeEvent>;

  private get level(): number {
    return Math.min(Math.max(Math.trunc(this.headingLevel) || 3, 1), 6);
  }

  private toggle = () => {
    if (this.disabled) return;
    this.open = !this.open;
    this.ssOpenChange.emit({ xId: this.xId, value: this.value, open: this.open });
  };

  render() {
    const Heading = `h${this.level}` as 'h3';
    const buttonId = `${this.itemId}-trigger`;
    const panelId = `${this.itemId}-panel`;
    const headingSlot = slottedIn(this.el, 'heading');

    return (
      <div
        id={this.xId}
        class={{ 'ss-accordion-item': true, 'ss-accordion-item--open': this.open, 'ss-accordion-item--disabled': this.disabled }}
        style={resolveInlineStyles(this.inlineStyles)}
      >
        <Heading class="ss-accordion-item__heading">
          <button
            type="button"
            id={buttonId}
            class="ss-accordion-item__trigger"
            aria-expanded={String(this.open)}
            aria-controls={panelId}
            disabled={this.disabled}
            onClick={this.toggle}
          >
            <span class="ss-accordion-item__title">{headingSlot ? <slot name="heading" /> : this.heading}</span>
            <span class="ss-accordion-item__icon" aria-hidden="true" />
          </button>
        </Heading>

        <div id={panelId} class="ss-accordion-item__panel" role="region" aria-labelledby={buttonId} hidden={!this.open}>
          <slot />
        </div>
      </div>
    );
  }
}
