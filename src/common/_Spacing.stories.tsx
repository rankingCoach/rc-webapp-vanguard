import * as React from "react";
import * as globals from "@globalStyles";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { classNames } from "@helpers/classNames";
import { alignItemsCenter, dFlexColumn, justifyContentCenter, px9, vw100 } from "@globalStyles";

export default {
  ...SbDecorator({
  title: "Vanguard/Spacing",
  component: null,
}),
};

export const Primary = () => {
  const keys = Object.keys(globals);
  return (
    <div className={classNames(justifyContentCenter, dFlexColumn, alignItemsCenter, px9, vw100)}>
      {keys.map((key) => {
        return (
          <div style={{ border: "1px solid var(--p100)" }} className={globals[key]}>
            {key}
          </div>
        );
      })}
    </div>
  );
};
