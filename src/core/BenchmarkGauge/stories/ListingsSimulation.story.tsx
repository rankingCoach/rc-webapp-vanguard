import { expect, within } from 'storybook/test';

import { FontWeights, Text, TextTypes } from '@vanguard/Text';

import { BenchmarkGaugeMarkerType } from '../types';
import { getMarkers, Story } from './_BenchmarkGauge.default';

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