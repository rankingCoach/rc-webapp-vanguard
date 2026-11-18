
import { SmallLoader, SmallLoaderProps } from "./SmallLoader";
import React from "react";
import {SbDecorator} from "@test-utils/get-storybook-decorator";


export default {
  ...SbDecorator({
  title: "Vanguard/SmallLoader",
  component: SmallLoader,
}),
};

export const SmallLoaderStory = (props:SmallLoaderProps) => {
  return (
    <div >
        <SmallLoader {...props}>ImplementME</SmallLoader>
    </div>
  );
};

