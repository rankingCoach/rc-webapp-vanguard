# LottieAnimationLoader

Loader that handles Lottie animations and exposes hooks for interactivity and events.

- Kind: component
- Import: `import { LottieAnimationLoader } from '@rankingcoach/vanguard';`
- WordPress bundle: yes
- Source: `src/core/LottieAnimationLoader/LottieAnimationLoader.tsx`
- Keywords: lottie, animation, loader, interactivity, animation-loader

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `interactivity` | `Omit<InteractivityProps, "lottieObj">` | no |  |
| `lottieRef` | `LottieRef` | no |  |
| `onComplete` | `React.AnimationEventHandler` | no |  |
| `onConfigReady` | `React.AnimationEventHandler` | no |  |
| `onDataFailed` | `React.AnimationEventHandler` | no |  |
| `onDataReady` | `React.AnimationEventHandler` | no |  |
| `onDestroy` | `React.AnimationEventHandler` | no |  |
| `onDOMLoaded` | `React.AnimationEventHandler` | no |  |
| `onEnterFrame` | `React.AnimationEventHandler` | no |  |
| `onLoadedImages` | `React.AnimationEventHandler` | no |  |
| `onLoopComplete` | `React.AnimationEventHandler` | no |  |
| `onSegmentStart` | `React.AnimationEventHandler` | no |  |
| `placeholder` | `React.ReactNode` | no |  |
| `src` | `LottieAnimationType` | yes |  |
| `translations` | `string \| Record<string, string>` | no |  |

Also accepts: 8 other, 378 React DOM attributes (not listed).
