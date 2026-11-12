import { act, cleanup, fireEvent, render, renderHook, screen } from '@test-utils/test-utils';
import { ModalService } from '@vanguard/Modal/ModalService';
import axios from 'axios';
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
  ...overrides,
});

const flush = () => act(async () => {});

describe('AIAssistant adjust: the consumer’s callback, the built-in request deprecated (VAN-64)', () => {
  let axiosRequest: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    axiosRequest = vi.spyOn(axios, 'request').mockImplementation(() => new Promise(() => {}));
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('the hook, called directly', () => {
    test('without adjustCallback it still adjusts through the built-in (deprecated) request, as before', async () => {
      const { result } = renderHook(() => useAiAssistantAdjustAndGenerate(baseProps()));
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'expand'));
      await flush();
      expect(axiosRequest).toHaveBeenCalledTimes(1);
      expect(String((axiosRequest.mock.calls[0][0] as { url?: string }).url)).toContain('/app/api/client/ai/text/');
      expect(result.current.panelStatus).toBe('writing');
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'shorten'));
      await flush();
      expect(axiosRequest).toHaveBeenCalledTimes(2);
    });

    test('with adjustCallback: it gets text, option and command, its text is set, and Vanguard requests nothing', async () => {
      const setValue = vi.fn();
      const adjustCallback = vi.fn(() => Promise.resolve('adjusted'));
      const { result } = renderHook(() => useAiAssistantAdjustAndGenerate(baseProps({ setValue, adjustCallback })));
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'shorten', 'cmd'));
      expect(result.current.panelStatus).toBe('writing');
      await flush();
      expect(adjustCallback).toHaveBeenCalledWith('Some text', 'shorten', 'cmd');
      expect(setValue).toHaveBeenCalledWith('adjusted');
      expect(result.current.panelStatus).toBe('open');
      expect(axiosRequest).not.toHaveBeenCalled();
    });

    test('a rejected adjustCallback leaves writing and opens no modal of Vanguard’s own', async () => {
      vi.spyOn(console, 'log').mockImplementation(() => {});
      const open = vi.spyOn(ModalService, 'open');
      const adjustCallback = vi.fn(() => Promise.reject(new Error('budget')));
      const { result } = renderHook(() => useAiAssistantAdjustAndGenerate(baseProps({ adjustCallback })));
      act(() => result.current.setPanelStatus('open'));
      act(() => result.current.onAdjustClick('Some text', 'expand'));
      await flush();
      expect(result.current.panelStatus).not.toBe('writing');
      expect(open).not.toHaveBeenCalled();
      expect(axiosRequest).not.toHaveBeenCalled();
    });
  });

  describe('the component', () => {
    const openPanel = () => fireEvent.click(screen.getByText('Use AI Assistant'));
    const anchor = () => {
      const anchorElem = document.createElement('div');
      document.body.appendChild(anchorElem);
      return anchorElem;
    };

    test('without adjustCallback the Adjust action is still offered, as before', () => {
      render(<AIAssistant {...baseProps({ anchorElem: anchor() })} />);
      openPanel();
      expect(screen.getByText('Adjust')).toBeTruthy();
    });

    test('with adjustCallback the Adjust action is offered', () => {
      render(<AIAssistant {...baseProps({ anchorElem: anchor(), adjustCallback: () => Promise.resolve('x') })} />);
      openPanel();
      expect(screen.getByText('Adjust')).toBeTruthy();
    });
  });
});
