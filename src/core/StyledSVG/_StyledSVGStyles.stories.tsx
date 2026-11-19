import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { StoryObj } from '@storybook/react';
import React from 'react';
import { expect, waitFor } from 'storybook/test';

import { StyledSVG } from './StyledSVG';

/**
 * Track f3 differential: computed styles of the svg, its path and rect across the prop matrix, measured in Chromium.
 * EXPECTED was captured from the styled-components implementation (768ca96) and must not change with the static-SCSS
 * implementation. The old `filter: (Npx)` was invalid CSS (computes to `none`) and stays without effect.
 */
const SRC =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="24" height="24"/><path d="M0 0h24v24H0z"/></svg>';

const CASES: Record<string, Record<string, unknown>> = {
  plain: {},
  sized: { width: 24, height: 24 },
  colored: { width: 16, color: 'rgb(10, 20, 30)' },
  hoverColor: { width: 16, color: 'red', hovercolor: 'blue' },
  hoverClass: { width: 16, color: 'red', hovercolor: 'blue', className: 'hover' },
  opacity: { width: 32, color: '#123456', fillOpacity: '0.2' },
  rect: { width: 48, backgroundcolor: 'green' },
  repeat: { width: 20, backgroundrepeat: 'no-repeat' },
  filter: { width: 20, filter: 3 },
  consumerStyle: { width: 20, color: 'red', style: { opacity: 0.5, marginLeft: 3 } },
};

const PROPS = {
  svg: ['width', 'height', 'vertical-align', 'background-repeat', 'filter', 'opacity', 'margin-left'],
  path: ['fill', 'fill-opacity', 'width', 'height', 'background-repeat'],
  rect: ['fill', 'background-repeat'],
};

const measure = (root: HTMLElement) => {
  const out: Record<string, unknown> = {};
  for (const name of Object.keys(CASES)) {
    const host = root.querySelector(`[data-case="${name}"]`) as HTMLElement;
    out[name] = Object.fromEntries(
      Object.entries(PROPS).map(([part, props]) => {
        const el = host.querySelector(part);
        const cs = el ? getComputedStyle(el) : null;
        return [part, cs ? Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)])) : null];
      }),
    );
  }
  return out;
};

const EXPECTED: Record<string, unknown> = {
  "plain": {
    "svg": {
      "width": "1200px",
      "height": "1200px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(0, 0, 0)",
      "fill-opacity": "1",
      "width": "auto",
      "height": "auto",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "sized": {
    "svg": {
      "width": "24px",
      "height": "24px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(0, 0, 0)",
      "fill-opacity": "1",
      "width": "24px",
      "height": "24px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "colored": {
    "svg": {
      "width": "16px",
      "height": "16px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(10, 20, 30)",
      "fill-opacity": "1",
      "width": "16px",
      "height": "16px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "hoverColor": {
    "svg": {
      "width": "16px",
      "height": "16px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(255, 0, 0)",
      "fill-opacity": "1",
      "width": "16px",
      "height": "16px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "hoverClass": {
    "svg": {
      "width": "16px",
      "height": "16px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(0, 0, 255)",
      "fill-opacity": "1",
      "width": "16px",
      "height": "16px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "opacity": {
    "svg": {
      "width": "32px",
      "height": "32px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(18, 52, 86)",
      "fill-opacity": "0.2",
      "width": "32px",
      "height": "32px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "rect": {
    "svg": {
      "width": "48px",
      "height": "48px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(0, 0, 0)",
      "fill-opacity": "1",
      "width": "48px",
      "height": "48px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 128, 0)",
      "background-repeat": "repeat"
    }
  },
  "repeat": {
    "svg": {
      "width": "20px",
      "height": "20px",
      "vertical-align": "baseline",
      "background-repeat": "no-repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(0, 0, 0)",
      "fill-opacity": "1",
      "width": "20px",
      "height": "20px",
      "background-repeat": "no-repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "no-repeat"
    }
  },
  "filter": {
    "svg": {
      "width": "20px",
      "height": "20px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "1",
      "margin-left": "0px"
    },
    "path": {
      "fill": "rgb(0, 0, 0)",
      "fill-opacity": "1",
      "width": "20px",
      "height": "20px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  },
  "consumerStyle": {
    "svg": {
      "width": "20px",
      "height": "20px",
      "vertical-align": "baseline",
      "background-repeat": "repeat",
      "filter": "none",
      "opacity": "0.5",
      "margin-left": "3px"
    },
    "path": {
      "fill": "rgb(255, 0, 0)",
      "fill-opacity": "1",
      "width": "20px",
      "height": "20px",
      "background-repeat": "repeat"
    },
    "rect": {
      "fill": "rgb(0, 0, 0)",
      "background-repeat": "repeat"
    }
  }
};

export const Matrix: StoryObj = {
  render: () => (
    <div>
      {Object.entries(CASES).map(([name, props]) => (
        <div key={name} data-case={name}>
          <StyledSVG src={SRC} {...(props as object)} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelectorAll('path').length).toBe(Object.keys(CASES).length));
    const actual = measure(canvasElement);
    await expect(actual).toEqual(EXPECTED);
  },
};

export default {
  ...SbDecorator({ title: 'Vanguard/StyledSVG/StylesDifferential', component: StyledSVG }),
};
