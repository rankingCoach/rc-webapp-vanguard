import { ProgressBar } from '@vanguard/ProgressBar/ProgressBar';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import { render, screen } from '../../../test-utils/test-utils';

/**
 * MUI contract for ProgressBar (wraps MUI v5 `LinearProgress`).
 * Computed colours of the `& .MuiLinearProgress-bar` sx override are checked in a real browser in
 * `_ProgressBarMuiContract.stories.tsx` (jsdom does not resolve the cascade reliably).
 */

// Vanguard's sx targets `.MuiLinearProgress-bar` to colour the bar (src/core/ProgressBar/ProgressBar.tsx:39), so the
// class is part of the contract. Other MUI LinearProgress classes have no Vanguard dependency and are not asserted.
const getBars = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('.MuiLinearProgress-bar'));

describe('ProgressBar (MUI LinearProgress contract)', () => {
  describe('determinate (default variant)', () => {
    it('renders a progressbar with aria-valuenow/min/max from progressValue', () => {
      render(<ProgressBar progressValue={30} />);

      const bar = screen.getByRole('progressbar');
      expect(bar.getAttribute('aria-valuenow')).toBe('30');
      expect(bar.getAttribute('aria-valuemin')).toBe('0');
      expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });

    it('rounds a fractional progressValue in aria-valuenow', () => {
      render(<ProgressBar progressValue={33.6} />);

      expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('34');
    });

    it('renders one .MuiLinearProgress-bar translated by (value - 100)%', () => {
      render(<ProgressBar progressValue={30} />);

      const bars = getBars(screen.getByRole('progressbar'));
      expect(bars).toHaveLength(1);
      expect(bars[0].style.transform).toBe('translateX(-70%)');
    });

    // CURRENT BEHAVIOUR (suspected bug): with the default `determinate` variant and no progressValue, MUI sets no
    // transform, so the bar paints FULL width (and MUI logs a dev error), instead of an empty bar.
    it('[bug-lock] sets no aria-valuenow and no bar transform when progressValue is omitted', () => {
      // Baseline characterization: not a promised contract.
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      render(<ProgressBar />);

      const root = screen.getByRole('progressbar');
      expect(root.hasAttribute('aria-valuenow')).toBe(false);
      expect(getBars(root)[0].style.transform).toBe('');
      errorSpy.mockRestore();
    });

    it('a full bar (100) and an empty bar (0) map to translateX(0%) and translateX(-100%)', () => {
      render(
        <>
          <ProgressBar progressValue={100} />
          <ProgressBar progressValue={0} />
        </>,
      );

      const [full, empty] = screen.getAllByRole('progressbar').map((root) => getBars(root)[0].style.transform);
      expect(full).toBe('translateX(0%)');
      expect(empty).toBe('translateX(-100%)');
    });
  });

  describe('other variants', () => {
    it('buffer: renders two bars, bar1 translated by value, aria-valuenow set', () => {
      render(<ProgressBar variant="buffer" progressValue={40} />);

      const root = screen.getByRole('progressbar');
      expect(root.getAttribute('aria-valuenow')).toBe('40');
      const bars = getBars(root);
      expect(bars).toHaveLength(2);
      expect(bars[0].style.transform).toBe('translateX(-60%)');
    });

    it('indeterminate: renders two bars without aria-valuenow or inline transform', () => {
      render(<ProgressBar variant="indeterminate" progressValue={40} />);

      const root = screen.getByRole('progressbar');
      expect(root.hasAttribute('aria-valuenow')).toBe(false);
      const bars = getBars(root);
      expect(bars).toHaveLength(2);
      bars.forEach((bar) => { expect(bar.style.transform).toBe(''); });
    });

    it('query: renders two bars without aria-valuenow', () => {
      render(<ProgressBar variant="query" progressValue={40} />);

      const root = screen.getByRole('progressbar');
      expect(root.hasAttribute('aria-valuenow')).toBe(false);
      expect(getBars(root)).toHaveLength(2);
    });
  });

  describe('sizing, colours and className (sx on the MUI root)', () => {
    it('defaults to height 12px, width 100% and the --n200 track', () => {
      render(<ProgressBar progressValue={10} />);

      const style = getComputedStyle(screen.getByRole('progressbar'));
      expect(style.height).toBe('12px');
      expect(style.width).toBe('100%');
      expect(style.backgroundColor).toBe('var(--n200)');
      expect(style.filter).toBe('');
    });

    it('applies height, width and bgColor props to the MUI root', () => {
      render(<ProgressBar progressValue={10} height="20px" width="50%" bgColor="#123456" />);

      const style = getComputedStyle(screen.getByRole('progressbar'));
      expect(style.height).toBe('20px');
      expect(style.width).toBe('50%');
      expect(style.backgroundColor).toBe('rgb(18, 52, 86)');
    });

    it('colours .MuiLinearProgress-bar with the color prop through the sx override', () => {
      render(<ProgressBar progressValue={10} color="#ff0000" />);

      const [bar] = getBars(screen.getByRole('progressbar'));
      expect(getComputedStyle(bar).backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('wraps a --css-variable bgColor in var()', () => {
      render(<ProgressBar progressValue={10} bgColor="--g100" />);

      expect(getComputedStyle(screen.getByRole('progressbar')).backgroundColor).toBe('var(--g100)');
    });

    it('forwards className to the MUI root (role=progressbar)', () => {
      render(<ProgressBar progressValue={10} className="consumer-class" />);

      const root = screen.getByRole('progressbar');
      expect(root.classList.contains('consumer-class')).toBe(true);
    });

    it('renders the MUI root inside the Vanguard container div', () => {
      const { container } = render(<ProgressBar progressValue={10} />);

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.tagName).toBe('DIV');
      expect(wrapper.firstElementChild).toBe(screen.getByRole('progressbar'));
    });
  });

  describe('isBlurred', () => {
    it('forces value 100, height 5px and a 15px blur, ignoring progressValue and height', () => {
      render(<ProgressBar isBlurred progressValue={40} height="30px" color="#ff0000" />);

      const root = screen.getByRole('progressbar');
      expect(root.getAttribute('aria-valuenow')).toBe('100');
      const style = getComputedStyle(root);
      expect(style.height).toBe('5px');
      expect(style.filter).toBe('blur(15px)');
      expect(getBars(root)[0].style.transform).toBe('translateX(0%)');
    });
  });
});
