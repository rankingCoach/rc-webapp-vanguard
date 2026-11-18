# LottieBase

Base component wrapper for rendering a single Lottie animation instance.

- Kind: component
- Import: `import { LottieBase } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/LottieAnimationLoader/LottieBase/LottieBase.tsx`
- Keywords: lottie, animation, base, svg, json, animation-player

## DOM contract

No slots yet.

## Props

| Prop | Type | Required | Description |
|---|---|---|---|
| `animationData` | `unknown` | yes |  |
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

Also accepts: 8 other, 380 React DOM attributes (not listed).
