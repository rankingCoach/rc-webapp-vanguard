/**
 * GATED consumer declaration fixture. The installed package exposes these existing declarations through `./dist/*`.
 * The explicit `.d.ts` paths and type imports make this a compile-time contract for the declarations.
 * AutocompleteWithAnchor (also subpath-only) is in realistic-usage.tsx: its autocompleteProps need MUI to compile.
 */
import type { AIAssistantPanel as AIAssistantPanelDeclaration } from '@rankingcoach/vanguard/dist/types/core/AIAssistant/AIAssistentPanel/AIAssistantPanel.d.ts';
import type { VerificationPinInput as VerificationPinInputDeclaration } from '@rankingcoach/vanguard/dist/types/common/VerificationPinInput/VerificationPinInput.d.ts';
import type { hexToRgba as hexToRgbaDeclaration } from '@rankingcoach/vanguard/dist/types/helpers/hex-to-rgba.d.ts';

import type { Equal, Expect } from './_helpers';

declare const AIAssistantPanel: typeof AIAssistantPanelDeclaration;
declare const VerificationPinInput: typeof VerificationPinInputDeclaration;
declare const hexToRgba: typeof hexToRgbaDeclaration;

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
