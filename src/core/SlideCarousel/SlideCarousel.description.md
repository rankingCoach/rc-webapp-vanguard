## SlideCarousel Component

A core carousel component for presenting a sequence of slides with optional **navigation arrows**, **pagination bullets**, and **controlled or automatic slide movement**.

`SlideCarousel` is intended for reusable horizontal carousels where the design system needs a consistent interaction model, while still allowing custom arrow and bullet rendering when required by a specific UI.

---

### Usage

Import and use the component with one or more slide children:

```tsx
import { SlideCarousel } from '@vanguard/SlideCarousel';

function ExampleCarousel() {
  return (
    <div style={{ width: 600, height: 250, position: 'relative' }}>
      <SlideCarousel hasArrows hasBullets>
        <PromoCard title="First slide" />
        <PromoCard title="Second slide" />
        <PromoCard title="Third slide" />
      </SlideCarousel>
    </div>
  );
}
```

### Props

- `activeIndex?: number`  
  Controlled active slide index. Defaults to `0`.

- `initialIndex?: number`  
  Initial slide index used when the carousel is first rendered.  
  Defaults to `activeIndex`.

- `ArrowComponent?: ArrowComponentType`  
  Custom arrow renderer.  
  Defaults to the built-in `Arrow` component.

- `arrowStyle?: ArrowStyle`  
  Style configuration forwarded to the arrow component.

- `auto?: number`  
  Auto-play interval in milliseconds.  
  Set to `0` to disable automatic slide changes. Defaults to `0`.

- `BulletComponent?: BulletComponentType`  
  Custom bullet renderer for each pagination item.  
  Defaults to the built-in `Bullet` component.

- `BulletsComponent?: BulletsComponentType`  
  Custom wrapper for the bullet list.  
  Defaults to the built-in `Bullets` component.

- `bulletStyle?: BulletStyle`  
  Style configuration forwarded to each bullet component.

- `children?: React.ReactNode[]`  
  Slides rendered inside the carousel.

- `hasArrows?: boolean`  
  Enables previous / next arrows. Defaults to `false`.

- `hasBullets?: boolean`  
  Enables pagination bullets. Defaults to `false`.

- `onSlideChange?: (slide: number) => void`  
  Callback fired whenever the active slide changes.

- `setSlideCustom?: (slide: number) => number`  
  Optional custom slide-index mapping logic.

- `slidesAtOnce?: number`  
  Number of slides visible at the same time. Defaults to `1`.

- `slidesToSlide?: number`  
  Number of slides advanced per navigation action. Defaults to `1`.

- `className?: string`  
  Additional CSS class merged onto the outer container.  
  Useful when the consumer needs to control the carousel size.

- `arrowPlacement?: 'overlay' | 'outside'`  
  Controls where arrows are rendered.  
  Defaults to `overlay`.

- `bulletPlacement?: 'overlayBottom' | 'below'`  
  Controls where bullets are rendered.  
  Defaults to `overlayBottom`.

### Common patterns

#### Basic carousel
Use the component with just content when no navigation UI is needed:

```tsx
<SlideCarousel>
  <CardOne />
  <CardTwo />
  <CardThree />
</SlideCarousel>
```

#### Carousel with arrows and bullets
Enable built-in navigation for the most common product use case:

```tsx
<SlideCarousel hasArrows hasBullets>
  <CardOne />
  <CardTwo />
  <CardThree />
</SlideCarousel>
```

#### Controlled carousel
Use `activeIndex` when some external UI owns the current slide:

```tsx
const [activeIndex, setActiveIndex] = useState(0);

<SlideCarousel
  activeIndex={activeIndex}
  hasArrows
  hasBullets
  onSlideChange={setActiveIndex}
>
  <CardOne />
  <CardTwo />
  <CardThree />
</SlideCarousel>
```

#### Multiple slides at once
Show more than one slide in the viewport for card-based layouts:

```tsx
<SlideCarousel hasArrows hasBullets slidesAtOnce={2}>
  <CardOne />
  <CardTwo />
  <CardThree />
  <CardFour />
</SlideCarousel>
```

#### Outside arrows
Render arrows outside the viewport when overlay controls would cover the content:

```tsx
<SlideCarousel hasArrows arrowPlacement="outside" slidesAtOnce={2}>
  <CardOne />
  <CardTwo />
  <CardThree />
  <CardFour />
</SlideCarousel>
```

#### Bullets below the carousel
Move pagination below the carousel when overlay bullets would interfere with the slide content:

```tsx
<SlideCarousel hasBullets bulletPlacement="below">
  <CardOne />
  <CardTwo />
  <CardThree />
</SlideCarousel>
```

#### Auto-play carousel
Use `auto` to advance slides automatically:

```tsx
<SlideCarousel hasBullets auto={1000}>
  <CardOne />
  <CardTwo />
  <CardThree />
</SlideCarousel>
```

#### Custom arrows or bullets
Replace the default navigation UI when a feature requires a specialized visual treatment:

```tsx
<SlideCarousel
  hasArrows
  hasBullets
  ArrowComponent={CustomArrow}
  BulletComponent={CustomBullet}
>
  <CardOne />
  <CardTwo />
  <CardThree />
</SlideCarousel>
```

### Sizing rules (important)

- The carousel does not define a product-specific height for you
- The consumer should provide width and, when needed, height through the surrounding layout or `className`
- Overlay arrows and overlay bullets render on top of the slide area
- Outside arrows and below bullets are better choices when content should remain fully unobstructed

### Behavior notes

- Bullet count is based on the number of reachable slide positions, not simply the number of children
- `onSlideChange` is called for user-driven and programmatic slide updates
- `activeIndex` enables controlled usage, but the component also works without external state
- Custom `ArrowComponent`, `BulletComponent`, and `BulletsComponent` own their final visual presentation

### Design intent

SlideCarousel is a reusable interaction primitive, not a one-off gallery wrapper. It exists to:
- standardize carousel movement and navigation behavior
- support both simple and advanced slide layouts
- allow controlled integration with external state
- keep customization at the rendering boundary instead of duplicating carousel logic

If a product needs different controls or presentation, the preferred approach is to compose `SlideCarousel` with custom arrow or bullet components rather than rebuilding carousel behavior from scratch.
