import { describe, expect, it } from 'vitest';
import { createLayerStack, isClickAway } from './layer-stack';

const base = {
  activated: true,
  hasNode: true,
  onRootScrollbar: false,
  moved: false,
  insideDOM: false,
  insideReactTree: false,
  disableReactTree: false,
  insideHigherLayer: false,
};

describe('isClickAway (MUI ClickAwayListener decision + layer rule)', () => {
  it('a click outside the node and outside the React tree is a click away', () => {
    expect(isClickAway(base)).toBe(true);
  });
  it.each([
    ['not activated yet (the opening click)', { activated: false }],
    ['no node', { hasNode: false }],
    ['root scrollbar', { onRootScrollbar: true }],
    ['touch moved (scroll gesture)', { moved: true }],
    ['inside the DOM node', { insideDOM: true }],
    ['inside the React tree (portal child)', { insideReactTree: true }],
    ['inside a layer stacked above', { insideHigherLayer: true }],
  ])('%s is not a click away', (_name, patch) => {
    expect(isClickAway({ ...base, ...patch })).toBe(false);
  });
  it('disableReactTree ignores the React-tree marker but not the DOM check', () => {
    expect(isClickAway({ ...base, insideReactTree: true, disableReactTree: true })).toBe(true);
    expect(isClickAway({ ...base, insideDOM: true, disableReactTree: true })).toBe(false);
  });
});

describe('layer stack', () => {
  it('lists only the layers opened after a token, while they are open', () => {
    const stack = createLayerStack();
    const a = document.createElement('div');
    const b = document.createElement('div');
    const c = document.createElement('div');
    const ta = stack.push(() => a);
    const tb = stack.push(() => b);
    stack.push(() => c);
    expect(stack.above(ta)).toEqual([b, c]);
    expect(stack.above(tb)).toEqual([c]);
    stack.remove(tb);
    expect(stack.above(ta)).toEqual([c]);
    expect(stack.above(tb)).toEqual([]);
  });
});
