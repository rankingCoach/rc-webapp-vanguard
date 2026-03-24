## PageSection Component

A core layout component that provides a **standardized page and section wrapper** across the application.  
It enforces **consistent padding, background treatment, and border-radius behavior**, and defines a unified header layout pattern.

`PageSection` is a **mandatory design-system primitive** and should be used for all page-level and section-level layout.

---

### Usage

Import and use the component to wrap full pages or individual sections:

```tsx
import {
  PageSection,
  PageSectionBackground,
  PageSectionRoundedEdges,
} from '@vanguard/PageSection/PageSection';

function MyPage() {
  return (
    <>
      <PageSection
        title="Social"
        headerType={HeaderTypes.pageHeader}
        description="Create and manage your posts across social media platforms."
        roundedEdges={PageSectionRoundedEdges.top}
      >
        <SocialOverview />
      </PageSection>

      <PageSection
        background={PageSectionBackground.frostedGlass}
        title="Upcoming events"
        roundedEdges={PageSectionRoundedEdges.bottom}
      >
        <EventsList />
      </PageSection>
    </>
  );
}
```

### Props

- `title?: string`  
  Section title. Required to render the header title.

- `description?: string`  
- Optional description shown below the `title`.
  **Cannot be used without `title`.**

- `headerType?: HeaderTypes`  
  Header style. Defaults to `HeaderTypes.sectionHeader`.

- `headerActionArea?: ReactNode`  
  Inline action area aligned with the title (for CTAs, filters, or links).  
  Renders even when no title is provided.

- `background?: PageSectionBackground`  
  Background variant of the section.  
  Possible values:
    - `functionalBg`
    - `frostedGlass`
    - `transparent`
    - `gradientPrimaryMesh`
    - `gradientBgVarTop`
    - `gradientBgVarBottom`

- `roundedEdges?: PageSectionRoundedEdges`  
  Controls border radius when stacking sections.  
  Possible values:
    - `top`
    - `bottom`
    - `both`

- `noDefaultPadding?: boolean`  
  Disables the default section padding.  
  Intended for advanced use cases where the content manages its own spacing.

- `className?: string`  
  Additional CSS class applied to the root container.

- `testId?: string`  
  Test identifier applied to the root element.

- `innerRef?: Ref`  
  Ref forwarded to the underlying DOM element.

- `children?: ReactNode`  
  Section content.

- `isVisible?: boolean`  
  Controls whether the section is rendered.
  When false, the component returns null. Defaults to true.

- `replacements?: TextReplacements`  
  Text replacements applied to `title` and `description` (passed to the underlying `Header` / `Text`).  
  **Cannot be used without `title`.**

### Common patterns

#### Full page wrapper
Use PageSection to wrap the main content of a page:

```tsx
<PageSection title="Connections" headerType={HeaderTypes.pageHeader} roundedEdges={PageSectionRoundedEdges.both}>
  <ConnectionsList/>
</PageSection>
```

#### Sectioned page layout
Use multiple PageSections to divide a page into logical sections:

```tsx
<PageSection title="Posts">
  <PostsOverview />
</PageSection>

<PageSection title="Events">
  <EventsOverview />
</PageSection>
```

#### Mixed backgrounds
Use different background variants to visually separate sections:

```tsx
<PageSection title="Social" headerType={HeaderTypes.pageHeader} roundedEdges={PageSectionRoundedEdges.top}>
  <SocialOverview/>
</PageSection>

<PageSection
  background={PageSectionBackground.frostedGlass}
  title="Upcoming events"
  roundedEdges={PageSectionRoundedEdges.bottom}
>
  <EventsList/>
</PageSection>
```

#### Header-only section
PageSection can be used without children to introduce a new section:

```tsx
<PageSection
  title="Social"
  description="Manage your posts."
  headerType={HeaderTypes.pageHeader}
  roundedEdges={PageSectionRoundedEdges.top}
/>

<PageSection background={PageSectionBackground.frostedGlass} roundedEdges={PageSectionRoundedEdges.bottom}>
  <SocialStats/>
</PageSection>
```

### When to disable padding
Use noDefaultPadding only when the section content manages its own spacing, for example:
- upsell / promo blocks
- full-bleed charts
- custom-designed banners

````tsx
<PageSection noDefaultPadding>
  <UpsellBanner />
</PageSection>
````

### Header rules (important)
- Header renders only if title or headerActionArea exists
- description is ignored without title
- headerActionArea works with or without a title

### Design intent
PageSection is a layout contract, not a convenience wrapper. It exists to:
- enforce spacing and layout consistency
- prevent ad-hoc styling
- simplify page composition
- provide predictable structure across the app

If a layout requirement cannot be fulfilled using PageSection, the correct approach is to extend or evolve the component, not bypass it.