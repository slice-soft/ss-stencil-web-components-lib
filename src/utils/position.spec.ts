import { place, Placement } from './position';

const VIEWPORT = { width: 1000, height: 800 };
const FLOATING = { width: 100, height: 40 };

/** An anchor 50×20, centred unless a test needs it against an edge. */
function anchorAt(top: number, left: number) {
  return { top, left, width: 50, height: 20 };
}

function placeAt(placement: Placement, anchor = anchorAt(400, 500), floating = FLOATING) {
  return place({ anchor, floating, viewport: VIEWPORT, placement, offset: 8, padding: 4 });
}

describe('place with room on every side', () => {
  it('keeps the side it was asked for', () => {
    expect(placeAt('top').placement).toBe('top');
    expect(placeAt('bottom').placement).toBe('bottom');
    expect(placeAt('left').placement).toBe('left');
    expect(placeAt('right').placement).toBe('right');
  });

  it('reports that nothing was moved', () => {
    expect(placeAt('top').flipped).toBe(false);
  });

  it('sits above the anchor, clear of it by the offset', () => {
    // anchor.top 400 − floating.height 40 − offset 8
    expect(placeAt('top').top).toBe(352);
  });

  it('sits below the anchor, clear of it by the offset', () => {
    // anchor.top 400 + anchor.height 20 + offset 8
    expect(placeAt('bottom').top).toBe(428);
  });

  it('centres on the anchor across the vertical placements', () => {
    // anchor centre 525 − half of floating width
    expect(placeAt('top').left).toBe(475);
    expect(placeAt('bottom').left).toBe(475);
  });

  it('centres on the anchor across the horizontal placements', () => {
    // anchor centre 410 − half of floating height
    expect(placeAt('left').top).toBe(390);
    expect(placeAt('right').top).toBe(390);
  });

  it('sits beside the anchor, clear of it by the offset', () => {
    expect(placeAt('left').left).toBe(500 - 100 - 8);
    expect(placeAt('right').left).toBe(500 + 50 + 8);
  });
});

describe('place against an edge', () => {
  it('flips below when there is no room above', () => {
    const result = placeAt('top', anchorAt(10, 500));

    expect(result.placement).toBe('bottom');
    expect(result.flipped).toBe(true);
    expect(result.top).toBe(38);
  });

  it('flips above when there is no room below', () => {
    const result = placeAt('bottom', anchorAt(760, 500));

    expect(result.placement).toBe('top');
    expect(result.top).toBe(712);
  });

  it('flips right when there is no room left', () => {
    expect(placeAt('left', anchorAt(400, 10)).placement).toBe('right');
  });

  it('flips left when there is no room right', () => {
    expect(placeAt('right', anchorAt(400, 950)).placement).toBe('left');
  });

  it('keeps the side that has more room when neither fits', () => {
    // A short viewport: above has 30, below has 20. Neither fits 48.
    const cramped = { anchor: anchorAt(30, 500), floating: FLOATING, viewport: { width: 1000, height: 70 }, placement: 'bottom' as Placement, offset: 8, padding: 4 };

    expect(place(cramped).placement).toBe('top');
  });

  it('stays on the requested side when the opposite is no better', () => {
    const cramped = { anchor: anchorAt(20, 500), floating: FLOATING, viewport: { width: 1000, height: 70 }, placement: 'bottom' as Placement, offset: 8, padding: 4 };

    // Below has 30, above has 20: neither fits, and below is the roomier one.
    expect(place(cramped).placement).toBe('bottom');
  });
});

describe('place across the cross axis', () => {
  it('pulls back from the right edge instead of overflowing it', () => {
    const result = placeAt('top', anchorAt(400, 980));

    expect(result.left).toBe(VIEWPORT.width - FLOATING.width - 4);
  });

  it('pulls back from the left edge instead of overflowing it', () => {
    expect(placeAt('top', anchorAt(400, 0)).left).toBe(4);
  });

  it('pins to the near edge when the floating element is wider than the viewport', () => {
    const wide = { anchor: anchorAt(400, 10), floating: { width: 2000, height: 40 }, viewport: VIEWPORT, placement: 'top' as Placement, offset: 8, padding: 4 };

    // It cannot fit either way, so it starts at the padding rather than at a
    // negative offset that would hide its beginning.
    expect(place(wide).left).toBe(4);
  });

  it('clamps the vertical centring for horizontal placements', () => {
    expect(placeAt('right', anchorAt(0, 500)).top).toBe(4);
    expect(placeAt('right', anchorAt(790, 500)).top).toBe(VIEWPORT.height - FLOATING.height - 4);
  });
});

describe('place without offset or padding', () => {
  it('touches the anchor when no offset is given', () => {
    const result = place({ anchor: anchorAt(400, 500), floating: FLOATING, viewport: VIEWPORT, placement: 'bottom' });

    expect(result.top).toBe(420);
  });

  it('may reach the very edge when no padding is given', () => {
    const result = place({ anchor: anchorAt(400, 0), floating: FLOATING, viewport: VIEWPORT, placement: 'top' });

    expect(result.left).toBe(0);
  });
});

describe('place with an alignment', () => {
  const request = (placement: Placement, align: 'start' | 'end', anchor = anchorAt(400, 500)) => ({
    anchor,
    floating: FLOATING,
    viewport: VIEWPORT,
    placement,
    align,
    offset: 8,
    padding: 4,
  });

  it('lines up with the start of the anchor', () => {
    // A menu hangs from its trigger's left edge rather than centring under it.
    expect(place(request('bottom', 'start')).left).toBe(500);
  });

  it('lines up with the end of the anchor', () => {
    // anchor right edge 550 − floating width 100
    expect(place(request('bottom', 'end')).left).toBe(450);
  });

  it('aligns along the vertical edge for a side placement', () => {
    expect(place(request('right', 'start')).top).toBe(400);
    // anchor bottom edge 420 − floating height 40
    expect(place(request('right', 'end')).top).toBe(380);
  });

  it('still pulls back from the viewport edge when aligned', () => {
    expect(place(request('bottom', 'start', anchorAt(400, 980))).left).toBe(VIEWPORT.width - FLOATING.width - 4);
  });

  it('keeps the alignment after a flip', () => {
    const result = place(request('bottom', 'start', anchorAt(770, 500)));

    expect(result.placement).toBe('top');
    expect(result.left).toBe(500);
  });
});
