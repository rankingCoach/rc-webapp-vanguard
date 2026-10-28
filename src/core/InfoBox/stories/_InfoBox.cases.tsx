import { IconNames } from '@vanguard/Icon/IconNames';
import React from 'react';

import type { InfoBoxProps, InfoBoxType } from '../InfoBox';

/**
 * Every InfoBox case worth looking at, rendered by the "All Cases" story.
 */
export type InfoBoxCase = {
  key: string;
  label: string;
  props: InfoBoxProps;
  /** Width of the cell the InfoBox is rendered in, defaults to `CELL_WIDTH` */
  cellWidth?: number;
};

export type InfoBoxCaseGroup = {
  key: string;
  title: string;
  description?: string;
  cases: InfoBoxCase[];
};

export const CELL_WIDTH = 360;
const NARROW_CELL_WIDTH = 320;

const TYPES: InfoBoxType[] = ['info', 'success', 'warn', 'danger'];

const noop = () => undefined;

const text = {
  title: 'Info box title',
  description: 'A short description that fits on one line.',
  longTitle: 'A much longer title that has to wrap onto a second line in a narrow box',
  longDescription:
    'A longer description that wraps onto several lines, so we can see how the icon and the close button ' +
    'line up with the first line of text when the content grows taller than a single line.',
};

// No `type`: the cases show InfoBox's default action types
const positive = { cta: noop, text: 'Accept', icon: IconNames.check };
const negative = { cta: noop, text: 'Decline', icon: IconNames.close };

const CONTENT_SHAPES: { key: string; label: string; props: Pick<InfoBoxProps, 'title' | 'description'> }[] = [
  {
    key: 'title-description',
    label: 'title + description',
    props: { title: text.title, description: text.description },
  },
  { key: 'description-only', label: 'description only', props: { description: text.description } },
  { key: 'title-only', label: 'title only', props: { title: text.title, description: '' } },
  {
    key: 'long',
    label: 'long title + long description',
    props: { title: text.longTitle, description: text.longDescription },
  },
  { key: 'long-description-only', label: 'long description only', props: { description: text.longDescription } },
];

const typesByContent: InfoBoxCaseGroup[] = [false, true].map((dismissible) => ({
  key: dismissible ? 'dismissible' : 'static',
  title: dismissible ? 'Types × content, dismissible' : 'Types × content',
  description: dismissible
    ? 'Check the close button: muted, centred on the first line, the title (28px) or the first description line (24px).'
    : 'Check the icon: warn is drawn in a filled triangle, the other types in a filled circle.',
  cases: CONTENT_SHAPES.flatMap((shape) =>
    TYPES.map((type) => ({
      key: `${dismissible ? 'dismissible' : 'static'}-${shape.key}-${type}`,
      label: `${type} · ${shape.label}`,
      props: { type, ...shape.props, dismissible },
    })),
  ),
}));

const actions: InfoBoxCaseGroup = {
  key: 'actions',
  title: 'Action buttons',
  cases: [
    {
      key: 'positive',
      label: 'info · positive',
      props: { type: 'info', title: text.title, description: text.description, positive },
    },
    {
      key: 'negative',
      label: 'info · negative',
      props: { type: 'info', title: text.title, description: text.description, negative },
    },
    {
      key: 'both',
      label: 'info · positive + negative',
      props: { type: 'info', title: text.title, description: text.description, positive, negative },
    },
    ...TYPES.map((type) => ({
      key: `both-dismissible-${type}`,
      label: `${type} · positive + negative, dismissible`,
      props: { type, title: text.title, description: text.description, positive, negative, dismissible: true },
    })),
  ],
};

const descriptionFormats: InfoBoxCaseGroup = {
  key: 'description-formats',
  title: 'Description formats',
  cases: [
    {
      key: 'array',
      label: 'string[] description',
      props: {
        type: 'info',
        title: text.title,
        description: ['First line of the description.', 'Second line of the description.'],
      },
    },
    {
      key: 'array-dismissible',
      label: 'string[] description, dismissible, no title',
      props: {
        type: 'warn',
        description: ['First line of the description.', 'Second line of the description.'],
        dismissible: true,
      },
    },
    {
      key: 'react-node',
      label: 'ReactNode description',
      props: {
        type: 'success',
        title: text.title,
        description: (
          <span>
            A <strong>ReactNode</strong> description.
          </span>
        ),
      },
    },
    {
      key: 'links',
      label: 'with links',
      props: {
        type: 'info',
        title: text.title,
        description: 'Read more in the <link>help center</link>.',
        links: { link: { text: '', onClick: noop } },
        dismissible: true,
      },
    },
    {
      key: 'replacements',
      label: 'with replacements',
      props: {
        type: 'danger',
        title: text.title,
        description: 'A description with a <strong>bold</strong> word.',
        replacements: {
          // @ts-ignore same as WithReplacements.story
          strong: (value: string) => <strong key={value}>{value}</strong>,
        },
      },
    },
  ],
};

const layout: InfoBoxCaseGroup = {
  key: 'layout',
  title: 'Size & layout',
  description: 'Rendered in a 560px cell so position, width and maxWidth are visible.',
  cases: [
    ...(['start', 'center', 'end'] as const).map((position) => ({
      key: `position-${position}`,
      label: `position ${position}, width 300px`,
      props: { type: 'info' as const, title: text.title, description: text.description, position, width: '300px' },
      cellWidth: 560,
    })),
    {
      key: 'max-width',
      label: 'maxWidth 400px, long text',
      props: {
        type: 'info',
        title: text.longTitle,
        description: text.longDescription,
        maxWidth: '400px',
        dismissible: true,
      },
      cellWidth: 560,
    },
    {
      key: 'radius-0',
      label: 'borderRadius 0',
      props: { type: 'success', title: text.title, description: text.description, borderRadius: 0 },
    },
    {
      key: 'radius-12',
      label: 'borderRadius 12',
      props: { type: 'success', title: text.title, description: text.description, borderRadius: 12 },
    },
  ],
};

const narrow: InfoBoxCaseGroup = {
  key: 'narrow',
  title: `Narrow (${NARROW_CELL_WIDTH}px)`,
  description: 'Mobile-like width: long text, dismissible, with action buttons, and a long URL that has to wrap.',
  cases: [
    ...TYPES.map((type) => ({
      key: `narrow-${type}`,
      label: `${type} · narrow`,
      props: { type, title: text.longTitle, description: text.longDescription, dismissible: true, positive, negative },
      cellWidth: NARROW_CELL_WIDTH,
    })),
    {
      key: 'narrow-long-url',
      label: 'info · narrow, long unbreakable URL',
      props: {
        type: 'info',
        description:
          'Check https://www.example.com/a/very/long/path/that/cannot/break/on/its/own/page.html for details.',
        dismissible: true,
      },
      cellWidth: NARROW_CELL_WIDTH,
    },
  ],
};

export const INFO_BOX_CASE_GROUPS: InfoBoxCaseGroup[] = [
  ...typesByContent,
  actions,
  descriptionFormats,
  layout,
  narrow,
];

export const INFO_BOX_CASE_COUNT = INFO_BOX_CASE_GROUPS.reduce((count, group) => count + group.cases.length, 0);
