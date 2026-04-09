import React from 'react';
import { expect, within } from 'storybook/test';

import { BenchmarkGaugeMarkerType } from '../types';
import { getMarkers, Story } from './_BenchmarkGauge.default';
import { pinColor } from '@vanguard/BenchmarkGauge/stories/RankBasedMarkers.stories.tsx';
import { FontWeights, Text, TextTypes } from '@vanguard/Text';
import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import.ts';
import { Icon, IconNames, IconSize } from '@vanguard/Icon';

const getScoreRankImage = (props: { rankIndex: number; rankCount: number }) => {
  const { rankIndex, rankCount } = props;
  const rankLabel = (): string => {
    if (rankIndex === 0) return 'position_low';
    if (rankIndex === rankCount - 1) return 'position_high';
    return 'position_mid';
  };
  const { SvgIcon } = useDynamicImport(`reputation/${rankLabel()}.svg`);
  return <img src={SvgIcon} width={32} height={32} alt={''} style={{alignSelf: 'center'}}/>;
};
const ScoreLegendContent = (props: { label: string; value: number; rankIndex: number; rankCount: number }) => {
  const { label, value, rankIndex, rankCount } = props;
  const rankLabel = (): string => {
    if (rankIndex === 0) return 'position_low';
    if (rankIndex === rankCount - 1) return 'position_high';
    return 'position_mid';
  };
  const { SvgIcon } = useDynamicImport(`reputation/${rankLabel()}.svg`);

  return (
    <div
      style={{
        padding: '12px 16px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <img src={SvgIcon} width={24} height={24} alt={''} />
      <div>
        <Text type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
          {label}
        </Text>
        <div style={{ display: 'flex', gap: 4 }}>
          <Text type={TextTypes.textHelp} color={'--fn-fg-light'}>
            {value}
          </Text>
          <Text type={TextTypes.textHelp} color={'--fn-fg-light'}>
            {'points'}
          </Text>
        </div>
      </div>
    </div>
  );
};

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

// ─── Score comparison simulation (0–10 000 scale, 3 markers) ─────────────────
const scoreMarkers: BenchmarkGaugeMarkerType[] = [
  {
    id: 'subject',
    value: 9999,
    label: 'Subject',
    renderHighlightedContent: ({ rankCount, rankIndex }) => getScoreRankImage({ rankIndex, rankCount }),
    renderLegend: ({ marker, rankCount, rankIndex }) => (
      <ScoreLegendContent label={marker.label} value={marker.value} rankCount={rankCount} rankIndex={rankIndex} />
    ),
  },
  {
    id: 'industry',
    value: 5400,
    label: 'Industry',
    renderHighlightedContent: ({ rankCount, rankIndex }) => getScoreRankImage({ rankIndex, rankCount }),
    renderLegend: ({ marker, rankCount, rankIndex }) => (
      <ScoreLegendContent label={marker.label} value={marker.value} rankCount={rankCount} rankIndex={rankIndex} />
    ),
  },
  {
    id: 'best',
    value: 9000,
    label: 'Best',
    renderHighlightedContent: ({ rankCount, rankIndex }) => getScoreRankImage({ rankIndex, rankCount }),
    renderLegend: ({ marker, rankCount, rankIndex }) => (
      <ScoreLegendContent label={marker.label} value={marker.value} rankCount={rankCount} rankIndex={rankIndex} />
    ),
  },
];

export const ScoreSimulation: Story = {
  name: 'Score (0–10 000, 3 markers)',
  args: {
    min: 0,
    max: 10000,
    markers: scoreMarkers,
    showLabels: true,
    progressMarkerId: 'subject',
    compactLabels: true,
    legendInteraction: {
      dimsMarkers: true,
    },
    colorByRank: true,
    growHighlightedMarker: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Legend labels for all three markers render
    await expect(canvas.getByText('Subject')).toBeInTheDocument();
    await expect(canvas.getByText('Industry')).toBeInTheDocument();
    await expect(canvas.getByText('Best')).toBeInTheDocument();
    // Marker values appear in the legend content
    await expect(canvasElement.textContent).toContain('9999');
    await expect(canvasElement.textContent).toContain('5400');
    await expect(canvasElement.textContent).toContain('9000');
    // 'points' label is rendered once per legend item (3 total)
    await expect(canvasElement.textContent).toContain('points');
    // compactLabels=true + showLabels=true → track labels use compact format
    await expect(canvas.getByText('0')).toBeInTheDocument();
    await expect(canvas.getByText('10K')).toBeInTheDocument();
    // All three markers are on the track
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};

// ─── Audit comparison simulation (0–100 scale, 2 markers) ────────────────────
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

function getListingBand(value: number): { label: string; color: string } {
  if (value <= 0) return { label: 'Bad', color: '#D94141' };
  if (value <= 8) return { label: 'Fair', color: '#F28C45' };
  if (value <= 16) return { label: 'Average', color: '#F2A23A' };
  if (value <= 24) return { label: 'Good', color: '#B7C83B' };
  return { label: 'Excellent', color: '#69B44A' };
}

function ListingPin({ value }: { value: number }) {
  const { label, color } = getListingBand(value);

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        borderRadius: 999,
        background: 'var(--n000)',
        border: `4px solid ${color}`,
        transition: 'transform 0.15s ease',
      }}
    >
      <Text color={color} type={TextTypes.textCaption} fontWeight={FontWeights.medium}>
        {label}
      </Text>
    </div>
  );
}

const listingsMarkers: BenchmarkGaugeMarkerType[] = [
  {
    id: 'own',
    value: 17,
    label: 'Own',
    renderPin: ({ marker }) => <ListingPin value={marker.value} />,
  },
];

export const ListingsSimulation: Story = {
  name: 'Listings',
  args: {
    min: 0,
    max: 38,
    markers: listingsMarkers,
    progressMarkerId: 'own',
    showLabels: true,
    startLabel: 'Bad',
    endLabel: 'Excellent',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Custom string start/end labels render inside the track bar
    await expect(canvas.getByText('Bad')).toBeInTheDocument();
    await expect(canvas.getByText('Excellent')).toBeInTheDocument();
    // ListingPin for value=17 resolves to the "Good" band (16 < 17 ≤ 24)
    await expect(canvas.getByText('Good')).toBeInTheDocument();
    // The single listing marker is on the track
    await expect(getMarkers(canvasElement)).toHaveLength(1);
  },
};
