import { afterEach, describe, expect, it } from 'vitest';
import { ModalManager } from './modal-manager';

afterEach(() => {
  document.body.innerHTML = '';
  document.body.removeAttribute('style');
});

const setup = () => {
  const app = document.createElement('div');
  const script = document.createElement('script');
  const a = document.createElement('div');
  const b = document.createElement('div');
  document.body.append(app, script, a, b);
  return { app, script, a, b };
};

describe('ModalManager (MUI ModalManager parity)', () => {
  it('hides siblings of the top modal (not forbidden tags), restores on remove', () => {
    const { app, script, a } = setup();
    const m = new ModalManager();
    const modal = { modalRef: a };
    m.add(modal, document.body);
    m.mount(modal, {});
    expect(app.getAttribute('aria-hidden')).toBe('true');
    expect(script.hasAttribute('aria-hidden')).toBe(false);
    expect(a.hasAttribute('aria-hidden')).toBe(false);
    expect(document.body.style.overflow).toBe('hidden');
    m.remove(modal);
    expect(app.hasAttribute('aria-hidden')).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('stacked modals: the top one stays visible; elements hidden by others are left alone', () => {
    const { app, a, b } = setup();
    app.setAttribute('aria-hidden', 'true');
    const m = new ModalManager();
    const first = { modalRef: a };
    const second = { modalRef: b };
    m.add(first, document.body);
    m.add(second, document.body);
    expect(a.getAttribute('aria-hidden')).toBe('true');
    expect(m.isTopModal(second)).toBe(true);
    m.remove(second);
    expect(a.hasAttribute('aria-hidden')).toBe(false);
    m.remove(first);
    expect(app.getAttribute('aria-hidden')).toBe('true');
  });

  it('disableScrollLock leaves body styles alone', () => {
    const { a } = setup();
    const m = new ModalManager();
    const modal = { modalRef: a };
    m.add(modal, document.body);
    m.mount(modal, { disableScrollLock: true });
    expect(document.body.style.overflow).toBe('');
    m.remove(modal);
  });
});
