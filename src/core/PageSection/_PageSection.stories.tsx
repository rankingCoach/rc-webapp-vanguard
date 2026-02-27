import type { Meta } from '@storybook/react';
import React from 'react';
import { SbDecorator } from '@test-utils/get-storybook-decorator';
import { PageSection } from './PageSection';
import description from './PageSection.description.md?raw';
import type { Story } from './stories/_PageSection.default';
import { baseStore } from '@stores/redux-base.store.ts';

import { Default as _Default } from './stories/Default.story';
import { DefaultUseCases as _DefaultUseCases } from './stories/DefaultUseCases.story';
import { WithHeader as _WithHeader } from './stories/WithHeader.story';
import { WithHeaderActionArea as _WithHeaderActionArea } from './stories/WithHeaderActionArea.story';
import { FrostedGlass as _FrostedGlass } from './stories/FrostedGlass.story';
import { RoundedEdgesComparison as _RoundedEdgesComparison } from './stories/RoundedEdgesComparison.story';
import { NoDefaultPadding as _NoDefaultPadding } from './stories/NoDefaultPadding.story';
import { Visibility as _Visibility } from './stories/Visibility.story';
import { BehaviorContract as _BehaviorContract } from './stories/BehaviorContract.story';
import { Backgrounds as _Backgrounds } from '@vanguard/PageSection/stories/Backgrounds.story.tsx';
import { GradientRcBreaks as _GradientRcBreaks } from './stories/GradientRcBreaks.story';

export const Default: Story = _Default;
export const DefaultUseCases: Story = _DefaultUseCases;
export const WithHeader: Story = _WithHeader;
export const WithHeaderActionArea: Story = _WithHeaderActionArea;
export const FrostedGlass: Story = _FrostedGlass;
export const RoundedEdgesComparison: Story = _RoundedEdgesComparison;
export const NoDefaultPadding: Story = _NoDefaultPadding;
export const Visibility: Story = _Visibility;
export const BehaviorContract: Story = _BehaviorContract;
export const Backgrounds: Story = _Backgrounds;
export const GradientRcBreaks: Story = _GradientRcBreaks;

const sb = SbDecorator({
  title: 'Vanguard/PageSection',
  component: PageSection,
  opts: {
    customStore: baseStore,
    description: description,
  },
});

const meta: Meta<typeof PageSection> = {
  ...sb,
  decorators: [
    ...(sb.decorators ?? []),
    (StoryFn) => (
      <div style={{ backgroundColor: '#eef1f4', padding: 40, minHeight: '100vh' }}>
        <StoryFn />
      </div>
    ),
  ],
  parameters: {
    ...(sb.parameters ?? {}),
    layout: 'padded',
    // if you want to be explicit, also preserve docs config:
    docs: {
      ...((sb.parameters as any)?.docs ?? {}),
    },
  },

};

export default meta;