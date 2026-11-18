import React from "react";
import { EditableCard, EditableCardProps } from "./EditableCard";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Text } from "@vanguard/Text/Text";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/EditableCard",
  component: EditableCard,
}),
};

export const EditableCardStory = (props: EditableCardProps) => {
  const {
    title = "Business Details",
    children = <Text>This is a text children</Text>,
    editCallback = () => {
      alert("CLICK");
    },
  } = props;

  return (
    <div style={{ width: "800px" }}>
      <EditableCard {...props} title={title} editCallback={editCallback}>
        {children}
      </EditableCard>
    </div>
  );
};
