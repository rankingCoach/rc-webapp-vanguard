import { expect, within } from 'storybook/test';

import { Icon, IconNames, IconSize } from '@vanguard/Icon';
import { FontWeights, Text, TextTypes } from '@vanguard/Text';

import { getMarkers, pinColor, Story } from './_BenchmarkGauge.default';
import { BenchmarkGaugeMarkerType } from '@vanguard/BenchmarkGauge/types';

const AuditLegendContent = (props: { label: string; value: number; rankIndex: number; rankCount: number }) => {
  const { label, value, rankIndex, rankCount } = props;
  return (
    <div
      style={{
        padding: '12px 16px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <div style={{ display: 'flex', gap: 8 }}>
        <Icon hasCircle={true} fillColor={pinColor(rankIndex, rankCount)} color={'--n000'}>
          {label === 'You' ? IconNames.gmb : IconNames.business}
        </Icon>
        <Text type={TextTypes.textHelp} color={'--fn-fg-light'}>
          {label}
        </Text>
      </div>
      <Text type={TextTypes.textIntro} fontWeight={FontWeights.bold}>
        {value}
      </Text>
    </div>
  );
};

const auditMarkers: BenchmarkGaugeMarkerType[] = [
  {
    id: 'you',
    value: 35,
    label: 'You',
    legendBackgroundColor: 'var(--e100)',
    renderHighlightedContent: () => (
      <Icon color={'--n000'} type={IconSize.large}>
        {IconNames.gmb}
      </Icon>
    ),
    renderLegend: ({ marker, rankCount, rankIndex }) => (
      <AuditLegendContent label={marker.label} value={marker.value} rankCount={rankCount} rankIndex={rankIndex} />
    ),
  },
  {
    id: 'competitors',
    value: 60,
    label: 'Competitors',
    legendBackgroundColor: 'var(--s100)',
    renderHighlightedContent: () => (
      <Icon color={'--n000'} type={IconSize.large}>
        {IconNames.business}
      </Icon>
    ),
    renderLegend: ({ marker, rankCount, rankIndex }) => (
      <AuditLegendContent label={marker.label} value={marker.value} rankCount={rankCount} rankIndex={rankIndex} />
    ),
  },
];

export const AuditSimulation: Story = {
  name: 'Audit (0–100, 2 markers)',
  args: {
    min: 0,
    max: 100,
    markers: auditMarkers,
    progressMarkerId: 'competitors',
    legendInteraction: {
      dimsMarkers: true,
    },
    growHighlightedMarker: true,
    colorByRank: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Legend labels for both markers render
    await expect(canvas.getByText('You')).toBeInTheDocument();
    await expect(canvas.getByText('Competitors')).toBeInTheDocument();
    // Marker values appear in the legend content
    expect(canvasElement.textContent).toContain('35');
    expect(canvasElement.textContent).toContain('60');
    // Both markers are on the track
    await expect(getMarkers(canvasElement)).toHaveLength(2);
  },
};