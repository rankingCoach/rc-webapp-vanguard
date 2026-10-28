/** Revision counter backing useSyncExternalStore for stack/compact presentation. */
export class PresentationStore {
  private listeners = new Set<() => void>();
  private revision = 0;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getRevision = () => this.revision;

  notify() {
    this.revision++;
    this.listeners.forEach((listener) => listener());
  }
}
