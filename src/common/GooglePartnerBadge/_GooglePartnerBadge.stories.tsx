import { GooglePartnerBadge } from "./GooglePartnerBadge";
import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";

export default {
  ...SbDecorator({
  title: "BuildingBlocks/GooglePartnerBadge",
  component: GooglePartnerBadge,
}),
};

export const GooglePartnerBadgeStory = () => {
  return (
    <div>
      <GooglePartnerBadge />
    </div>
  );
};
