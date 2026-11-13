import { act, cleanup, fireEvent, render, renderHook, screen } from '@test-utils/test-utils';
import { ModalService } from '@vanguard/Modal/ModalService';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AIAssistant, AIAssistantProps } from './AIAssistant';
import { useAiAssistantAdjustAndGenerate } from './useAiAssistant-GenerateAndAdjust';

// jsdom has no canvas, which lottie-web needs at import: the loader animation is beside the point here
vi.mock('@vanguard/LottieAnimationLoader/LottieAnimationLoader', () => ({ LottieAnimationLoader: () => null }));

// jsdom has no ResizeObserver; the panel and the editor only need it to exist
(globalThis as any).ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const baseProps = (overrides: Partial<AIAssistantProps> = {}): AIAssistantProps => ({
  id: 'ai',
  anchorElem: null,
  value: 'Some text',
  setValue: vi.fn(),
  generateCallback: vi.fn(() => Promise.resolve('generated')),
  adjustCallback: vi.fn(() => Promise.resolve('adjusted')),
  ...overrides,
});

const flush = () => act(async () => {});

describe('AIAssistant adjust: only through the consumer’s adjustCallback', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>;
  let xhrOpen: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(() => {}));
    xhrOpen = vi.spyOn(XMLHttpRequest.prototype, 'open').mockImplementation(() => {});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('adjustCallback is a required prop', () => {
    // @ts-expect-error adjustCallback is required: Vanguard has no request of its own to fall back to
    const props: AIAssistantProps = {
      anchorElem: null,
      value: '',
      setValue: () => {},
      generateCallback: async () => '',
    };
    expect(props.adjustCallback).toBeUndefined();
  });

  describe('the hook, called directly', () => {
    test('adjustCallback gets text, option, command and the request context; its text is set; Vanguard requests nothing', async () => {
      const setValue = vi.fn();
      const adjustCallback = vi.fn(() => Promise.resolve('adjusted'));
      const keywordsToInclude = [{ id: 1, name: 'pizza' }];
      const { result } = renderHook(() =>
        useAiAssistantAdjustAndGenerate(
          baseProps({ setValue, adjustCallback, keywordsToInclude, useHtml: true, keepShort: true }),
        ),
      );
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'includeKeywords', 'cmd'));
      expect(result.current.panelStatus).toBe('writing');
      await flush();
      expect(adjustCallback).toHaveBeenCalledWith('Some text', 'includeKeywords', 'cmd', {
        keywordsToInclude,
        useHtml: true,
        keepShort: true,
      });
      expect(setValue).toHaveBeenCalledWith('adjusted');
      expect(result.current.panelStatus).toBe('open');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(xhrOpen).not.toHaveBeenCalled();
    });

    test('without keywordsToInclude, useHtml and keepShort the context has [], false and undefined', async () => {
      const adjustCallback = vi.fn(() => Promise.resolve('adjusted'));
      const { result } = renderHook(() => useAiAssistantAdjustAndGenerate(baseProps({ adjustCallback })));
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'shorten'));
      await flush();
      expect(adjustCallback).toHaveBeenCalledWith('Some text', 'shorten', undefined, {
        keywordsToInclude: [],
        useHtml: false,
        keepShort: undefined,
      });
    });

    test('a rejected adjustCallback leaves writing and opens no modal of Vanguard’s own', async () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      const open = vi.spyOn(ModalService, 'open');
      const adjustCallback = vi.fn(() => Promise.reject(new Error('budget')));
      const { result } = renderHook(() => useAiAssistantAdjustAndGenerate(baseProps({ adjustCallback })));
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'expand'));
      await flush();
      expect(result.current.panelStatus).not.toBe('writing');
      expect(open).not.toHaveBeenCalled();
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(xhrOpen).not.toHaveBeenCalled();
    });
  });

  describe('the component', () => {
    test('the Adjust action is offered', () => {
      const anchorElem = document.createElement('div');
      document.body.appendChild(anchorElem);
      render(<AIAssistant {...baseProps({ anchorElem })} />);
      fireEvent.click(screen.getByText('Use AI Assistant'));
      expect(screen.getByText('Adjust')).toBeTruthy();
    });
  });
});
