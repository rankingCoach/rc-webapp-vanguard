import { PageSectionLoading, PageSectionLoadingProps } from "./PageSectionLoading";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/PageSectionLoading",
  component: PageSectionLoading,
  extra: {
    argTypes: {
      ...disableControls([""]),
      description: {
        defaultValue:
          "They will show your visibility score, top-ranking keywords, and how your business performs compared to competitors.",
      },
      title: {
        defaultValue: "Your insights will arrive soon",
      },
    },
  },
}),
};

export const PageSectionLoadingStory = (props: PageSectionLoadingProps) => {
  return <PageSectionLoading {...props} />;
};
