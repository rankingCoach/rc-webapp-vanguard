import { cleanup, render, screen } from '@test-utils/test-utils';
import * as hookModule from '@vanguard/AIAssistant/useAiAssistant-GenerateAndAdjust';
import React from 'react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { RichTextEditor } from './RichTextEditor';

// jsdom has no canvas, which lottie-web needs at import: the loader animation is beside the point here
vi.mock('@vanguard/LottieAnimationLoader/LottieAnimationLoader', () => ({ LottieAnimationLoader: () => null }));

// jsdom has no ResizeObserver; the panel and the editor only need it to exist
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('@vanguard/AIAssistant/useAiAssistant-GenerateAndAdjust', async (importOriginal) => {
  const actual = await importOriginal<typeof hookModule>();
  return { ...actual, useAiAssistantAdjustAndGenerate: vi.fn(actual.useAiAssistantAdjustAndGenerate) };
});

// A text selection, as the editor would report it: the AI assistant's cue to offer adjusting it
vi.mock('@vanguard/RichTextEditor/RteAiAssistant/useRteAiAssistant-selection', () => ({
  useAiAssistantSelection: () => ({
    isText: true,
    isLink: false,
    selection: 'Selected text',
    updatePosition: () => {},
    setIsMouseOver: () => {},
    selectionRect: null,
  }),
}));

const lastHookStatus = () =>
  vi.mocked(hookModule.useAiAssistantAdjustAndGenerate).mock.results.at(-1)?.value?.panelStatus;

const lastHookProps = () => vi.mocked(hookModule.useAiAssistantAdjustAndGenerate).mock.lastCall?.[0];

describe('RichTextEditor AI adjust: the consumer’s callback, or the deprecated built-in request (VAN-64)', () => {
  afterEach(() => {
    cleanup();
    vi.mocked(hookModule.useAiAssistantAdjustAndGenerate).mockClear();
  });

  test('aiAdjustCallback is handed to the AI assistant as its adjustCallback', () => {
    const aiAdjustCallback = vi.fn(() => Promise.resolve('adjusted'));
    render(<RichTextEditor useAiAssistant aiAdjustCallback={aiAdjustCallback} />);
    expect(lastHookProps()?.adjustCallback).toBe(aiAdjustCallback);
  });

  test('without aiAdjustCallback the AI assistant has none (it falls back to the deprecated built-in request)', () => {
    render(<RichTextEditor useAiAssistant />);
    expect(hookModule.useAiAssistantAdjustAndGenerate).toHaveBeenCalled();
    expect(lastHookProps()?.adjustCallback).toBeUndefined();
  });

  test('a text selection without aiAdjustCallback still opens the adjust options, as before', () => {
    render(<RichTextEditor useAiAssistant />);
    expect(lastHookStatus()).toBe('adjust');
    expect(screen.getByText('Expand')).toBeTruthy();
  });

  test('a text selection with aiAdjustCallback opens the adjust options', () => {
    render(<RichTextEditor useAiAssistant aiAdjustCallback={() => Promise.resolve('x')} />);
    expect(lastHookStatus()).toBe('adjust');
    expect(screen.getByText('Expand')).toBeTruthy();
  });
});
