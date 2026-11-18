import { afterEach, describe, expect, it } from 'vitest';
import { keepMuiCompatLast, moveMuiCompatLast } from './keep-mui-compat-last';

const sheet = (id: string) => {
  const el = document.createElement('style');
  el.setAttribute('data-vite-dev-id', id);
  return el;
};
const ids = () =>
  [...document.head.querySelectorAll('style[data-test]')].map((s) => s.getAttribute('data-vite-dev-id'));

describe('keepMuiCompatLast (D15 dev/test order)', () => {
  afterEach(() =>
    document.head.querySelectorAll('style[data-test]').forEach((s) => {
      s.remove();
    }),
  );

  it('moves the compat sheet behind sheets that loaded after it', async () => {
    const compat = sheet('/src/styles/mui-compat.scss');
    const skin = sheet('/src/core/ToggleButtonGroup/ToggleButtonGroup.scss');
    for (const s of [compat, skin]) s.setAttribute('data-test', '');
    document.head.append(compat, skin);
    moveMuiCompatLast();
    expect(ids().at(-1)).toBe('/src/styles/mui-compat.scss');
  });

  it('keeps it last when more sheets arrive later', async () => {
    const compat = sheet('/src/styles/mui-compat.scss');
    compat.setAttribute('data-test', '');
    document.head.append(compat);
    const stop = keepMuiCompatLast();
    const late = sheet('/src/core/_internal/InputBase/InputBase.scss');
    late.setAttribute('data-test', '');
    document.head.append(late);
    await new Promise((r) => setTimeout(r, 0));
    stop();
    expect(ids()).toEqual(['/src/core/_internal/InputBase/InputBase.scss', '/src/styles/mui-compat.scss']);
  });
});

describe('keepMuiCompatLast with two compat sheets', () => {
  it('settles instead of swapping them forever', async () => {
    const a = sheet('/src/styles/mui-compat.scss?a');
    const b = sheet('/src/styles/mui-compat.scss?b');
    const skin = sheet('/src/core/ToggleButton/skin.scss');
    for (const s of [a, b, skin]) s.setAttribute('data-test', '');
    document.head.append(a, skin, b);
    const stop = keepMuiCompatLast();
    await new Promise((r) => setTimeout(r, 0));
    stop();
    expect(ids().at(0)).toBe('/src/core/ToggleButton/skin.scss');
    document.head.querySelectorAll('style[data-test]').forEach((s) => {
      s.remove();
    });
  });
});
