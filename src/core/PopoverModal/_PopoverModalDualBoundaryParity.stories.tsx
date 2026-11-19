import Popper from '@mui/material/Popper';
import type { StoryObj } from '@storybook/react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React, { useEffect, useRef, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { PopoverModal } from './PopoverModal';

export default {
  ...SbDecorator({ title: 'Vanguard/PopoverModal/Dual Boundary Parity', component: PopoverModal }),
};

type Renderer = 'frozen' | 'own';
type Story = StoryObj<typeof PopoverModal>;

// The former MUI path of PopoverModal. The consumer uses top placement and a body portal.
const FrozenPopover = ({ anchor, content }: { anchor: HTMLElement | null; content: React.ReactNode }) => {
  const card = useRef<HTMLSpanElement>(null);
  const [offset, setOffset] = useState<[number, number]>([0, 0]);
  useEffect(() => {
    if (anchor && card.current) {
      setOffset([0, -(anchor.getBoundingClientRect().height + card.current.getBoundingClientRect().height) / 2]);
    }
  }, [anchor, content]);
  return (
    <Popper
      open={Boolean(anchor)}
      anchorEl={anchor}
      placement="top"
      modifiers={[
        { name: 'flip', options: { altBoundary: true, rootBoundary: 'viewport', padding: 8 } },
        { name: 'preventOverflow', options: { altAxis: true, tether: true } },
        { name: 'offset', options: { offset } },
        { name: 'computeStyles', options: { gpuAcceleration: false } },
      ]}
    >
      <span ref={card} style={{ position: 'relative', zIndex: 8 }}>
        {content}
      </span>
    </Popper>
  );
};

const Harness = () => {
  const [renderer, choose] = useState<Renderer>('frozen');
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const content = (
    <div data-testid="dual-boundary-card" style={{ width: 230, height: 48, background: 'white' }}>
      {'Create event'}
    </div>
  );
  return (
    <>
      <button
        type="button"
        onClick={() => {
          setAnchor(null);
          choose('frozen');
        }}
      >
        {'frozen'}
      </button>
      <button
        type="button"
        onClick={() => {
          setAnchor(null);
          choose('own');
        }}
      >
        {'own'}
      </button>
      <div
        data-testid="calendar-scroll"
        style={{ position: 'relative', overflow: 'auto', margin: '24px 0 0 120px', width: 250, height: 190 }}
      >
        <div style={{ width: 600, height: 500 }}>
          <button
            type="button"
            data-testid="calendar-event"
            style={{ position: 'absolute', top: 125, left: 187, width: 48, height: 34 }}
            onClick={(event) => setAnchor(event.currentTarget)}
          >
            {'Event'}
          </button>
        </div>
      </div>
      {anchor &&
        (renderer === 'frozen' ? (
          <FrozenPopover anchor={anchor} content={content} />
        ) : (
          <PopoverModal
            anchorEl={anchor}
            isOpen
            centerPopover
            renderInPortal
            disableBackdropClick
            content={content}
            zIndex={7}
          />
        ))}
    </>
  );
};

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const firstVisible = async (doc: Document) => {
  for (let i = 0; i < 60; i++) {
    await frame();
    const popper = doc.querySelector('[data-testid="dual-boundary-card"]')?.closest('[role="tooltip"]');
    if (!popper || getComputedStyle(popper).visibility === 'hidden') continue;
    const { x, y, width, height } = popper.getBoundingClientRect();
    if (width === 0 || height === 0) continue;
    return {
      own: popper.hasAttribute('data-vg-core'),
      geometry: {
        x,
        y,
        width,
        height,
        placement: popper.getAttribute('data-popper-placement'),
        portal: popper.parentNode === doc.body,
      },
    };
  }
  throw new Error('The planner-shaped card never became visible');
};

const paired =
  (order: [Renderer, Renderer]): Story['play'] =>
  async ({ canvasElement }) => {
    const doc = canvasElement.ownerDocument;
    const canvas = within(canvasElement);
    const scroller = canvas.getByTestId('calendar-scroll');
    const geometry = [];
    for (const renderer of order) {
      await userEvent.click(canvas.getByRole('button', { name: renderer }));
      scroller.scrollTo(0, 0);
      const firstPaint = firstVisible(doc);
      await userEvent.click(canvas.getByTestId('calendar-event'));
      const first = await firstPaint;
      await expect(first.own).toBe(renderer === 'own');
      await expect(first.geometry.portal).toBe(true);
      await expect(first.geometry.placement).toBe('top');
      scroller.scrollTo(31, 22);
      await frame();
      const scrolled = await firstVisible(doc);
      await expect(scrolled.geometry.x).not.toEqual(first.geometry.x);
      geometry.push({ first: first.geometry, scrolled: scrolled.geometry });
    }
    console.info('Planner-shaped portal geometry', JSON.stringify({ order, geometry }));
    await expect(geometry[0]).toEqual(geometry[1]);
  };

export const FrozenFirst: Story = { render: () => <Harness />, play: paired(['frozen', 'own']) };
export const OwnFirst: Story = { render: () => <Harness />, play: paired(['own', 'frozen']) };
