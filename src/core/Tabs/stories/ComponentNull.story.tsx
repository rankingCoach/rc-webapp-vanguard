import React, { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Story, TabsHarness } from './_Tabs.default';

const LazyHarness = () => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setLoaded(true)}>
        Load
      </button>
      <TabsHarness
        initialValue="a"
        tabs={[
          { label: 'A', value: 'a', component: loaded ? <p>Loaded</p> : null },
          { label: 'B', value: 'b', component: <p>Other</p> },
        ]}
      />
    </div>
  );
};

export const ComponentNull: Story = {
  render: () => <LazyHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('tab')).toHaveLength(2);
    await expect(canvas.queryByText('Loaded')).not.toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'Load' }));

    await expect(canvas.getByText('Loaded')).toBeVisible();
  },
};
