# VideoPlayer

Video player component with playback controls, captions and service hooks.

- Kind: component
- Import: `import { VideoPlayer } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/VideoPlayer/VideoPlayer.tsx`
- Keywords: video, player, playback, captions, controls, media

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `onReady` | `(player: videojs.Player) => void` | no |  |
| `opts` | `{ src: string; fallbackSrc?: string; type?: string; tracks?: { kind: "subtitles" \| …` | yes |  |

## Examples

From `src/core/VideoPlayer/stories/Default.story.tsx`:

```tsx
import React from 'react';
import { Story, defaultProps, videoPlayerTest } from './_VideoPlayer.default';
import { VideoPlayer } from '../VideoPlayer';

export const Default: Story = {
  args: {
    ...defaultProps,
  },
  render: (args) => (
    <div
      style={{
        width: 400,
        height: 300,
        border: '1px solid red',
      }}
    >
      <VideoPlayer {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    await videoPlayerTest({
      canvasElement,
      expectedSrc: defaultProps.opts.src,
    });
  },
};
```

From `src/core/VideoPlayer/stories/WithService.story.tsx`:

```tsx
import React from 'react';
import { Story } from './_VideoPlayer.default';
import { videoPlayerService } from '../VideoPlayer.service';
import { mockVideoSrc } from './_VideoPlayer.default';
import { within, expect } from 'storybook/test';
import {Button} from "@vanguard/Button/Button.tsx";

export const WithService: Story = {
  render: () => (
    <div>
      <Button
        onClick={() => {
          videoPlayerService.open(mockVideoSrc);
        }}
        testId={"open-video-modal"}
      >
        Open Video Modal
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    // Test that the button is rendered
    const canvas = within(canvasElement);
    const button = await canvas.findByTestId('open-video-modal');
    await expect(button).toBeInTheDocument();
  },
};
```
