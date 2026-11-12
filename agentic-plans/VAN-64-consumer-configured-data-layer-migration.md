# VAN-64 · Consumer-configured requests: opt in now, built-in requests deprecated

Vanguard calls two endpoints itself, through a bundled SDK whose `apiBase` is hardcoded to `''`. The requests are
relative, so they go to the host page's origin: right on a same-origin production page, a 404 on a dev origin
(`localhost:3000`).

From this change the consumer can make those requests itself, through callbacks and a logger. **Nothing breaks.**
Without them, Vanguard behaves exactly as before. That fallback is deprecated at the TypeScript level (editors show the
usage struck through) and will be removed in the next major version. There is no runtime console warning.

## What is deprecated

| Built-in request (still works, deprecated) | Where it runs | Opt in to replace it |
| --- | --- | --- |
| `POST /app/api/client/ai/text/{locationId}/adjust`, plus the `AIBudgetEnd` / "Oh snap!" `ErrorModal` when it fails | `AIAssistant` without `adjustCallback`; `RichTextEditor` with `useAiAssistant` (always, before this change) | `adjustCallback` on `AIAssistant`, `aiAdjustCallback` (new) on `RichTextEditor` |
| `PUT /rest_api/v1/log?type=…` | `ErrorModal` on show (also the `ErrorBoundary` modal fallback and `ModalService`'s error modal), and `generateErrorBoundaryData` | `setVanguardErrorLogger` (new) at bootstrap |

### How the deprecation shows up (TypeScript)

`AIAssistant` and `RichTextEditor` have overloaded call signatures. The usage that passes the callback matches a
recommended signature and stays unmarked. The usage that leaves it out matches a signature marked `@deprecated`, so the
TypeScript language service reports **TS6387** and editors strike the component name through:

| Usage | Matches | Editor |
| --- | --- | --- |
| `<AIAssistant … adjustCallback={cb} />` | `(props: AIAssistantProps & { adjustCallback: … })` | unmarked |
| `<AIAssistant … />`, or a spread of `AIAssistantProps` | `(props: AIAssistantProps)`, `@deprecated` | ~~AIAssistant~~: *The signature '(props: AIAssistantProps): Element' of 'AIAssistant' is deprecated.* |
| `<RichTextEditor />`, `useAiAssistant={false}` | `(props: RichTextEditorProps & { useAiAssistant?: false })` | unmarked |
| `<RichTextEditor useAiAssistant aiAdjustCallback={cb} />` (also with `useAiAssistant={flag}`) | `(props: RichTextEditorProps & { aiAdjustCallback: … })` | unmarked |
| `<RichTextEditor useAiAssistant />`, or `useAiAssistant={flag}` without the callback | `(props: RichTextEditorProps)`, `@deprecated` | ~~RichTextEditor~~: *The signature '(props: RichTextEditorProps): Element' of 'RichTextEditor' is deprecated.* |

The `@deprecated` text names the replacement (pass the callback and make the request with your own SDK) and the
removal (next major version). It's in the emitted declarations (`dist/types/core/AIAssistant/AIAssistant.d.ts`,
`…/RichTextEditor/RichTextEditor.d.ts`) and was checked against them.

- Nothing breaks: every existing usage still compiles. The deprecated signature takes the same `AIAssistantProps` /
  `RichTextEditorProps` as before, and `ComponentProps<typeof AIAssistant>` is still `AIAssistantProps` (it reads the
  last signature).
- `adjustCallback`, `aiAdjustCallback` and `setVanguardErrorLogger` aren't deprecated. They are the recommended API.
- Tradeoff: a suggestion, not an error. The deprecation shows only in editors, and in lint if
  `@typescript-eslint/no-deprecated` is on. `tsc` doesn't fail on it. A spread whose props type has `adjustCallback`
  optional counts as leaving it out. Narrow the type to keep it unmarked.
- Error logging has no TypeScript-level deprecation. Whether a logger is registered is only known at runtime, and
  `ErrorModal`, `ErrorBoundary` and `generateErrorBoundaryData` are used the same way with or without one. Marking them
  `@deprecated` would strike through correct usage. Their docs and `setVanguardErrorLogger`'s say that relying on the
  built-in request is deprecated, and how to replace it.

## 1. AIAssistant: pass `adjustCallback`

```tsx
<AIAssistant
  generateCallback={generate}
  adjustCallback={(text, option, command) => adjustWithOwnSdk(text, option, command)} // returns Promise<string>
  …
/>
```

- With the callback, Vanguard makes no request and opens no modal of its own. Show your own error or `AIBudgetEnd`
  modal from the callback. On a rejection, Vanguard resets the panel.
- The callback must build the request Vanguard builds: `aiText` (`outputFormat` HTML_TAGS or MARKDOWN depending on
  `useHtml`, plus `text`), `command`, `expand`, `shorten`, `generateHashtags`, `keywordsToIntegrate` (for
  `includeKeywords`), `tone`, `keepShort`, and `locationId` from the path. `EditDescription.tsx` in rc-webapp already
  does this.

## 2. RichTextEditor: pass `aiAdjustCallback` (new, optional)

```tsx
<RichTextEditor useAiAssistant aiAdjustCallback={(text, option, command) => adjustWithOwnSdk(text, option, command)} />
```

Before, the editor's AI assistant could only use Vanguard's built-in request. Without the prop, it still does, and that
usage is marked deprecated (see above).

## 3. Error logging: register a logger at bootstrap (new, optional)

```ts
import { setVanguardErrorLogger, VanguardErrorLogger } from '@rankingcoach/vanguard';
import { firstValueFrom } from 'rxjs';

const logToApi: VanguardErrorLogger = (type, entry) =>
  // The body and query Vanguard PUTs: { data: [entry] }, ?type=<type> (with the consumer's own SDK and base URL)
  firstValueFrom(logStore.putLog({ data: [entry] }, { type }));

const disposeLogger = setVanguardErrorLogger(logToApi);
// on app teardown / in tests:
disposeLogger();
```

- `entry` has the shape Vanguard sends: `info`, `error`, `message` (at most 100 characters), `href`, `host`,
  `pathname`, `state`, `source`. `type` is e.g. `error_modal_logs`.
- The WordPress bundle exports `setVanguardErrorLogger` too, because its `ModalService` can open an `ErrorModal`.
- The logger may throw or reject. Vanguard catches it (`console.error`), so the `ErrorModal` and `ErrorBoundary` always
  render.

**Registration contract.** The latest registration is active. Each call returns its own teardown:

- A teardown removes only its own registration. The newest live registration before it becomes active again
  (`A`, then `B`, dispose `B` → `A`).
- Teardowns are idempotent and safe out of order. With `A` then `B`, disposing `A` leaves `B` active. Disposing `B` then
  leaves none, and Vanguard is back to its deprecated built-in request. A disposed registration never comes back.
- `setVanguardErrorLogger(null)` removes every registration. Their old teardowns then do nothing, and the teardown
  returned for `null` is a no-op.

## 4. `generateErrorBoundaryData`

Signature unchanged: `(key, error?, errorInfo?, store?, source?) => Observable<LogsResponseSchema>`. It logs at the call,
subscribed or not.

- **Without a logger (deprecated, unchanged):** the same PUT as before. The Observable is that request's: it emits the
  response, or errors when the request fails.
- **With a logger:** the entry goes to the logger and no request is made. The Observable emits what the logger returned
  (or resolved to) once and completes. It never errors: a failing logger is only reported to the console. If you rely on
  `error`, check the logger's own promise instead.

(The declaration references `models/swagger/LogsResponseSchema`, which isn't shipped in `dist/types`, so consumers see
an unresolved type there. That was already so before VAN-64 and is unchanged.)

## 5. Package contents

Checked against real builds of `origin/master` and of this change (lib and WordPress, each in a clean copy of the tree):

- Nothing is removed from either bundle. The lib gains one JS file (`index-error-logger.js`) and its declaration. The
  WordPress bundle gains `types/core/RcErrorBoundry/error-logger.d.ts`. So imports through `./dist/*` keep working.
- `AIAssistant` and `RichTextEditor` are now declared as `AIAssistantComponent` / `RichTextEditorComponent`: the
  overloads above, the last one taking the same props as before.
- New public exports, at the root and in the WordPress entry: `setVanguardErrorLogger` and the types
  `VanguardErrorLogger` and `VanguardErrorLogEntry`. New optional prop: `RichTextEditor`'s `aiAdjustCallback`.
- An installed consumer tarball has not been tested.

## 6. Upgrading

1. Upgrading Vanguard alone changes nothing at runtime. Editors start showing the deprecated usages struck through.
2. When ready, in rc-webapp: add `adjustCallback` to every `<AIAssistant>` that relies on the default (e.g. the
   ReviewCardForm), and `aiAdjustCallback` to every `<RichTextEditor useAiAssistant>`. Call `setVanguardErrorLogger` once
   at bootstrap, and dispose it on teardown or in tests. The strikethroughs go away as the callbacks are added.
3. Next major version of Vanguard: remove the built-in requests (`legacyAdjustRequest`, `legacyPutLog`), the bundled
   stores they use, and the hardcoded `apiBase`. That release is breaking. Commit it with `!` / `BREAKING CHANGE:` so
   standard-version records it in `CHANGELOG.md`.

This change itself is a non-breaking feature plus deprecations. No version bump or release is part of VAN-64.
