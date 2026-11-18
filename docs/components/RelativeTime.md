# RelativeTime

Renders a localized, human-friendly relative time label (e.g., '3 minutes ago').

- Kind: component
- Import: `import { RelativeTime } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/RelativeTime/RelativeTime.tsx`
- Keywords: time, relative, ago, date, format, localization

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `allowNewLines` | `boolean` | no |  |
| `animateWords` | `FadeUpTextAnimationProps` | no |  |
| `balanced` | `boolean` | no |  |
| `capitalize` | `boolean` | no |  |
| `children` | `string \| Date` | yes |  |
| `className` | `string` | no |  |
| `color` | `string` | no |  |
| `context` | `"other" \| "one"` | no |  |
| `disabled` | `boolean` | no |  |
| `display` | `"inline" \| "block"` | no |  |
| `ellipsis` | `boolean` | no |  |
| `fallbackText` | `string` | no |  |
| `fontSize` | `number` | no |  |
| `fontWeight` | `FontWeights` | no |  |
| `highlightCaseInsensitive` | `boolean` | no |  |
| `highlightColor` | `string` | no |  |
| `highlightMode` | `"bold" \| "background" \| "text"` | no |  |
| `highlightWords` | `string[]` | no |  |
| `isBlurred` | `boolean` | no |  |
| `links` | `LinkReplacements` | no |  |
| `maxChar` | `number` | no |  |
| `maxLines` | `number` | no |  |
| `maxWidth` | `number` | no |  |
| `seeMore` | `boolean \| SeeMoreConfig` | no |  |
| `testId` | `string` | no |  |
| `textAlign` | `"start" \| "end" \| "center" \| "left" \| "right" \| "justify" \| "match-parent"` | no |  |
| `textTight` | `boolean` | no |  |
| `textWrap` | `"pre" \| "wrap" \| "no-wrap" \| "wrap-break-word" \| "pre-wrap"` | no |  |
| `translate` | `boolean` | no |  |
| `type` | `TextTypes` | no |  |
| `uppercase` | `boolean` | no |  |
| `wordBreak` | `TextWordBreak` | no |  |

## Examples

From `src/core/RelativeTime/stories/Default.story.tsx`:

```tsx
import React from 'react';
import { RelativeTime } from '../RelativeTime';
import { Story, testDates } from './_RelativeTime.default';

export const Default: Story = {
  args: {
    children: testDates.past.minutes.toISOString(),
  },
};
```

From `src/core/RelativeTime/stories/Interactive.story.tsx`:

```tsx
import React, { useState } from 'react';
import { RelativeTime } from '../RelativeTime';
import { DateTimePicker } from '@vanguard/DateTimePicker/DateTimePicker';
import { Text, TextTypes } from '@vanguard/Text/Text';
import { Story } from './_RelativeTime.default';

export const Interactive: Story = {
  render: () => {
    const [dateTime, setDateTime] = useState<Date | undefined>();

    const handleChange = (date?: number, time?: string, momentDateTime?: any) => {
      if (momentDateTime) {
        setDateTime(momentDateTime.toDate());
      } else {
        setDateTime(undefined);
      }
    };

    return (
      <div style={{ padding: 20, maxWidth: 400, display: 'flex', gap: 10, flexDirection: 'column' }}>
        <Text type={TextTypes.heading3}>RelativeTime Interactive Demo</Text>
        <DateTimePicker locale="en-US" onChange={handleChange} />
        <Text>
          <strong>Selected DateTime:</strong> {dateTime ? dateTime.toISOString() : 'None'}
        </Text>
        {dateTime && (
          <div>
            <strong>Relative Time:</strong> <RelativeTime>{dateTime}</RelativeTime>
          </div>
        )}
      </div>
    );
  },
};
```
