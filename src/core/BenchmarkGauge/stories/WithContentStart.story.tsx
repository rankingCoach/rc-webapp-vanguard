import { expect, within } from 'storybook/test';

import { defaultProps, Story, StubCard } from './_BenchmarkGauge.default';

export const WithContentStart: Story = {
  name: 'Content above (start)',
  args: {
    ...defaultProps,
    markers: [
      {
        id: 'alpha',
        value: 40,
        label: 'Alpha',
        contentSide: 'start',
        renderContent: (ctx) => <StubCard ctx={ctx} />,
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card-alpha');
    // Content card is anchored above (start side) the marker pin
    await expect(card).toBeInTheDocument();
    expect(card.textContent).toContain('Alpha');
    expect(card.textContent).toContain('40');
  },
};