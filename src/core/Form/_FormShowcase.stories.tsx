import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { showcaseStore } from "./stories/bootstrap/showcase.test.slice";
import { Form } from "@vanguard/Form/Form";
import { Story } from "./stories/_FormShowcase.default";
import {
  AllElementsShowcase as _AllElementsShowcase,
  StoreFirstApiLoadReflectsInUi as _StoreFirstApiLoadReflectsInUi,
  UiFirstChangesReflectInStore as _UiFirstChangesReflectInStore,
} from "./stories/AllElementsShowcase.story";

export const AllElementsShowcase: Story = { ..._AllElementsShowcase };
export const StoreFirstApiLoadReflectsInUi: Story = { ..._StoreFirstApiLoadReflectsInUi };
export const UiFirstChangesReflectInStore: Story = { ..._UiFirstChangesReflectInStore };

const meta = SbDecorator({
  title: "Vanguard/Form/Showcase",
  component: Form,
  opts: {
    customStore: showcaseStore,
  },
});

export default {
  ...meta,
  decorators: [
    (Story: any) => {
      showcaseStore.dispatch({ type: "showcase/resetState" });
      return <Story />;
    },
    ...(meta.decorators ?? []),
  ],
};
