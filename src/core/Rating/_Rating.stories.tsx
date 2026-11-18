
import { Rating, RatingProps } from "./Rating";
import React from "react";
import {SbDecorator} from "@test-utils/get-storybook-decorator";


export default {
  ...SbDecorator({
  title: "Vanguard/Rating",
  component: Rating,
}),
};

export const RatingStory = (props:RatingProps) => {
  // props.type = "stars";
  // props.value = 4.0;
  // props.color = "--p800";
  // props.valueAlign = "left";
  // props.valueColor = "--fn-bg";
  return (
    <div >
        <Rating {...props} />
    </div>
  );
};

