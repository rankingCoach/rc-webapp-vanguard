import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { Notification, NotificationProps } from "@vanguard/Notification/Notification";

export default {
  ...SbDecorator({
  title: "Vanguard/Notification",
  component: Notification,
}),
};

export const SmallLoaderStory = (props: NotificationProps) => {
  return (
    <div>
      <Notification {...props}>ImplementME</Notification>
    </div>
  );
};
