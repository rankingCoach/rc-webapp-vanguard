import { Icon, IconProps, IconSize } from "@vanguard/Icon/Icon";
import { IconNames, IconNamesArr } from "@vanguard/Icon/IconNames";
import React from "react";
import { classNames } from "../../helpers/classNames";
import { Text } from "@vanguard/Text/Text";
import {
  alignItemsCenter,
  dFlex,
  dFlexColumn,
  flexWrap,
  gap1,
  justifyContentCenter,
  mb2,
  mt2,
  p1,
} from "@globalStyles";
import description from "./Icon.description.md?raw";

export default {
  title: "Icon/IconShowcase",
  component: Icon,
  parameters: {
    docs: {
      description: {
        component: description,
      },
    },
  },
};

const IconStory = (props: IconProps) => {
  delete props.style;
  return (
    <div className={classNames(dFlex, flexWrap, alignItemsCenter)}>
      {[...IconNamesArr].sort().map((icnName) => {
        return (
          <React.Fragment key={icnName}>
            <div className={classNames(dFlexColumn, mb2, p1)}>
              <Text>{icnName}</Text>
              <div
                style={{ border: "1px dashed black", minWidth: 120 }}
                className={classNames(dFlex, alignItemsCenter, justifyContentCenter, gap1, p1)}
              >
                <div className={mt2}>
                  <Icon {...props} type={IconSize.small} color={props.color}>
                    {icnName}
                  </Icon>
                </div>
                <div className={mt2}>
                  <Icon {...props} type={IconSize.large} color={props.color}>
                    {icnName}
                  </Icon>
                </div>
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export const IconsDefault = (props: IconProps) => {
  return IconStory(props);
};

export const IconsColor = (props: IconProps) => {
  props.color = "--e500";
  return IconStory(props);
};

export const IconsHoverColor = (props: IconProps) => {
  props.hoverColor = "--e500";
  return IconStory(props);
};

export const IconsCircled = (props: IconProps) => {
  props.hasCircle = true;
  return IconStory(props);
};

export const IconsSpin = (props: IconProps) => {
  props.spin = true;
  return IconStory(props);
};

export const IconsFill = (props: IconProps) => {
  props.hasCircle = true;
  props.fillColor = "--p500";
  props.color = "--n000";

  return IconStory(props);
};