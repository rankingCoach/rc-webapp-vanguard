import { expect, within } from 'storybook/test';

import { FontWeights, Text, TextTypes } from '@vanguard/Text';
import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';

import { BenchmarkGaugeMarkerType } from '../types';
import { getMarkers, Story } from './_BenchmarkGauge.default';

const getScoreRankImage = (props: { rankIndex: number; rankCount: number }) => {
  const { rankIndex, rankCount } = props;
  const rankLabel = (): string => {
    if (rankIndex === 0) return 'position_low';
    if (rankIndex === rankCount - 1) return 'position_high';
    return 'position_mid';
  };
  const { SvgIcon } = useDynamicImport(`reputation/${rankLabel()}.svg`);
  return <img src={SvgIcon} width={32} height={32} alt={''} style={{ alignSelf: 'center' }} />;
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