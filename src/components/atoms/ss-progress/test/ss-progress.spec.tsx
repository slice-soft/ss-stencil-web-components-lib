import { newSpecPage } from '@stencil/core/testing';
import { normalize, SsProgress } from '../ss-progress';

describe('normalize', () => {
  it.each([
    [50, 100, { max: 100, value: 50 }],
    [150, 100, { max: 100, value: 100 }],
    [-5, 100, { max: 100, value: 0 }],
    [NaN, 100, { max: 100, value: undefined }],
    [undefined, 100, { max: 100, value: undefined }],
    [null, 100, { max: 100, value: undefined }],
    [5, 0, { max: 100, value: 5 }],
    [5, -1, { max: 100, value: 5 }],
    [5, 'x', { max: 100, value: 5 }],
    [3, 10, { max: 10, value: 3 }],
  ])('normalize(%p, %p)', (value, max, expected) => {
    expect(normalize(value, max)).toEqual(expected);
  });
});

describe('ss-progress', () => {
  it('bar renders a track with a fill', async () => {
    const page = await newSpecPage({ components: [SsProgress], html: '<ss-progress value="40"></ss-progress>' });
    expect(page.root.shadowRoot.querySelector('.ss-progress__track .ss-progress__fill')).not.toBeNull();
    expect(page.root.shadowRoot.querySelector('svg')).toBeNull();
  });

  it('circle renders an svg', async () => {
    const page = await newSpecPage({ components: [SsProgress], html: '<ss-progress shape="circle" value="40"></ss-progress>' });
    expect(page.root.shadowRoot.querySelector('svg .ss-progress__arc')).not.toBeNull();
  });
});
