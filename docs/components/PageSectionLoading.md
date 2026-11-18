# PageSectionLoading

Skeleton or loading placeholder for a `PageSection` while content is being fetched.

- Kind: component
- Import: `import { PageSectionLoading } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/common/PageSectionLoading/PageSectionLoading.tsx`
- Keywords: loading, skeleton, placeholder, page, section, spinner

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `background` | `PageSectionBackground` | no |  |
| `children` | `React.ReactNode` | no |  |
| `className` | `string` | no |  |
| `description` | `string` | yes |  |
| `headerActionArea` | `React.ReactNode` | no |  |
| `headerType` | `never` | no |  |
| `imgSize` | `"small" \| "medium" \| "large"` | no |  |
| `innerRef` | `PageSectionInnerRef` | no |  |
| `isVisible` | `boolean` | no |  |
| `noDefaultPadding` | `boolean` | no |  |
| `replacements` | `never` | no |  |
| `roundedEdges` | `PageSectionRoundedEdges` | no |  |
| `testId` | `string` | no |  |
| `title` | `string` | yes |  |
| `titleType` | `"text" \| "heading-3" \| "heading-4" \| "text-intro"` | no |  |
