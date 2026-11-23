import { useMediaQuery as muiUseMediaQuery } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { useMediaQuery } from './use-media-query';

/**
 * Watchdog H18: server-render and first-render values equal MUI's. Server (renderToString, no matchMedia read):
 * defaultMatches, or the real match with noSsr + matchMedia. Client without window.matchMedia (old jsdom):
 * defaultMatches. First client render with a matching matchMedia: the store value (MUI useSyncExternalStore path).
 */
type Hook = typeof useMediaQuery;
type ProbeProps = { hook: Hook; options: Parameters<Hook>[1] };
const matching = (q: string) =>
  ({ matches: true, media: q, addEventListener: () => {}, removeEventListener: () => {} }) as unknown as MediaQueryList;

const ServerProbe = ({ hook, options }: ProbeProps) => <span>{String(hook('(min-width:1px)', options))}</span>;

const ClientProbe = ({ hook, options, values }: ProbeProps & { values: boolean[] }) => {
  values.push(hook('(min-width:1px)', options));
  return null;
};

const server = (hook: Hook, options: Parameters<Hook>[1]) =>
  renderToString(<ServerProbe hook={hook} options={options} />);

const firstClient = (hook: Hook, options: Parameters<Hook>[1]) => {
  const values: boolean[] = [];
  const view = render(<ClientProbe hook={hook} options={options} values={values} />);
  view.unmount();
  return values;
};

describe('useMediaQuery SSR / first render equals MUI', () => {
  const cases: [string, Parameters<Hook>[1]][] = [
    ['default', {}],
    ['defaultMatches', { defaultMatches: true }],
    ['custom matchMedia', { matchMedia: matching }],
    ['noSsr + custom matchMedia', { noSsr: true, matchMedia: matching }],
  ];
  for (const [name, options] of cases) {
    it(`server render: ${name}`, () => {
      expect(server(useMediaQuery, options)).toBe(server(muiUseMediaQuery as Hook, options));
    });
    it(`first client render: ${name}`, () => {
      expect(firstClient(useMediaQuery, options)).toEqual(firstClient(muiUseMediaQuery as Hook, options));
    });
  }
  it('no window.matchMedia: defaultMatches, like MUI', () => {
    const original = window.matchMedia;
    // jsdom without matchMedia support
    (window as unknown as { matchMedia?: unknown }).matchMedia = undefined;
    try {
      for (const options of [{}, { defaultMatches: true }]) {
        expect(firstClient(useMediaQuery, options)).toEqual(firstClient(muiUseMediaQuery as Hook, options));
      }
    } finally {
      window.matchMedia = original;
    }
  });
});
