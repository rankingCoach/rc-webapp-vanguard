const assert = require('node:assert/strict');

module.exports = {
  packSha256: '12c28012780971db864ca1d9698ba47ff0bfb5e6a545b9cc5337c372b2089644',
  defaults: { className: 'fixture-progress', color: 'var(--p500)', progressValue: 37.5, isBlurred: false },
  expand: ({ props }) => Object.hasOwn(props, 'isBlurred') ? [props, { ...props, isBlurred: true }] : [props],
  inspect: ({ host }) => {
    const bar = host.querySelector('[role="progressbar"]');
    return {
      present: Boolean(bar),
      own: bar?.hasAttribute('data-vg-core') ?? false,
      variant: bar?.getAttribute('data-variant') ?? null,
      value: bar?.getAttribute('aria-valuenow') ?? null,
      bars: host.querySelectorAll('.MuiLinearProgress-bar').length,
    };
  },
  assertFirstRender: (first, { props, site }) => {
    const variant = props.variant ?? 'determinate';
    const value = variant === 'determinate' && props.progressValue !== undefined
      ? String(Math.round(props.isBlurred ? 100 : props.progressValue)) : null;
    assert.deepEqual(first, { present: true, own: true, variant, value, bars: variant === 'indeterminate' ? 2 : 1 }, site?.location);
  },
  assertWordPress: ({ present, namedExports, exported }, source) => {
    assert.ok(present && namedExports > 0);
    assert.equal(exported, false);
    assert.doesNotMatch(source, /progress-bar-indicator|rating-stars-and-progress-bar/);
  },
  controls: ['buffer', 'query'].map((variant) => ({
    props: { variant, progressValue: 30 },
    assertFirstRender: ({ present }) => assert.equal(present, false, `${variant} must be empty before the cold chunk resolves`),
  })),
};
