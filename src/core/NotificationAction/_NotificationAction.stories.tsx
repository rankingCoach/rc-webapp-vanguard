import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { NotificationAction, NotificationActionProps } from "@vanguard/NotificationAction/NotificationAction";

export default {
  ...SbDecorator({
  title: "Vanguard/NotificationAction",
  component: NotificationAction,
}),
};

export const SmallLoaderStory = (props: NotificationActionProps) => {
  return (
    <div>
      <NotificationAction {...props}>ImplementME</NotificationAction>
    </div>
  );
};
