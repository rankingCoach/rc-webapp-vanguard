import { Icon, IconNames, IconSize } from '@vanguard/Icon';
import { expect, userEvent, within } from 'storybook/test';

import { defaultProps, PlainLegendContent, Story } from './_BenchmarkGauge.default';

export const LegendWithHighlightedIcons: Story = {
  name: 'Legend — per-marker highlighted content (renderHighlightedContent)',
  args: {
    ...defaultProps,
    growHighlightedMarker: true,
    markers: [
      {
        id: 'a',
        value: 25,
        label: 'Marker A',
        renderHighlightedContent: () => (
          <span data-testid="highlighted-a">
            <Icon color={'--n000'} type={IconSize.large}>{IconNames.business}</Icon>
          </span>
        ),
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
      {
        id: 'b',
        value: 70,
        label: 'Marker B',
        renderHighlightedContent: () => (
          <span data-testid="highlighted-b">
            <Icon color={'--n000'} type={IconSize.large}>{IconNames.save}</Icon>
          </span>
        ),
        renderLegend: ({ marker }) => <PlainLegendContent label={marker.label} value={marker.value} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Highlighted content is always in the DOM (CSS transitions control opacity/scale)
    await expect(canvas.getByTestId('highlighted-a')).toBeInTheDocument();
    await expect(canvas.getByTestId('highlighted-b')).toBeInTheDocument();
    const legendItemA = canvas.getByText('Marker A').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemA);
    await expect(canvas.getByText('Marker A')).toBeInTheDocument();
    await expect(canvas.getByTestId('highlighted-a')).toBeInTheDocument();
    await userEvent.unhover(legendItemA);
    await expect(canvas.getByTestId('highlighted-a')).toBeInTheDocument();
    const legendItemB = canvas.getByText('Marker B').closest('[class]') as HTMLElement;
    await userEvent.hover(legendItemB);
    await expect(canvas.getByTestId('highlighted-b')).toBeInTheDocument();
    await userEvent.unhover(legendItemB);
    await expect(canvas.getByTestId('highlighted-b')).toBeInTheDocument();
  },
};