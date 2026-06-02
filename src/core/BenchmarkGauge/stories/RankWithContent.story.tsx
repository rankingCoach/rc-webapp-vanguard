import { expect, within } from 'storybook/test';

import { defaultProps, getMarkers, pinColor, RankedPin, Story } from './_BenchmarkGauge.default';

function rankLabel(rankIndex: number, rankCount: number): string {
  if (rankIndex === 0) return 'Lowest';
  if (rankIndex === rankCount - 1) return 'Highest';
  return 'Middle';
}

const RankedContent: Story['args']['markers'][number]['renderContent'] = ({ marker, rankIndex, rankCount }) => (
  <div
    style={{
      background: '#fff',
      border: `2px solid ${pinColor(rankIndex, rankCount)}`,
      borderRadius: 8,
      padding: '6px 12px',
      minWidth: 80,
      textAlign: 'center',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontSize: 12,
    }}
  >
    <div style={{ fontWeight: 700 }}>{marker.label}</div>
    <div style={{ color: '#6b7280', marginTop: 2 }}>
      {rankLabel(rankIndex, rankCount)} · {marker.value}
    </div>
  </div>
);

export const RankWithContent: Story = {
  name: 'Rank — with anchored content box per marker',
  args: {
    ...defaultProps,
    markers: [
      { id: 'a', value: 20, label: 'Marker A', renderPin: RankedPin, renderContent: RankedContent },
      { id: 'b', value: 50, label: 'Marker B', renderPin: RankedPin, renderContent: RankedContent, contentSide: 'start' },
      { id: 'c', value: 80, label: 'Marker C', renderPin: RankedPin, renderContent: RankedContent },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Each marker's content card renders its label
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByText('Marker B')).toBeInTheDocument();
    await expect(canvas.getByText('Marker C')).toBeInTheDocument();
    // Rank labels are computed from sorted values
    expect(canvasElement.textContent).toContain('Lowest');
    expect(canvasElement.textContent).toContain('Middle');
    expect(canvasElement.textContent).toContain('Highest');
    // All three markers are positioned on the track
    await expect(getMarkers(canvasElement)).toHaveLength(3);
  },
};