/**
 * Modal manager (framework-free): port of the MUI ModalManager Vanguard shipped. While a modal (menu, popover,
 * dialog) is open it aria-hides the container's other children (except the top modal and forbidden tags), and locks
 * scrolling on the container with scrollbar compensation (`padding-right`, also on `.mui-fixed` elements).
 * It only un-hides what it hid, so it coexists with MUI's own manager during the migration.
 */
export interface ManagedModal {
  modalRef: HTMLElement | null;
}

const FORBIDDEN = [
  'TEMPLATE',
  'SCRIPT',
  'STYLE',
  'LINK',
  'MAP',
  'META',
  'NOSCRIPT',
  'PICTURE',
  'COL',
  'COLGROUP',
  'PARAM',
  'SLOT',
  'SOURCE',
  'TRACK',
];

const ariaHidden = (el: Element, hide: boolean) => {
  if (hide) el.setAttribute('aria-hidden', 'true');
  else el.removeAttribute('aria-hidden');
};

const isForbidden = (el: Element) =>
  FORBIDDEN.includes(el.tagName) || (el.tagName === 'INPUT' && el.getAttribute('type') === 'hidden');

const win = (el: Element) => el.ownerDocument.defaultView ?? window;

const isOverflowing = (container: HTMLElement) => {
  const doc = container.ownerDocument;
  if (container === doc.body || container === doc.documentElement) {
    return win(container).innerWidth > doc.documentElement.clientWidth;
  }
  return container.scrollHeight > container.clientHeight;
};

const paddingRight = (el: HTMLElement) => parseFloat(win(el).getComputedStyle(el).paddingRight) || 0;
const scrollbarSize = (w: Window) => w.innerWidth - w.document.documentElement.clientWidth;

const keepChain = (node: Element | null, container: Element) => {
  const chain = new Set<Element>();
  let current = node;
  while (current && current !== container) {
    chain.add(current);
    current = current.parentElement;
  }
  return current === container ? chain : new Set<Element>();
};

const collectHidden = (parent: Element, keep: Element | null, chain: Set<Element>, out: Set<Element>) => {
  for (const el of Array.from(parent.children)) {
    if (el === keep || isForbidden(el)) continue;
    if (chain.has(el)) {
      collectHidden(el, keep, chain, out);
      continue;
    }
    out.add(el);
  }
};

interface ContainerInfo {
  container: HTMLElement;
  modals: ManagedModal[];
  restore: (() => void) | null;
  hiddenSet: Set<Element>;
}

const syncAriaHidden = (info: ContainerInfo) => {
  const keep = info.modals[info.modals.length - 1].modalRef;
  const next = new Set<Element>();
  collectHidden(info.container, keep, keepChain(keep, info.container), next);
  for (const el of next) {
    if (!info.hiddenSet.has(el) && el.getAttribute('aria-hidden') === 'true') next.delete(el);
  }
  for (const el of info.hiddenSet) if (!next.has(el)) ariaHidden(el, false);
  for (const el of next) ariaHidden(el, true);
  if (keep) ariaHidden(keep, false);
  info.hiddenSet = next;
};

const lockContainer = (info: ContainerInfo, props: { disableScrollLock?: boolean }) => {
  const restore: { value: string; property: string; el: HTMLElement }[] = [];
  const { container } = info;
  if (!props.disableScrollLock) {
    const parent = container.parentElement;
    const scrollContainer =
      container.parentNode instanceof DocumentFragment
        ? container.ownerDocument.body
        : parent?.nodeName === 'HTML' && win(container).getComputedStyle(parent).overflowY === 'scroll'
          ? parent
          : container;
    if (isOverflowing(scrollContainer)) {
      const size = scrollbarSize(win(scrollContainer));
      restore.push({ value: scrollContainer.style.paddingRight, property: 'padding-right', el: scrollContainer });
      scrollContainer.style.paddingRight = `${paddingRight(scrollContainer) + size}px`;
      for (const el of Array.from(container.ownerDocument.querySelectorAll<HTMLElement>('.mui-fixed'))) {
        restore.push({ value: el.style.paddingRight, property: 'padding-right', el });
        el.style.paddingRight = `${paddingRight(el) + size}px`;
      }
    }
    restore.push(
      { value: scrollContainer.style.overflow, property: 'overflow', el: scrollContainer },
      { value: scrollContainer.style.overflowX, property: 'overflow-x', el: scrollContainer },
      { value: scrollContainer.style.overflowY, property: 'overflow-y', el: scrollContainer },
    );
    scrollContainer.style.overflow = 'hidden';
  }
  return () => {
    for (const { value, el, property } of restore) {
      if (value) el.style.setProperty(property, value);
      else el.style.removeProperty(property);
    }
  };
};

export class ModalManager {
  private containers: ContainerInfo[] = [];
  private modals: ManagedModal[] = [];

  add(modal: ManagedModal, container: HTMLElement): number {
    let index = this.modals.indexOf(modal);
    if (index !== -1) return index;
    index = this.modals.length;
    this.modals.push(modal);
    if (modal.modalRef) ariaHidden(modal.modalRef, false);
    const existing = this.containers.find((c) => c.container === container);
    if (existing) {
      existing.modals.push(modal);
      syncAriaHidden(existing);
      return index;
    }
    const info: ContainerInfo = { modals: [modal], container, restore: null, hiddenSet: new Set() };
    this.containers.push(info);
    syncAriaHidden(info);
    return index;
  }

  mount(modal: ManagedModal, props: { disableScrollLock?: boolean }): void {
    const info = this.containers.find((c) => c.modals.includes(modal));
    if (info && !info.restore) info.restore = lockContainer(info, props);
  }

  remove(modal: ManagedModal, ariaHiddenState = true): number {
    const index = this.modals.indexOf(modal);
    if (index === -1) return index;
    const ci = this.containers.findIndex((c) => c.modals.includes(modal));
    const info = this.containers[ci];
    info.modals.splice(info.modals.indexOf(modal), 1);
    this.modals.splice(index, 1);
    if (info.modals.length === 0) {
      info.restore?.();
      if (modal.modalRef) ariaHidden(modal.modalRef, ariaHiddenState);
      for (const el of info.hiddenSet) ariaHidden(el, false);
      info.hiddenSet.clear();
      this.containers.splice(ci, 1);
    } else {
      syncAriaHidden(info);
      if (modal.modalRef) ariaHidden(modal.modalRef, ariaHiddenState);
    }
    return index;
  }

  /** Whether `el` is the root of a modal registered here (own-core host), as opposed to a MUI-managed one. */
  isRegisteredRoot(el: Element): boolean {
    return this.modals.some((m) => m.modalRef === el);
  }

  /** Registered modals (leak checks: 0 once everything is closed). */
  modalCount(): number {
    return this.modals.length;
  }

  isTopModal(modal: ManagedModal): boolean {
    return this.modals.length > 0 && this.modals[this.modals.length - 1] === modal;
  }
}

/** One manager per document, like MUI's module-level default. */
export const defaultModalManager = new ModalManager();
