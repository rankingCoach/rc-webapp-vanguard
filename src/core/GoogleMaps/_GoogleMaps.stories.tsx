import React from "react";
import { SbDecorator } from "@test-utils/get-storybook-decorator";
import { GoogleMaps } from "./GoogleMaps";
import { Story } from "./stories/_GoogleMaps.default";
import { Default as _Default } from "./stories/Default.story";
import { BlackWhite as _BlackWhite } from "./stories/BlackWhite.story";
import { BlackWhiteNoPoi as _BlackWhiteNoPoi } from "./stories/BlackWhiteNoPoi.story";
import { Coloured as _Coloured } from "./stories/Coloured.story";
import { WithCustomProps as _WithCustomProps } from "./stories/WithCustomProps.story";
import { WithSingleMarker as _WithSingleMarker } from "./stories/WithSingleMarker.story";
import { WithMultipleMarkers as _WithMultipleMarkers } from "./stories/WithMultipleMarkers.story";
import { WithMarkerInfoBox as _WithMarkerInfoBox } from "./stories/WithMarkerInfoBox.story";
import { WithMapIdAndMarkers as _WithMapIdAndMarkers } from "./stories/WithMapIdAndMarkers.story";
import { WithAdvancedMarker as _WithAdvancedMarker } from "./stories/WithAdvancedMarker.story";
import { WithAdvancedMarkerCustomIcon as _WithAdvancedMarkerCustomIcon } from "./stories/WithAdvancedMarkerCustomIcon.story";
import { WithAdvancedMarkerHTML as _WithAdvancedMarkerHTML } from "./stories/WithAdvancedMarkerHTML.story";
import { WithMultipleAdvancedMarkers as _WithMultipleAdvancedMarkers } from "./stories/WithMultipleAdvancedMarkers.story";

export const Default: Story = { ..._Default };
export const BlackWhite: Story = { ..._BlackWhite };
export const BlackWhiteNoPoi: Story = { ..._BlackWhiteNoPoi };
export const Coloured: Story = { ..._Coloured };
export const WithCustomProps: Story = { ..._WithCustomProps };
export const WithSingleMarker: Story = { ..._WithSingleMarker };
export const WithMultipleMarkers: Story = { ..._WithMultipleMarkers };
export const WithMarkerInfoBox: Story = { ..._WithMarkerInfoBox };
export const WithMapIdAndMarkers: Story = { ..._WithMapIdAndMarkers };
export const WithAdvancedMarker: Story = { ..._WithAdvancedMarker };
export const WithAdvancedMarkerCustomIcon: Story = { ..._WithAdvancedMarkerCustomIcon };
export const WithAdvancedMarkerHTML: Story = { ..._WithAdvancedMarkerHTML };
export const WithMultipleAdvancedMarkers: Story = { ..._WithMultipleAdvancedMarkers };

export default {
  ...SbDecorator({
    title: "Vanguard/GoogleMaps",
    component: GoogleMaps,
  }),
  decorators: [
    (Story: any) => (
        <div style={{ height: '400px' }}>
          <Story />
        </div>
    ),
  ],
  argTypes: {
    isJsApiLoaded: {
      control: { type: 'boolean' },
      description: 'Whether the Google Maps API is loaded (for external loading).',
    },
  },
  disableControls: ['apiKey'],
};
