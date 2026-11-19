import { UpsellingTrigger, type UpsellingTriggerProps } from "./UpsellingTrigger";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/UpsellingTrigger",
  component: UpsellingTrigger,
}),
};

export const UpsellingTriggerStory = (props: UpsellingTriggerProps) => {
  const {
    productName = "rankingcoach",
    onclick = () => {
      alert("click");
    },
  } = props;
  return (
    <div>
      <UpsellingTrigger {...props} productName={productName} onclick={onclick} />
    </div>
  );
};
