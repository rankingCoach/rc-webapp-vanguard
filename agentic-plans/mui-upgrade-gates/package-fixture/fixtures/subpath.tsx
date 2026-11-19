/**
 * GATED consumer fixture: Tier A items NOT exported from the package root, imported through the documented
 * subpath exports (`./core/*`, `./common/*`, `./helpers/*` in package.json `exports`).
 *
 * TYPES ONLY: the `types` targets (dist/types/**) exist, but the `import`/`require` targets (dist/core/*.js, ...)
 * do not, because the lib build flattens modules to dist/index-<Name>.js. run.sh probes that at runtime
 * (exports-probe) and reports it; it is not part of this type gate.
 * AutocompleteWithAnchor (also subpath-only) is in realistic-usage.tsx: its autocompleteProps need MUI to compile.
 */
import { AIAssistantPanel } from '@rankingcoach/vanguard/core/AIAssistant/AIAssistentPanel/AIAssistantPanel';
import { VerificationPinInput } from '@rankingcoach/vanguard/common/VerificationPinInput/VerificationPinInput';
import { hexToRgba } from '@rankingcoach/vanguard/helpers/hex-to-rgba';

import type { Equal, Expect } from './_helpers';

export type SubpathTypeChecks = [Expect<Equal<typeof hexToRgba, (hexColor: string, alpha: number) => string>>];

export const SubpathUsage = () => (
  <>
    <VerificationPinInput adornment={<span>#</span>} pinMask="0000" label="PIN" pinIsIncorrect={false} />
    <AIAssistantPanel value="text" setValue={() => undefined} generateCallback={async () => 'generated'} status="open" />
    <span style={{ color: hexToRgba('#ff0000', 0.5) }} />

    {/* @ts-expect-error [VerificationPinInput.pinMask] required */}
    <VerificationPinInput adornment={null} />
    {/* @ts-expect-error [AIAssistantPanel.status] not in the union */}
    <AIAssistantPanel value="" setValue={() => undefined} generateCallback={async () => ''} status="sleeping" />
  </>
);

// @ts-expect-error [hexToRgba.alpha] must be a number
hexToRgba('#fff', '0.5');
