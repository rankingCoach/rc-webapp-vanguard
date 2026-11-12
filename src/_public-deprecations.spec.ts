import { resolve } from 'node:path';

import ts from 'typescript';
import { beforeAll, describe, expect, test } from 'vitest';

/**
 * VAN-64: relying on Vanguard's built-in requests is deprecated at the TypeScript level. A consumer's editor shows the
 * usage that leaves the callback out as deprecated (struck through), and the recommended usage stays unmarked. Checked
 * with the TypeScript language service, the way an editor sees it, through the modules the package root re-exports
 * (src/index.ts: `./core/AIAssistant`, `./core/RichTextEditor`, `./core/RcErrorBoundry`; the whole root is slow to load).
 */
const ROOT = resolve(__dirname, '..');
const FIXTURE = resolve(ROOT, 'src/__public-deprecations-fixture__.tsx');

// Each line ends with the marker of what the editor must show for it
const FIXTURE_SOURCE = `
import React, { ComponentProps } from 'react';
import { AIAssistant, AIAssistantProps } from './core/AIAssistant';
import { generateErrorBoundaryData, setVanguardErrorLogger } from './core/RcErrorBoundry';
import { RichTextEditor } from './core/RichTextEditor';

const cb = (text: string) => Promise.resolve(text);
declare const flag: boolean;
declare const props: AIAssistantProps;
const base = { anchorElem: null, value: '', setValue: () => {}, generateCallback: () => Promise.resolve('') };

export const a1 = <AIAssistant {...base} />; // DEPRECATED
export const a2 = <AIAssistant {...base} adjustCallback={cb} />; // OK
export const a3 = <AIAssistant anchorElem={null} value="" setValue={() => {}} generateCallback={() => Promise.resolve('')} />; // DEPRECATED
export const a4 = <AIAssistant anchorElem={null} value="" setValue={() => {}} generateCallback={() => Promise.resolve('')} adjustCallback={cb} />; // OK
export const a5 = <AIAssistant {...props} />; // DEPRECATED
export const r1 = <RichTextEditor />; // OK
export const r2 = <RichTextEditor useAiAssistant />; // DEPRECATED
export const r3 = <RichTextEditor useAiAssistant aiAdjustCallback={cb} />; // OK
export const r4 = <RichTextEditor useAiAssistant={flag} aiAdjustCallback={cb} />; // OK
export const r5 = <RichTextEditor useAiAssistant={false} />; // OK
export const r6 = <RichTextEditor useAiAssistant={flag} />; // DEPRECATED
export const dispose = setVanguardErrorLogger(() => {}); // OK
export const log$ = generateErrorBoundaryData('error_modal_logs'); // OK
// The props types are as before
export const compat: AIAssistantProps = {} as ComponentProps<typeof AIAssistant>; // OK
`;

const marker = (line: string) => (line.match(/\/\/ (DEPRECATED|OK)$/)?.[1] ?? null) as 'DEPRECATED' | 'OK' | null;

let service: ts.LanguageService;

beforeAll(() => {
  const parsed = ts.getParsedCommandLineOfConfigFile(
    resolve(ROOT, 'tsconfig.app.json'),
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (d) => {
        throw new Error(ts.flattenDiagnosticMessageText(d.messageText, '\n'));
      },
    },
  )!;
  const host: ts.LanguageServiceHost = {
    getCompilationSettings: () => ({ ...parsed.options, noEmit: true }),
    getScriptFileNames: () => [FIXTURE],
    getScriptVersion: () => '1',
    getScriptSnapshot: (file) =>
      file === FIXTURE
        ? ts.ScriptSnapshot.fromString(FIXTURE_SOURCE)
        : ts.sys.fileExists(file)
          ? ts.ScriptSnapshot.fromString(ts.sys.readFile(file)!)
          : undefined,
    getCurrentDirectory: () => ROOT,
    getDefaultLibFileName: (o) => ts.getDefaultLibFilePath(o),
    fileExists: (file) => file === FIXTURE || ts.sys.fileExists(file),
    readFile: (file) => (file === FIXTURE ? FIXTURE_SOURCE : ts.sys.readFile(file)),
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
  };
  service = ts.createLanguageService(host);
}, 120_000);

describe('public deprecations, as an editor sees them (VAN-64)', () => {
  test('the fixture compiles: no API break', () => {
    const errors = service
      .getSemanticDiagnostics(FIXTURE)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '));
    expect(errors).toEqual([]);
  }, 120_000);

  test('only the usages that leave the callback out are marked deprecated', () => {
    const lines = FIXTURE_SOURCE.split('\n');
    const program = service.getProgram()!;
    const file = program.getSourceFile(FIXTURE)!;
    const deprecatedLines = new Set(
      service
        .getSuggestionDiagnostics(FIXTURE)
        .filter((d) => d.reportsDeprecated)
        .map((d) => file.getLineAndCharacterOfPosition(d.start!).line),
    );
    const actual = lines.map((line, i) =>
      marker(line) ? `${deprecatedLines.has(i) ? 'DEPRECATED' : 'OK'} ← ${line.trim()}` : null,
    );
    const expected = lines.map((line) => (marker(line) ? `${marker(line)} ← ${line.trim()}` : null));
    expect(actual.filter(Boolean)).toEqual(expected.filter(Boolean));
  }, 120_000);

  test('the language service reports deprecation diagnostics', () => {
    const messages = service
      .getSuggestionDiagnostics(FIXTURE)
      .filter((d) => d.reportsDeprecated)
      .map((d) => ts.flattenDiagnosticMessageText(d.messageText, ' '));
    expect(messages.length).toBeGreaterThan(0);
  }, 120_000);
});
