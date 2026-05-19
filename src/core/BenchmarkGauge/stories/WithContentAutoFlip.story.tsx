import { expect, within } from 'storybook/test';

import { defaultProps, Story, StubCard } from './_BenchmarkGauge.default';

export const WithContentAutoFlip: Story = {
  name: 'Content auto-flip at edge',
  args: {
    ...defaultProps,
    markers: [
      // Near max edge — auto should flip to 'start'
      {
        id: 'near-end',
        value: 90,
        label: 'Near end',
        contentSide: 'auto',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
      // Middle — auto defaults to 'end'
      {
        id: 'mid',
        value: 50,
        label: 'Mid',
        contentSide: 'auto',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nearEndCard = canvas.getByTestId('card-near-end');
    const midCard = canvas.getByTestId('card-mid');
    await expect(nearEndCard).toBeInTheDocument();
    await expect(midCard).toBeInTheDocument();
    expect(nearEndCard.textContent).toContain('Near end');
    expect(nearEndCard.textContent).toContain('90');
    expect(midCard.textContent).toContain('Mid');
    expect(midCard.textContent).toContain('50');
  },
};