import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { appScreen, cleanup, render } from '@test-utils/test-utils';
import { translationService } from '@services/translation.service';
import { CompactWindowControls } from './CompactWindowControls';
import { ModalService } from '../ModalService';

afterEach(() => { cleanup(); ModalService.__resetForTests(); vi.restoreAllMocks(); });

test('move and resize descriptions use translated templates and directions', () => {
  const original = translationService.get.bind(translationService);
  vi.spyOn(translationService, 'get').mockImplementation((key, replacements) => {
    const dictionary: Record<string, string> = {
      'Move %title%': 'Déplacer %title%',
      'Resize %title% from the bottom right corner': 'Redimensionner %title% depuis le coin inférieur droit',
      'Drag window · arrow keys to move': 'Faire glisser',
    };
    return original(dictionary[key] ?? key, replacements);
  });
  render(<CompactWindowControls id="test" title="My title" index={0} count={1} stacked={false} active />);
  expect(appScreen.getByRole('button', { name: 'Déplacer My title' }).getAttribute('title')).toBe('Faire glisser');
  expect(appScreen.getByRole('button', { name: 'Redimensionner My title depuis le coin inférieur droit' })).toBeTruthy();
});

test('rerendering drag geometry does not reinstall native pointer listeners', () => {
  const add = vi.spyOn(HTMLElement.prototype, 'addEventListener');
  const remove = vi.spyOn(HTMLElement.prototype, 'removeEventListener');
  const view = (index: number) => <div className="modalRoot">
    <CompactWindowControls id="test" title="Title" index={index} count={3} stacked active />
  </div>;
  const { rerender } = render(view(0));
  const adds = add.mock.calls.filter(([name]) => name === 'pointermove').length;
  const removes = remove.mock.calls.filter(([name]) => name === 'pointermove').length;
  rerender(view(1));
  rerender(view(2));
  expect(add.mock.calls.filter(([name]) => name === 'pointermove')).toHaveLength(adds);
  expect(remove.mock.calls.filter(([name]) => name === 'pointermove')).toHaveLength(removes);
});

test('unmounting another window cannot clear an active drag', () => {
  ModalService.setCompactWindowControlsEnabled(true);
  const view = (other: boolean) => <>
    <CompactWindowControls key="dragged" id="dragged" title="Dragged" index={0} count={1} stacked={false} active />
    {other && <CompactWindowControls key="other" id="other" title="Other" index={0} count={1} stacked={false} active />}
  </>;
  const { rerender, unmount } = render(view(true));
  ModalService.setCompactWindowInteracting(true, 'dragged');
  rerender(view(false));
  expect(ModalService.isCompactWindowInteracting()).toBe(true);
  unmount();
  expect(ModalService.isCompactWindowInteracting()).toBe(false);
});

test('interaction remains active until every owner ends and disabling clears it', () => {
  ModalService.setCompactWindowControlsEnabled(true);
  ModalService.setCompactWindowInteracting(true, 'first');
  ModalService.setCompactWindowInteracting(true, 'second');
  ModalService.removeModalComponent('first');
  expect(ModalService.isCompactWindowInteracting()).toBe(true);
  ModalService.setCompactWindowInteracting(false, 'second');
  expect(ModalService.isCompactWindowInteracting()).toBe(false);
  ModalService.setCompactWindowInteracting(true, 'second');
  ModalService.setCompactWindowControlsEnabled(false);
  ModalService.setCompactWindowControlsEnabled(true);
  expect(ModalService.isCompactWindowInteracting()).toBe(false);
});
