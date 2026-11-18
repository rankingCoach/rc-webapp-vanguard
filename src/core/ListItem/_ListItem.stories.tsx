import { ListItem, ListItemProps } from "./ListItem";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Text, TextTypes } from "@vanguard/Text/Text";

export default {
  ...SbDecorator({
  title: "@vanguard/ListItem",
  component: ListItem,
}),
};

export const ListItemStory = (props: ListItemProps) => {
  const {
    type = "alphabetical",
    selected = true,
    children = (
      <Text type={TextTypes.textCaption} color={"var(--n500)"}>
        This is the life
      </Text>
    ),
    index = 2,
  } = props;

  return (
    <div>
      <ListItem {...props} selected={selected} type={type} index={index}>
        {children}
      </ListItem>
    </div>
  );
};
