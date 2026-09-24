import React, { useEffect, useRef } from 'react';
import { clampCompactWindowBounds, CompactWindowBounds, ModalService } from '../ModalService';

export function compactWindowLayout(id: string, index: number, count: number, stacked: boolean) {
  const floating = ModalService.getCompactWindowBounds(id);
  const group = ModalService.isStackingEnabled() && !ModalService.isCompactWindowDetached(id);
  const bounds = clampCompactWindowBounds((group ? ModalService.getCompactStackBounds(id) : floating) ?? {
    x: window.innerWidth - 496, y: Math.max(16, window.innerHeight - 776),
    width: 480, height: Math.min(760, window.innerHeight - 32),
  }, window.innerWidth, window.innerHeight);
  const offset = stacked ? index * Math.min(28, 140 / Math.max(1, count - 1)) : 0;
  const depth = stacked ? Math.min(4, count - 1 - index) * 10 : 0;
  return { bounds, panel: { x: bounds.x + depth, y: bounds.y + offset, width: bounds.width - depth * 2, height: bounds.height - offset }, group };
}

const edges = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
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
    ModalService.setCompactWindowInteracting(false);
    };
  }, [id]);
  useEffect(() => {
    if (!active) return;
    const resize = () => {
      const { bounds, group } = layout();
      ModalService.setCompactWindowBounds(id, bounds, group);
    };
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('resize', resize); if (frame.current !== undefined) cancelAnimationFrame(frame.current); };
  }, [id, index, count, stacked, active]);

  const begin = (event: DragPointer, edge: string, moveGroup = false, rear = false) => {
    if (event.button !== 0) return;
    event.preventDefault();
    ModalService.setCompactWindowInteracting(true);
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
      const minWidth = Math.min(320, window.innerWidth), minHeight = Math.min(240, window.innerHeight);
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
    ModalService.setCompactWindowInteracting(false);
    if (drop && current?.rear && !current.moved) ModalService.bringToFront(id);
    if (drop && current?.moved && current.edge === 'move') ModalService.dockCompactWindow(id, candidates(), current.group);
  };
  // Listen on the existing window instead of covering its content with a drag overlay.
  // Native controls and custom opt-out regions retain their normal pointer behavior.
  useEffect(() => {
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
      if (event.clientY < rect.top + 8 || event.clientY > rect.top + 48 || event.clientX < rect.left + 8 || event.clientX > rect.right - 8) return null;
      return { group: layout().group && Math.abs(event.clientX - (rect.left + rect.width / 2)) <= 48, rear: false };
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
    root.addEventListener('pointerdown', down);
    root.addEventListener('pointermove', motion);
    root.addEventListener('pointerup', finish);
    root.addEventListener('pointercancel', cancel);
    root.addEventListener('lostpointercapture', cancel);
    root.addEventListener('pointerleave', leave);
    return () => {
      root.removeEventListener('pointerdown', down);
      root.removeEventListener('pointermove', motion);
      root.removeEventListener('pointerup', finish);
      root.removeEventListener('pointercancel', cancel);
      root.removeEventListener('lostpointercapture', cancel);
      root.removeEventListener('pointerleave', leave);
    };
  });
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
      aria-label={`Move ${title}`} title="Drag window · arrow keys to move" {...handlers('move')} />
    <button type="button" className="compact-window-move compact-window-move-right"
      aria-label={`Move ${title} from right corner`} title="Drag window · arrow keys to move" {...handlers('move')} />
    {layout().group && <button type="button" className="compact-window-move compact-window-move-stack"
      aria-label="Move stack" title="Drag entire stack · arrow keys to move" {...handlers('move', true)} />}
    {edges.map((edge) => <button key={edge} className={`compact-window-resize compact-window-resize-${edge}`}
      aria-label={`Resize ${title} ${edge}`} title="Drag to resize. Arrow keys change width and height."
      {...handlers(edge)} />)}
    </>}
  </div>;
};
