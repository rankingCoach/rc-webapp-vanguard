
import { TogglerWithText, TogglerWithTextProps } from "./TogglerWithText";
import React from "react";
import { disableControls, SbDecorator } from "@test-utils/get-storybook-decorator";
import { classNames } from "@helpers/classNames";
import { alignItemsCenter, dFlex, gap1 } from "@globalStyles";
import { FontWeights, Text, TextTypes } from "@vanguard/Text/Text";


export default SbDecorator({
  title: "Vanguard/TogglerWithText",
  component: TogglerWithText,
  extra: {
    argTypes: {
      ...disableControls([
        "onChange",
        "value",
      ]),
      size: {
        defaultValue: "big",
      },
    },
  },
});

export const TogglerWithTextStory = (props: TogglerWithTextProps) => {
  return (
    <div >
      <TogglerWithText {...props} left={"Annual"} right={"Monthly"}></TogglerWithText>
    </div>
  );
};

export const TogglerWithNode = (props: TogglerWithTextProps) => {
  const Left = () => {
    return (<div className={classNames(dFlex, alignItemsCenter, gap1)}>
      <Text>Annual</Text>
      <Text color={"--a3500"} type={TextTypes.textHelp} fontWeight={FontWeights.bold}>Save 33%</Text>
    </div>);
  }

  return (
    <div >
      <TogglerWithText {...props} left={{ component: Left(), value: "Annual" }} right={"Monthly"} togglerState={"left"}></TogglerWithText>
    </div>
  );
};

