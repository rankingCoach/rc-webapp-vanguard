import React, { useEffect, useState } from 'react';

import { Avatar } from '../Avatar';
import { Story, testImageUrl } from './_Avatar.default';

export const WithIconThenImage: Story = {
  render: () => {
    const [image, setImage] = useState<string | undefined>(undefined);

    useEffect(() => {
      const timer = setTimeout(() => {
        setImage(testImageUrl);
      }, 2000);
      return () => clearTimeout(timer);
    }, []);

    return <Avatar icon="user" image={image} size="large" />;
  },
};
