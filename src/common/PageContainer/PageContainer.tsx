import { ComponentContainer, ComponentContainerProps } from '@vanguard/ComponentContainer/ComponentContainer';
import React from 'react';
export const PageContainer = (props: ComponentContainerProps) => {
  // The plan with this component is to add default styling to children components of the type PageSection,
  // like iterate through them and for the last one to set borderRadius={"roundedBottom"}
  // @tbd after release
  return <ComponentContainer data-slot={'page-container'} {...props} />;
};
