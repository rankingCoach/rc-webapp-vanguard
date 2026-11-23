import { beforeAll, beforeEach } from "vitest";
import { userEvent } from "vitest/browser";
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

// All story files run in one Playwright page, so the real mouse stays wherever the previous story left it and a
// rest-state read in the next file can see :hover (reproduced: SliderParity → PaginationParity). Before every story,
// rest the real pointer on a fixed 2x2 park near the top-left (left:8px, clear of the per-story 4x4 parks of
// 63de883f): its :hover chain is park → body → html, never story content. Appended once per test document;
// aria-hidden, no role or text, so cleanup and a11y checks ignore it. No catch: a failing hover fails the story.
const POINTER_PARK = "data-vitest-pointer-park";
beforeEach(async () => {
  let park = document.querySelector<HTMLElement>(`[${POINTER_PARK}]`);
  if (!park) {
    park = document.createElement("div");
    park.setAttribute(POINTER_PARK, "");
    park.setAttribute("aria-hidden", "true");
    park.style.cssText = "position:fixed;top:0;left:8px;width:2px;height:2px;z-index:2147483647;";
    document.body.appendChild(park);
  }
  await userEvent.hover(park);
});
