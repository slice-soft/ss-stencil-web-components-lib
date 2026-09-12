import { slotHasContent } from './slot';

/** Stands in for a slot with the given assigned nodes. */
function slotEvent(nodes: Partial<Node>[]): Event {
  return { target: { assignedNodes: () => nodes } } as unknown as Event;
}

describe('slotHasContent', () => {
  it('is true for an assigned element', () => {
    expect(slotHasContent(slotEvent([{ nodeType: 1 }]))).toBe(true);
  });

  it('is true for assigned text', () => {
    expect(slotHasContent(slotEvent([{ nodeType: 3, textContent: 'Hello' }]))).toBe(true);
  });

  it('is false for nothing assigned', () => {
    expect(slotHasContent(slotEvent([]))).toBe(false);
  });

  it('is false for whitespace-only text, so indentation does not fill a region', () => {
    expect(slotHasContent(slotEvent([{ nodeType: 3, textContent: '\n    ' }]))).toBe(false);
  });

  it('is true when one real node sits among whitespace', () => {
    expect(slotHasContent(slotEvent([{ nodeType: 3, textContent: '\n  ' }, { nodeType: 1 }]))).toBe(true);
  });

  it('is false when the target is not a slot', () => {
    expect(slotHasContent({ target: document.createElement('div') } as unknown as Event)).toBe(false);
  });
});
