import React from 'react';

import { Skeleton, SkeletonTypes } from '../Skeleton';
import { Story } from './_Skeleton.default';

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: 280 }}>
      <Skeleton type={SkeletonTypes.circle} width={48} height={48} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  ),
};
