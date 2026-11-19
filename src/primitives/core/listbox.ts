// Ported from @mui/material@9.5.0 MenuList/MenuList.js (MIT)
/**
 * Open-list keyboard behavior (framework-free), matching MUI MenuList (v9 roving tab index): arrows / Home / End
 * move the active item skipping disabled ones (Select disables wrapping), and a 500 ms text-criteria typeahead that
 * cycles on a repeated first letter and otherwise matches the typed prefix.
 */
export interface ListItemLike {
  text: string;
  disabled?: boolean;
}

const focusable = (i: ListItemLike) => !i.disabled;

const step = (items: ListItemLike[], from: number, dir: 1 | -1, wrap: boolean, ok: (i: ListItemLike) => boolean) => {
  for (let n = 1; n <= items.length; n++) {
    let i = from + dir * n;
    if (i < 0 || i >= items.length) {
      if (!wrap) return null;
      i = (i + items.length) % items.length;
    }
    if (ok(items[i])) return i;
  }
  return null;
};

/** Index to activate for a navigation key, the current index when it cannot move, or null for other keys. */
export const nextListIndex = (
  items: ListItemLike[],
  current: number,
  key: string,
  options: { wrap: boolean },
): number | null => {
  switch (key) {
    case 'ArrowDown':
      return step(items, current, 1, options.wrap, focusable) ?? current;
    case 'ArrowUp':
      return step(items, current, -1, options.wrap, focusable) ?? current;
    case 'Home':
      return step(items, -1, 1, false, focusable);
    case 'End':
      return step(items, items.length, -1, false, focusable);
    default:
      return null;
  }
};

export const LIST_TYPEAHEAD_WINDOW_MS = 500;

export const createListTypeahead = () => {
  const criteria = { keys: [] as string[], repeating: true, previousKeyMatched: true, lastTime: 0 };
  const matches = (item: ListItemLike) => {
    const text = item.text.trim().toLowerCase();
    if (text.length === 0) return false;
    return criteria.repeating ? text[0] === criteria.keys[0] : text.startsWith(criteria.keys.join(''));
  };
  return {
    /** Feed one printable key at time `now` (ms); returns the index to focus, or null (no match, keep focus). */
    type(key: string, items: ListItemLike[], current: number, now: number): number | null {
      const lower = key.toLowerCase();
      if (criteria.keys.length > 0) {
        if (now - criteria.lastTime > LIST_TYPEAHEAD_WINDOW_MS) {
          criteria.keys = [];
          criteria.repeating = true;
          criteria.previousKeyMatched = true;
        } else if (criteria.repeating && lower !== criteria.keys[0]) {
          criteria.repeating = false;
        }
      }
      criteria.lastTime = now;
      criteria.keys.push(lower);
      if (!criteria.previousKeyMatched) return null;
      const cur = items[current];
      if (cur && !criteria.repeating && matches(cur)) return current;
      const next = step(items, current, 1, true, (i) => focusable(i) && matches(i));
      if (next === null) criteria.previousKeyMatched = false;
      return next;
    },
  };
};
