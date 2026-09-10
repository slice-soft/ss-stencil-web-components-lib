export type Placement = 'top' | 'right' | 'bottom' | 'left';

/**
 * Where the floating element lines up along the anchor's edge. `start` and
 * `end` are the anchor's left and right edges for a top or bottom placement,
 * and its top and bottom edges for a side one. Right-to-left is not considered.
 */
export type Align = 'start' | 'center' | 'end';

/** The part of a DOMRect this calculation needs. */
export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export interface FloatingSize {
  width: number;
  height: number;
}

export interface Viewport {
  width: number;
  height: number;
}

export interface PlacementRequest {
  /** Where the anchor is, in viewport coordinates. */
  anchor: AnchorRect;
  /** How big the floating element is. */
  floating: FloatingSize;
  viewport: Viewport;
  /** The side asked for; the result may differ if that side has no room. */
  placement: Placement;
  /** Alignment along the anchor's edge. Defaults to centred. */
  align?: Align;
  /** Gap between the anchor and the floating element. */
  offset?: number;
  /** Smallest gap to leave between the floating element and the viewport edge. */
  padding?: number;
}

export interface PlacementResult {
  /** The side actually used, which is what the caller should style against. */
  placement: Placement;
  top: number;
  left: number;
  /** Whether the requested side had to be abandoned. */
  flipped: boolean;
}

const OPPOSITE: Record<Placement, Placement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** How much room the anchor leaves on a given side of the viewport. */
function spaceOn(side: Placement, anchor: AnchorRect, viewport: Viewport): number {
  switch (side) {
    case 'top':
      return anchor.top;
    case 'bottom':
      return viewport.height - (anchor.top + anchor.height);
    case 'left':
      return anchor.left;
    case 'right':
      return viewport.width - (anchor.left + anchor.width);
  }
}

function needsOn(side: Placement, floating: FloatingSize, offset: number): number {
  return (side === 'top' || side === 'bottom' ? floating.height : floating.width) + offset;
}

/** Where the floating element starts along one axis of the anchor. */
function alignOn(align: Align, anchorStart: number, anchorLength: number, floatingLength: number): number {
  if (align === 'start') return anchorStart;
  if (align === 'end') return anchorStart + anchorLength - floatingLength;
  return anchorStart + anchorLength / 2 - floatingLength / 2;
}

function clamp(value: number, min: number, max: number): number {
  // A floating element wider than the space it has left is pinned to the near
  // edge rather than centred outside the viewport, so max can fall below min.
  return Math.max(min, Math.min(value, Math.max(min, max)));
}

/**
 * Places a floating element against an anchor, moving it to the opposite side
 * when the side asked for has no room.
 *
 * The calculation is pure geometry in viewport coordinates: the caller measures
 * the DOM and applies the result. That keeps the part worth testing — what
 * happens at an edge, and which side wins when neither fits — out of a browser.
 *
 * A tooltip pinned against the top of the window is the failure this prevents:
 * the reader is shown a box clipped by the edge, or nothing at all, with no
 * indication that anything went wrong.
 */
export function place(request: PlacementRequest): PlacementResult {
  const { anchor, floating, viewport, placement } = request;
  const offset = request.offset ?? 0;
  const padding = request.padding ?? 0;

  const opposite = OPPOSITE[placement];
  const fits = (side: Placement) => spaceOn(side, anchor, viewport) >= needsOn(side, floating, offset) + padding;

  // Keep the requested side when it fits, take the opposite when it does not,
  // and when neither fits take whichever leaves more room rather than picking
  // the one that happens to be first.
  let resolved = placement;
  if (!fits(placement)) {
    resolved = fits(opposite) || spaceOn(opposite, anchor, viewport) > spaceOn(placement, anchor, viewport) ? opposite : placement;
  }

  const align = request.align ?? 'center';
  const alongX = alignOn(align, anchor.left, anchor.width, floating.width);
  const alongY = alignOn(align, anchor.top, anchor.height, floating.height);
  const maxLeft = viewport.width - floating.width - padding;
  const maxTop = viewport.height - floating.height - padding;

  switch (resolved) {
    case 'top':
      return { placement: resolved, flipped: resolved !== placement, top: anchor.top - floating.height - offset, left: clamp(alongX, padding, maxLeft) };
    case 'bottom':
      return { placement: resolved, flipped: resolved !== placement, top: anchor.top + anchor.height + offset, left: clamp(alongX, padding, maxLeft) };
    case 'left':
      return { placement: resolved, flipped: resolved !== placement, top: clamp(alongY, padding, maxTop), left: anchor.left - floating.width - offset };
    case 'right':
      return { placement: resolved, flipped: resolved !== placement, top: clamp(alongY, padding, maxTop), left: anchor.left + anchor.width + offset };
  }
}

export interface AnchorOptions {
  placement: Placement;
  align?: Align;
  offset?: number;
  padding?: number;
}

/**
 * Measures an anchor and a floating element, places the floating one, writes
 * the coordinates straight onto it, and returns the side it ended up on.
 *
 * This is the one part of the module that touches the DOM, shared by every
 * component that floats something against a trigger. The coordinates bypass
 * the render cycle: scrolling recomputes them continuously, and a re-render per
 * frame would cost far more than the side it produces.
 *
 * The floating element must be `position: fixed`, since the coordinates are
 * viewport coordinates — which is also what keeps it from being clipped by an
 * ancestor's overflow. An ancestor with a `transform` breaks that: it becomes
 * the containing block for fixed descendants, and the element lands offset by
 * wherever that ancestor sits. `ss-modal` centres without a transform for this
 * reason.
 */
export function anchorTo(anchor: Element, floating: HTMLElement, options: AnchorOptions): Placement {
  const a = anchor.getBoundingClientRect();
  const f = floating.getBoundingClientRect();

  const next = place({
    anchor: { top: a.top, left: a.left, width: a.width, height: a.height },
    floating: { width: f.width, height: f.height },
    viewport: { width: window.innerWidth, height: window.innerHeight },
    ...options,
  });

  floating.style.top = `${next.top}px`;
  floating.style.left = `${next.left}px`;
  return next.placement;
}

/**
 * Calls back whenever any of the elements changes size, until stopped.
 *
 * A floating element is placed when it opens and again on scroll, but its
 * anchor can change size underneath it — a label that changes, a web font that
 * finishes loading, a token set swapped at runtime, a transition on padding —
 * and the panel is left pointing at where the trigger used to end. The floating
 * element is watched as well: content that grows can push it past the edge it
 * was clamped against.
 *
 * Returns a function that stops watching. Where ResizeObserver does not exist,
 * as in the spec DOM, it watches nothing.
 */
export function onResize(elements: (Element | null | undefined)[], callback: () => void): () => void {
  if (typeof ResizeObserver === 'undefined') return () => undefined;

  const observer = new ResizeObserver(() => callback());
  elements.forEach(element => element && observer.observe(element));
  return () => observer.disconnect();
}
