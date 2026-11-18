
import { ActionCardBody, ActionCardBodyProps } from "./ActionCardBody";
import React from "react";
import {SbDecorator} from "@test-utils/get-storybook-decorator";


export default {
  ...SbDecorator({
  title: "Vanguard/ActionCard/ActionCardBody",
  component: ActionCardBody,
}),
};

export const ActionCardBodyStory = (props:ActionCardBodyProps) => {
  return (
    <div >
        <ActionCardBody {...props}>ImplementME</ActionCardBody>
    </div>
  );
};

