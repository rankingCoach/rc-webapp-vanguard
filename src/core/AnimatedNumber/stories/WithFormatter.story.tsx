import { Story, testValues } from './_AnimatedNumber.default';

export const WithFormatter: Story = {
  args: {
    value: testValues.coverage,
    formatter: (v: number) => `${v}%`,
  },
};
