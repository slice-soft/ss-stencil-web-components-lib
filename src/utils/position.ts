export type Placement = 'top' | 'right' | 'bottom' | 'left';

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

  const centreX = anchor.left + anchor.width / 2 - floating.width / 2;
  const centreY = anchor.top + anchor.height / 2 - floating.height / 2;
  const maxLeft = viewport.width - floating.width - padding;
  const maxTop = viewport.height - floating.height - padding;

  switch (resolved) {
    case 'top':
      return { placement: resolved, flipped: resolved !== placement, top: anchor.top - floating.height - offset, left: clamp(centreX, padding, maxLeft) };
    case 'bottom':
      return { placement: resolved, flipped: resolved !== placement, top: anchor.top + anchor.height + offset, left: clamp(centreX, padding, maxLeft) };
    case 'left':
      return { placement: resolved, flipped: resolved !== placement, top: clamp(centreY, padding, maxTop), left: anchor.left - floating.width - offset };
    case 'right':
      return { placement: resolved, flipped: resolved !== placement, top: clamp(centreY, padding, maxTop), left: anchor.left + anchor.width + offset };
  }
}
