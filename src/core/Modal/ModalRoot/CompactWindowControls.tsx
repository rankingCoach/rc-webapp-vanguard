import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { translationService } from '@services/translation.service';
import { modalLayout, modalStackStep, modalStackDepth } from '../modal-layout';
import { clampCompactWindowBounds, CompactWindowBounds, ModalService } from '../ModalService';

export function compactWindowLayout(id: string, index: number, count: number, stacked: boolean) {
  const floating = ModalService.getCompactWindowBounds(id);
  const group =
    ModalService.isStackingEnabled() && ModalService.isModalStackable(id) && !ModalService.isCompactWindowDetached(id);
  const bounds = clampCompactWindowBounds((group ? ModalService.getCompactStackBounds(id) : floating) ?? {
    x: window.innerWidth - modalLayout.width - modalLayout.inset, y: Math.max(modalLayout.inset, window.innerHeight - modalLayout.height - modalLayout.inset),
    width: modalLayout.width, height: Math.min(modalLayout.height, window.innerHeight - 2 * modalLayout.inset),
  }, window.innerWidth, window.innerHeight);
  const offset = stacked ? index * modalStackStep(count) : 0;
  const depth = stacked ? modalStackDepth(index, count) : 0;
  return { bounds, panel: { x: bounds.x + depth, y: bounds.y + offset, width: bounds.width - depth * 2, height: bounds.height - offset }, group };
}

const edgeLabels: Record<string, string> = { n: 'top', ne: 'top right', e: 'right', se: 'bottom right', s: 'bottom', sw: 'bottom left', w: 'left', nw: 'top left' };
const edges = Object.keys(edgeLabels);
type DragPointer = Pick<React.PointerEvent, 'button' | 'pointerId' | 'clientX' | 'clientY' | 'preventDefault'> & { currentTarget: Element };
type Gesture = { pointer: number; x: number; y: number; bounds: CompactWindowBounds; edge: string; group: boolean; moved: boolean; rear: boolean };

export const CompactWindowControls = ({ id, title, index, count, stacked, active }: {
  id: string; title: string; index: number; count: number; stacked: boolean; active: boolean;
}) => {
  const controlsRef = useRef<HTMLDivElement>(null);
  const bandGesture = useRef(false);
  const gesture = useRef<Gesture | null>(null);
  const frame = useRef<number | undefined>(undefined);
  const pending = useRef<CompactWindowBounds | null>(null);
  const dropTarget = useRef<HTMLElement | null>(null);
  const moveHighlight = useRef<{ key: string; roots: HTMLElement[] }>({ key: '', roots: [] });
  const highlightMove = (group: boolean | null) => {
    const ids = group === null ? [] : group ? ModalService.getStackedBamIds(id) : [id];
    const key = ids.join(',');
    if (moveHighlight.current.key === key) return;
    moveHighlight.current.roots.forEach((root) => root.classList.remove('modalRoot-move-highlight'));
    const members = new Set(ids);
    const roots = ids.length ? Array.from(document.querySelectorAll<HTMLElement>('.modalRoot-window-controls'))
      .filter((root) => members.has(root.dataset.modalId!)) : [];
    roots.forEach((root) => root.classList.add('modalRoot-move-highlight'));
    moveHighlight.current = { key, roots };
  };
  const clearDropTarget = () => {
    dropTarget.current?.classList.remove('modalRoot-drop-target');
    dropTarget.current = null;
  };
  const candidates = () => Array.from(document.querySelectorAll<HTMLElement>('.modalRoot-window-controls')).flatMap((root) => {
    const panel = root.querySelector('.rc-modal > .modal-content-wrapper, .rc-modal > .modal-content');
    const modalId = root.dataset.modalId;
    if (!panel || !modalId) return [];
    const rect = panel.getBoundingClientRect();
    // The docking cue is visual only; it must not change the overlap threshold.
    const translateY = parseFloat(getComputedStyle(panel).translate.split(' ')[1]) || 0;
    return [{ id: modalId, bounds: { x: rect.x, y: rect.y - translateY, width: rect.width, height: rect.height } }];
  });
  const layout = () => compactWindowLayout(id, index, count, stacked);
  const flush = () => {
    if (pending.current && gesture.current) {
      ModalService.setCompactWindowBounds(id, pending.current, gesture.current.group);
      if (gesture.current.rear) ModalService.focusCompactWindow(id);
    }
    pending.current = null;
    clearDropTarget();
    if (gesture.current?.edge === 'move') {
      const target = ModalService.findCompactWindowDropTarget(id, candidates(), gesture.current.group);
      if (target) {
        dropTarget.current = Array.from(document.querySelectorAll<HTMLElement>('.modalRoot-window-controls'))
          .find((root) => root.dataset.modalId === target.id) ?? null;
        dropTarget.current?.classList.add('modalRoot-drop-target');
      }
    }
  };
  useEffect(() => {
    const root = controlsRef.current?.closest('.modalRoot');
    return () => {
    root?.classList.remove('modalRoot-band-hover');
    highlightMove(null);
    clearDropTarget();
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    ModalService.setCompactWindowInteracting(false, id);
    };
  }, [id]);
  useEffect(() => {
    if (!active) return;
    const resize = () => {
      ModalService.fitCompactWindowToViewport(id);
    };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); };
  }, [id, active]);

  const begin = (event: DragPointer, edge: string, moveGroup = false, rear = false) => {
    if (event.button !== 0) return;
    event.preventDefault();
    ModalService.setCompactWindowInteracting(true, id);
    const current = layout();
    const group = current.group && (edge !== 'move' || moveGroup);
    const rearRect = rear ? controlsRef.current?.closest('.modalRoot')
      ?.querySelector('.rc-modal > .modal-content-wrapper, .rc-modal > .modal-content')?.getBoundingClientRect() : undefined;
    const bounds = rearRect ? { x: rearRect.x, y: rearRect.y, width: rearRect.width, height: rearRect.height }
      : group ? current.bounds : current.panel;
    gesture.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY,
      bounds, edge, group, moved: false, rear };
    event.currentTarget.setPointerCapture(event.pointerId);
    if (!rear) ModalService.focusCompactWindow(id);
  };
  const move = (event: Pick<PointerEvent, 'pointerId' | 'clientX' | 'clientY'>) => {
    const g = gesture.current;
    if (!g || g.pointer !== event.pointerId) return;
    const dx = event.clientX - g.x, dy = event.clientY - g.y;
    if (!g.moved && Math.hypot(dx, dy) < 4) return;
    g.moved = true;
    const next = { ...g.bounds };
    if (g.edge === 'move') { next.x += dx; next.y += dy; }
    else {
      const minWidth = Math.min(modalLayout.minWidth, window.innerWidth), minHeight = Math.min(modalLayout.minHeight, window.innerHeight);
      if (g.edge.includes('e')) next.width = Math.max(minWidth, Math.min(window.innerWidth - next.x, next.width + dx));
      if (g.edge.includes('s')) next.height = Math.max(minHeight, Math.min(window.innerHeight - next.y, next.height + dy));
      if (g.edge.includes('w')) { next.x = Math.max(0, Math.min(g.bounds.x + dx, g.bounds.x + g.bounds.width - minWidth)); next.width = g.bounds.width + g.bounds.x - next.x; }
      if (g.edge.includes('n')) { next.y = Math.max(0, Math.min(g.bounds.y + dy, g.bounds.y + g.bounds.height - minHeight)); next.height = g.bounds.height + g.bounds.y - next.y; }
    }
    pending.current = next;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(flush);
  };
  const end = (drop = false) => {
    highlightMove(null);
    const current = gesture.current;
    flush();
    gesture.current = null;
    clearDropTarget();
    ModalService.setCompactWindowInteracting(false, id);
    if (drop && current?.rear && !current.moved) ModalService.bringToFront(id);
    if (drop && current?.moved && current.edge === 'move') ModalService.dockCompactWindow(id, candidates(), current.group);
  };
  const pointerHandlers = useRef<Record<string, (event: PointerEvent) => void>>({});
  // Listen on the existing window instead of covering its content with a drag overlay.
  // Native controls and custom opt-out regions retain their normal pointer behavior.
  useLayoutEffect(() => {
    const root = controlsRef.current?.closest<HTMLElement>('.modalRoot');
    if (!root) return;
    const hit = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return null;
      if (!active) return target.closest('.modal-stack-activate') ? { group: false, rear: true } : null;
      const interactive = target.closest('button, a, input, textarea, select, label, [role="button"], [role="link"], [role="slider"], [role="checkbox"], [role="switch"], [tabindex], [contenteditable]:not([contenteditable="false"]), [data-modal-no-drag]');
      const panel = root.querySelector('.rc-modal > .modal-content-wrapper, .rc-modal > .modal-content');
      if (!panel?.contains(target) || (interactive && panel.contains(interactive))) return null;
      const rect = panel.getBoundingClientRect();
      if (event.clientY < rect.top + modalLayout.resizeEdge || event.clientY > rect.top + modalLayout.titleBand || event.clientX < rect.left + modalLayout.resizeEdge || event.clientX > rect.right - modalLayout.resizeEdge) return null;
      return { group: layout().group && Math.abs(event.clientX - (rect.left + rect.width / 2)) <= modalLayout.stackMoveHalfWidth, rear: false };
    };
    const down = (event: PointerEvent) => {
      const area = hit(event);
      if (!area || event.button !== 0 || event.defaultPrevented) return;
      bandGesture.current = true;
      root.classList.add('modalRoot-band-hover');
      highlightMove(area.group);
      begin({ button: event.button, pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY,
        preventDefault: () => event.preventDefault(), currentTarget: root }, 'move', area.group, area.rear);
    };
    const motion = (event: PointerEvent) => {
      if (bandGesture.current) move(event);
      else {
        const area = hit(event);
        root.classList.toggle('modalRoot-band-hover', !!area);
        highlightMove(area ? area.group : null);
      }
    };
    const finish = () => { if (bandGesture.current) { bandGesture.current = false; end(true); } };
    const cancel = () => { if (bandGesture.current) { bandGesture.current = false; end(); } };
    const leave = () => {
      root.classList.remove('modalRoot-band-hover');
      if (!bandGesture.current) highlightMove(null);
    };
    pointerHandlers.current = { pointerdown: down, pointermove: motion, pointerup: finish,
      pointercancel: cancel, lostpointercapture: cancel, pointerleave: leave };
  });
  useEffect(() => {
    const root = controlsRef.current?.closest<HTMLElement>('.modalRoot');
    if (!root) return;
    const events = ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture', 'pointerleave'];
    const forward = (event: Event) => pointerHandlers.current[event.type]?.(event as PointerEvent);
    events.forEach((event) => root.addEventListener(event, forward));
    return () => events.forEach((event) => root.removeEventListener(event, forward));
  }, [id]);
  const keyboard = (event: React.KeyboardEvent, edge: string, moveGroup = false) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const current = layout();
    const group = current.group && (edge !== 'move' || moveGroup);
    const next = { ...(group ? current.bounds : current.panel) };
    const delta = event.shiftKey ? 40 : 10;
    const dx = event.key === 'ArrowRight' ? delta : event.key === 'ArrowLeft' ? -delta : 0;
    const dy = event.key === 'ArrowDown' ? delta : event.key === 'ArrowUp' ? -delta : 0;
    if (edge === 'move') { next.x += dx; next.y += dy; }
    else { next.width += dx; next.height += dy; }
    ModalService.setCompactWindowBounds(id, next, group);
    ModalService.focusCompactWindow(id);
  };
  const handlers = (edge: string, group = false) => ({
    onPointerDown: (e: React.PointerEvent) => begin(e, edge, group), onPointerMove: move,
    onPointerUp: () => end(true), onPointerCancel: () => end(), onLostPointerCapture: () => end(),
    onKeyDown: (e: React.KeyboardEvent) => keyboard(e, edge, group),
  });
  return <div ref={controlsRef} className="compact-window-controls">
    {active && <>
    <button type="button" className="compact-window-move compact-window-move-left"
      aria-label={translationService.get('Move %title%', { title }).value} title={translationService.get('Drag window · arrow keys to move').value} {...handlers('move')} />
    <button type="button" className="compact-window-move compact-window-move-right"
      aria-label={translationService.get('Move %title% from right corner', { title }).value} title={translationService.get('Drag window · arrow keys to move').value} {...handlers('move')} />
    {layout().group && <button type="button" className="compact-window-move compact-window-move-stack"
      aria-label={translationService.get('Move stack').value} title={translationService.get('Drag entire stack · arrow keys to move').value} {...handlers('move', true)} />}
    {edges.map((edge) => <button key={edge} className={`compact-window-resize compact-window-resize-${edge}`}
      aria-label={translationService.get('Resize %title% %edge%', { title, edge: translationService.get(edgeLabels[edge]).value }).value} title={translationService.get('Drag to resize. Arrow keys change width and height.').value}
      {...handlers(edge)} />)}
    </>}
  </div>;
};
