# useLottie

Hook that provides Lottie animation controls and lifecycle helpers for animated components.

- Kind: hook
- Import: `import { useLottie } from '@rankingcoach/vanguard';`
- WordPress bundle: no
- Source: `src/core/LottieAnimationLoader/hooks/use-lottie.tsx`
- Keywords: lottie, hook, animation, controls, play, pause, interactivity

## Parameters

`LottieOptions`


| Prop | Type | Required | Description |
|---|---|---|---|
| `animationData` | `unknown` | yes |  |
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
