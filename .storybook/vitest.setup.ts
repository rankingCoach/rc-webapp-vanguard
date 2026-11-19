import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
const project = setProjectAnnotations([projectAnnotations]);

const suppressedWarnings = [
  "MUI: You have provided an out-of-range value",
  // Add more strings to suppress here
];

const originalConsoleWarn = console.warn;

console.warn = (message, ...args) => {
  if (typeof message === "string" && suppressedWarnings.some((warning) => message.includes(warning))) {
    return;
  }
  originalConsoleWarn(message, ...args);
};
beforeAll(project.beforeAll);
