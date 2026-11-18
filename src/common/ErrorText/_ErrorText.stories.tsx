import { ErrorText, ErrorTextProps } from "./ErrorText";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/ErrorText",
  component: ErrorText,
}),
};

export const ErrorTextStory = (props: ErrorTextProps) => {
  return (
    <div>
      <ErrorText {...props}>ImplementME</ErrorText>
    </div>
  );
};
