# SocialMediaLink

Link component tailored for social media URLs with preview and iconography.

- Kind: component
- Import: `import { SocialMediaLink } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/SocialMediaLink/SocialMediaLink.tsx`
- Keywords: social, link, twitter, facebook, social-media, preview

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `greyScale` | `boolean` | no |  |
| `network` | `string` | no |  |
| `testId` | `string` | no |  |
| `url` | `string` | no |  |

## Examples

From `src/core/SocialMediaLink/stories/AllGreyScale.story.tsx`:

```tsx
import React from "react";
import { SocialMediaLink } from "../SocialMediaLink";
import { Story } from "./_SocialMediaLink.default";
import { within, expect } from "storybook/test";

export const AllGreyScale: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
      <SocialMediaLink network="facebook" testId={"social-media-link-facebook"} greyScale />
      <SocialMediaLink network="youtube" greyScale />
      <SocialMediaLink network="twitter" greyScale />
      <SocialMediaLink network="pinterest" greyScale />
      <SocialMediaLink network="instagram" greyScale />
      <SocialMediaLink network="linkedin" greyScale />
      <SocialMediaLink network="tiktok" greyScale />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByTestId("social-media-link-facebook");

    await expect(link).toBeInTheDocument();
  },
};
```

From `src/core/SocialMediaLink/stories/AutoDetectNetwork.story.tsx`:

```tsx
import React from "react";
import { SocialMediaLink } from "../SocialMediaLink";
import { Story, testUrls } from "./_SocialMediaLink.default";
import { within, expect } from "storybook/test";

export const AutoDetectNetwork: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
      <SocialMediaLink url={testUrls.facebook} />
      <SocialMediaLink url={testUrls.instagram} />
      <SocialMediaLink url={testUrls.youtube} />
      <SocialMediaLink url={testUrls.linkedin} />
      <SocialMediaLink url={testUrls.pinterest} />
      <SocialMediaLink url={testUrls.tiktok} />
      <SocialMediaLink url={testUrls.twitter} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const links = canvas.getAllByRole("link");

    await expect(links).toHaveLength(7);
    await expect(links[0]).toHaveAttribute("href", testUrls.facebook);
    await expect(links[1]).toHaveAttribute("href", testUrls.instagram);
  },
};
```
