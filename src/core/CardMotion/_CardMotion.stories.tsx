import { SbDecorator } from '@test-utils/get-storybook-decorator';
import React from 'react';

import { CardMotion } from './CardMotion';
import { CustomMotion as _CustomMotion } from './stories/CustomMotion.story';
import { Default as _Default } from './stories/Default.story';
import { GlowIn as _GlowIn } from './stories/GlowIn.story';
import { GlowPreset as _GlowPreset } from './stories/GlowPreset.story';
import { Hoverable as _Hoverable } from './stories/Hoverable.story';
import { StaggeredGlowGroup as _StaggeredGlowGroup } from './stories/StaggeredGlowGroup.story';
import { VisibilityToggle as _VisibilityToggle } from './stories/VisibilityToggle.story';
import { Story } from './stories/_CardMotion.default';

export const Default: Story = { ..._Default };
export const Hoverable: Story = { ..._Hoverable };
export const GlowIn: Story = { ..._GlowIn };
export const GlowPreset: Story = { ..._GlowPreset };
export const CustomMotion: Story = { ..._CustomMotion };
export const VisibilityToggle: Story = { ..._VisibilityToggle };
export const StaggeredGlowGroup: Story = { ..._StaggeredGlowGroup };

export default {
  ...SbDecorator({
    title: 'Vanguard/CardMotion',
    component: CardMotion,
  }),
};
