import React from 'react';

import { Skeleton, SkeletonTypes } from '../Skeleton';
import { Story } from './_Skeleton.default';

export const Fill: Story = {
  render: () => (
    <div style={{ width: 240, height: 120 }}>
      <Skeleton type={SkeletonTypes.fill} />
    </div>
  ),
};
