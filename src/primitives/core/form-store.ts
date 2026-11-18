/**
 * F4: a per-form value store with no framework and no Redux. Immutable snapshots (a new object only when a value
 * changes) so React can read it with useSyncExternalStore; any other framework can subscribe the same way.
 */
export interface FormStore<T extends object> {
  getSnapshot: () => T;
  subscribe: (listener: () => void) => () => void;
  set: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Write one element of an array field (the legacy `set<Key>inArray({ el, idx })` shape). */
  setAt: <K extends keyof T>(key: K, index: number, value: unknown) => void;
  reset: () => void;
}

export const createFormStore = <T extends object>(initialValues: T): FormStore<T> => {
  let snapshot = initialValues;
  const listeners = new Set<() => void>();
  const commit = (next: T) => {
    if (next === snapshot) return;
    snapshot = next;
    for (const listener of [...listeners]) listener();
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    set: (key, value) => {
      if (Object.is(snapshot[key], value)) return;
      commit({ ...snapshot, [key]: value });
    },
    setAt: (key, index, value) => {
      const current = snapshot[key];
      const list = Array.isArray(current) ? [...current] : [];
      if (Object.is(list[index], value)) return;
      list[index] = value;
      commit({ ...snapshot, [key]: list });
    },
    reset: () => commit(initialValues),
  };
};
