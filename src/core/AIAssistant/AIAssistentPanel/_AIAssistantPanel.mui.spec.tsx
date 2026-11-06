/**
 * MUI contract (characterization) tests for AIAssistantPanel.
 *
 * The panel drives MUI Grow / Fade / Collapse (Collapse and Fade imported via deep paths
 * `@mui/material/Collapse/Collapse`, `@mui/material/Fade/Fade`, which v7 no longer allows: max one level deep).
 * These tests lock:
 *  - which status shows which part of the panel (visibility of its texts / buttons / textareas),
 *  - that nothing unmounts on exit (all transitions keep children mounted),
 *  - every callback wired through the panel (keep / adjust / try again / remove / close / Escape / Enter).
 *
 * No Vanguard production code depends on MUI Collapse classes or MUI's inline transition styles
 * (grep src for "MuiCollapse": none), so states are asserted as visibility (jest-dom toBeVisible reads
 * visibility and opacity). Real computed end states are asserted in _AIAssistantPanelMuiContract.stories.tsx.
 */
import '@testing-library/jest-dom/vitest';

import { fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { act, render, screen, waitFor } from '../../../../test-utils/test-utils';
import { AIAssistantStatus } from '../AIAssistant';
import { AIAssistantPanel, AIAssistantPanelProps } from './AIAssistantPanel';

// lottie-web touches HTMLCanvasElement.getContext at import time (not implemented in jsdom).
// Not MUI: safe to stub. The real animation is covered by the browser story.
vi.mock('@vanguard/LottieAnimationLoader/LottieAnimationLoader', () => ({
  LottieAnimationLoader: () => <div data-testid="lottie-stub" />,
}));

const ID = 'aiPanel';
const VALUE = 'Generated text';

const baseProps = (): AIAssistantPanelProps => ({
  id: ID,
  value: VALUE,
  setValue: vi.fn(),
  setStatus: vi.fn(),
  generateCallback: vi.fn(),
  onGenerateClick: vi.fn(),
  onAdjustClick: vi.fn(),
  onKeepCallback: vi.fn(),
  onCloseCallback: vi.fn(),
  onTextareaMouseDown: vi.fn(),
});

const renderPanel = (status: AIAssistantStatus, overrides: Partial<AIAssistantPanelProps> = {}) => {
  const props = { ...baseProps(), status, ...overrides };
  const utils = render(<AIAssistantPanel {...props} />);
  const rerenderWith = (next: Partial<AIAssistantPanelProps>) =>
    utils.rerender(<AIAssistantPanel {...props} {...next} />);
  return { ...utils, props, rerenderWith };
};

const getPanel = () => screen.getByTestId(`${ID}_Panel`);
const getTextareas = () => Array.from(getPanel().querySelectorAll<HTMLTextAreaElement>('textarea:not([aria-hidden])'));
const queryButtonByText = (text: string) => screen.queryByText(text)?.closest('button') ?? null;
const getButtonByText = (text: string) => {
  const btn = queryButtonByText(text);
  expect(btn).not.toBeNull();
  return btn as HTMLButtonElement;
};
/** Representative content of each layer. */
const writingLayer = () => screen.getByText('writing');
const mainLayer = () => screen.getByText('Assistant');
/** Tone submenu: Vanguard's own dropdown div, the direct parent of the tone buttons (wrapped by MUI Grow). */
const getToneDropdown = () => getButtonByText('Formal').parentElement as HTMLElement;
const SETTLE = { timeout: 3000 };

/** jsdom has no ResizeObserver; Textarea (InputBase) needs one for its highlight backdrop. */
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

let consoleError: ReturnType<typeof vi.spyOn>;
beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
  consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  consoleError.mockRestore();
  vi.unstubAllGlobals();
});

describe('AIAssistantPanel MUI contract: container and portal', () => {
  test('renders container with id/testid `\u0024{id}_Panel` and inline zIndex 1100', () => {
    renderPanel('open');
    const panel = getPanel();
    expect(panel).toHaveAttribute('id', `${ID}_Panel`);
    expect(panel.style.zIndex).toBe('1100');
  });

  test('renders inline when no anchorElem is given', () => {
    const { container } = renderPanel('open');
    expect(container.contains(getPanel())).toBe(true);
  });

  test('portals into anchorElem when provided', () => {
    const anchor = document.createElement('div');
    document.body.appendChild(anchor);
    const { container } = renderPanel('open', { anchorElem: anchor });
    expect(anchor.contains(getPanel())).toBe(true);
    expect(container.contains(getPanel())).toBe(false);
    anchor.remove();
  });

  test('className lands on both the writing and the main container', () => {
    const { container } = renderPanel('open', { className: 'my-panel' });
    const withClass = Array.from(container.querySelectorAll('.my-panel'));
    expect(withClass).toHaveLength(2);
    expect(withClass[0]).toContainElement(writingLayer());
    expect(withClass[1]).toContainElement(mainLayer());
  });
});

describe('AIAssistantPanel MUI contract: Grow / Fade visibility per status', () => {
  test('closed: whole panel invisible, both layers stay mounted; Keep group not mounted', () => {
    renderPanel('closed');
    expect(writingLayer()).not.toBeVisible();
    expect(mainLayer()).not.toBeVisible();
    // Keep/Adjust group is behind <Render if status==='open'>, so it is NOT mounted.
    expect(screen.queryByText('Keep')).toBeNull();
  });

  test('open on mount: main layer + Keep / Adjust / Try again visible, writing layer hidden', async () => {
    renderPanel('open');
    await waitFor(() => expect(mainLayer()).toBeVisible(), SETTLE);
    expect(writingLayer()).not.toBeVisible();
    expect(getButtonByText('Keep')).toBeVisible();
    expect(getButtonByText('Adjust')).toBeVisible();
    expect(getButtonByText('Try again')).toBeVisible();
  });

  test('writing: writing layer (Stop / ESC) visible, main layer hidden', async () => {
    renderPanel('writing');
    await waitFor(() => expect(writingLayer()).toBeVisible(), SETTLE);
    expect(screen.getByText('Stop')).toBeVisible();
    expect(screen.getByText('ESC')).toBeVisible();
    expect(mainLayer()).not.toBeVisible();
  });

  test.each<AIAssistantStatus>(['adjust', 'needsCommand'])(
    '%s: main layer visible, writing layer hidden',
    async (status) => {
      renderPanel(status);
      await waitFor(() => expect(mainLayer()).toBeVisible(), SETTLE);
      expect(writingLayer()).not.toBeVisible();
      expect(screen.queryByText('Keep')).toBeNull();
    },
  );

  test('closed -> open: panel becomes visible', async () => {
    const { rerenderWith } = renderPanel('closed');
    rerenderWith({ status: 'open' });
    await waitFor(() => expect(mainLayer()).toBeVisible(), SETTLE);
  });

  test('open -> closed: panel becomes invisible but keeps children mounted', async () => {
    const { rerenderWith } = renderPanel('open');
    rerenderWith({ status: 'closed' });
    await waitFor(() => expect(mainLayer()).not.toBeVisible(), SETTLE);
    expect(mainLayer()).toBeInTheDocument();
  });

  test('open -> writing: main layer hides, writing layer shows', async () => {
    const { rerenderWith } = renderPanel('open');
    rerenderWith({ status: 'writing' });
    await waitFor(() => expect(mainLayer()).not.toBeVisible(), SETTLE);
    await waitFor(() => expect(writingLayer()).toBeVisible(), SETTLE);
  });
});

describe('AIAssistantPanel MUI contract: Collapse sections', () => {
  test('open: both command textareas mounted but not visible', async () => {
    renderPanel('open');
    await waitFor(() => expect(mainLayer()).toBeVisible(), SETTLE);
    const [needsCommand, adjust] = getTextareas();
    expect(needsCommand).not.toBeVisible();
    expect(adjust).not.toBeVisible();
  });

  test('needsCommand: command textarea visible, adjust section hidden', async () => {
    renderPanel('needsCommand');
    const [needsCommand, adjust] = getTextareas();
    await waitFor(() => expect(needsCommand).toBeVisible(), SETTLE);
    expect(adjust).not.toBeVisible();
    expect(getButtonByText('Expand')).not.toBeVisible();
  });

  test('adjust: adjust textarea + options visible, command textarea hidden', async () => {
    renderPanel('adjust');
    const [needsCommand, adjust] = getTextareas();
    await waitFor(() => expect(adjust).toBeVisible(), SETTLE);
    expect(getButtonByText('Expand')).toBeVisible();
    expect(needsCommand).not.toBeVisible();
  });

  test('open -> adjust: Keep group unmounts, adjust options become visible', async () => {
    const { rerenderWith } = renderPanel('open');
    rerenderWith({ status: 'adjust' });
    expect(screen.queryByText('Keep')).toBeNull();
    await waitFor(() => expect(getButtonByText('Expand')).toBeVisible(), SETTLE);
  });
});

describe('AIAssistantPanel MUI contract: action callbacks', () => {
  test('Keep closes and calls onKeepCallback', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('open');
    await user.click(getButtonByText('Keep'));
    expect(props.setStatus).toHaveBeenCalledWith('closed');
    expect(props.onKeepCallback).toHaveBeenCalledTimes(1);
  });

  test('Adjust sets status adjust', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('open');
    await user.click(getButtonByText('Adjust'));
    expect(props.setStatus).toHaveBeenCalledWith('adjust');
  });

  test('close (X) button closes and calls onCloseCallback', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('open');
    const closeBtn = document.getElementById(`${ID}_ButtonClose`)!.querySelector('button')!;
    await user.click(closeBtn);
    expect(props.setStatus).toHaveBeenCalledWith('closed');
    expect(props.onCloseCallback).toHaveBeenCalledTimes(1);
  });

  test('remove (trash, last button of the action row) clears value and closes', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('open');
    // Keep / Adjust / Try again / trash share one row (Vanguard div.menu); trash is the icon-only last one.
    const row = getButtonByText('Keep').parentElement!.parentElement as HTMLElement;
    const buttons = row.querySelectorAll('button');
    expect(buttons).toHaveLength(4);
    await user.click(buttons[3]);
    expect(props.setValue).toHaveBeenCalledWith('');
    expect(props.setStatus).toHaveBeenCalledWith('closed');
  });

  test('Try again after initial render regenerates without a command', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('open');
    await user.click(getButtonByText('Try again'));
    expect(props.onGenerateClick).toHaveBeenCalledTimes(1);
    expect(props.onGenerateClick).toHaveBeenCalledWith();
  });

  test('Try again with needsCommandOnGenerate passes the command textarea value', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('open', { needsCommandOnGenerate: true });
    await user.click(getButtonByText('Try again'));
    expect(props.onGenerateClick).toHaveBeenCalledWith('');
  });

  test('Try again without onGenerateClick does not throw', async () => {
    const user = userEvent.setup();
    renderPanel('open', { onGenerateClick: undefined });
    await user.click(getButtonByText('Try again'));
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });

  test('callbacks are optional (no setStatus / onKeep / onClose)', async () => {
    const user = userEvent.setup();
    renderPanel('open', { setStatus: undefined, onKeepCallback: undefined, onCloseCallback: undefined });
    await user.click(getButtonByText('Keep'));
    await user.click(getButtonByText('Adjust'));
    await user.click(document.getElementById(`${ID}_ButtonClose`)!.querySelector('button')!);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(getPanel()).toBeInTheDocument();
  });
});

describe('AIAssistantPanel MUI contract: keyboard (document listener)', () => {
  test('Escape anywhere closes', () => {
    const { props } = renderPanel('open');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.setStatus).toHaveBeenCalledWith('closed');
  });

  test('listener is removed on unmount', () => {
    const { props, unmount } = renderPanel('open');
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(props.setStatus).not.toHaveBeenCalled();
  });

  test('Enter in needsCommand submits the typed command to onGenerateClick', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('needsCommand');
    const [commandTextarea] = getTextareas();
    await user.type(commandTextarea, 'make it short');
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(props.onGenerateClick).toHaveBeenCalledWith('make it short');
  });

  test('needsCommand textarea is autofocused', () => {
    renderPanel('needsCommand');
    expect(getTextareas()[0]).toHaveFocus();
  });

  test('Enter in adjust submits command option, clears input; Try again repeats the adjust', async () => {
    const user = userEvent.setup();
    const { props, rerenderWith } = renderPanel('adjust');
    const adjustTextarea = getTextareas()[1];
    await user.type(adjustTextarea, 'friendlier');
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(props.onAdjustClick).toHaveBeenCalledWith(VALUE, 'command', 'friendlier');
    expect(adjustTextarea.value).toBe('');

    rerenderWith({ status: 'open' });
    await user.click(getButtonByText('Try again'));
    expect(props.onAdjustClick).toHaveBeenCalledTimes(2);
    expect(props.onAdjustClick).toHaveBeenLastCalledWith(VALUE, 'command', 'friendlier');
    expect(props.onGenerateClick).not.toHaveBeenCalled();
  });

  test('Enter while closed does nothing', () => {
    const { props } = renderPanel('closed');
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(props.onGenerateClick).not.toHaveBeenCalled();
    expect(props.onAdjustClick).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  test.each<AIAssistantStatus>(['open', 'writing'])(
    '[v5-quirk] Enter while %s logs "status not supported"',
    (status) => {
      // Baseline characterization: not a promised contract.
      // CURRENT BEHAVIOUR: the document-level Enter listener runs in every status and logs for unsupported ones.
      const { props } = renderPanel(status);
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(consoleError).toHaveBeenCalledWith('submitCommandInput: status not supported', status);
      expect(props.onGenerateClick).not.toHaveBeenCalled();
    },
  );

  test('Enter in needsCommand without onGenerateClick does not throw', () => {
    renderPanel('needsCommand', { onGenerateClick: undefined });
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(getPanel()).toBeInTheDocument();
  });
});

describe('AIAssistantPanel MUI contract: adjust options', () => {
  test.each([
    ['Expand', 'expand'],
    ['Shorten', 'shorten'],
    ['Formal', 'formal'],
    ['Professional', 'professional'],
    ['Informative', 'informative'],
    ['Friendly', 'friendly'],
    ['Bold', 'bold'],
    ['Witty', 'witty'],
  ])('%s calls onAdjustClick(value, %s, "")', async (label, option) => {
    const user = userEvent.setup();
    const { props } = renderPanel('adjust');
    await user.click(getButtonByText(label));
    expect(props.onAdjustClick).toHaveBeenCalledWith(VALUE, option, '');
  });

  test('Change tone click is a no-op (only opens the submenu on hover)', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('adjust');
    fireEvent.click(getButtonByText('Change tone'));
    expect(props.onAdjustClick).not.toHaveBeenCalled();
    await user.click(getButtonByText('Expand'));
    expect(props.onAdjustClick).toHaveBeenCalledTimes(1);
  });

  test('tone submenu keeps the Vanguard transformOrigin passed to Grow', () => {
    renderPanel('adjust');
    expect(getToneDropdown().style.transformOrigin).toBe('top right');
  });

  test('tone submenu is hidden until Change tone is hovered; hovering another item hides it', async () => {
    renderPanel('adjust');
    expect(getButtonByText('Formal')).not.toBeVisible();
    fireEvent.mouseEnter(getButtonByText('Change tone'));
    await waitFor(() => expect(getButtonByText('Formal')).toBeVisible(), SETTLE);
    fireEvent.mouseEnter(getButtonByText('Shorten'));
    await waitFor(() => expect(getButtonByText('Formal')).not.toBeVisible(), SETTLE);
  });

  test.each(['Expand', 'Generate hashtags', 'Integrate keywords'])(
    'hovering %s closes the tone submenu',
    async (label) => {
      renderPanel('adjust', { hasGenerateHashtagsAdjustOption: true, hasIncludeKeywordsAdjustOption: true });
      fireEvent.mouseEnter(getButtonByText('Change tone'));
      await waitFor(() => expect(getButtonByText('Formal')).toBeVisible(), SETTLE);
      fireEvent.mouseEnter(getButtonByText(label));
      await waitFor(() => expect(getButtonByText('Formal')).not.toBeVisible(), SETTLE);
    },
  );

  test('choosing a tone closes the submenu', async () => {
    const user = userEvent.setup();
    renderPanel('adjust');
    fireEvent.mouseEnter(getButtonByText('Change tone'));
    await waitFor(() => expect(getButtonByText('Witty')).toBeVisible(), SETTLE);
    await user.click(getButtonByText('Witty'));
    await waitFor(() => expect(getButtonByText('Witty')).not.toBeVisible(), SETTLE);
  });

  test('hashtags / keywords options are hidden by default', () => {
    renderPanel('adjust');
    expect(screen.queryByText('Generate hashtags')).toBeNull();
    expect(screen.queryByText('Integrate keywords')).toBeNull();
  });

  test('hashtags / keywords options call onAdjustClick with their option', async () => {
    const user = userEvent.setup();
    const { props } = renderPanel('adjust', {
      hasGenerateHashtagsAdjustOption: true,
      hasIncludeKeywordsAdjustOption: true,
    });
    await user.click(getButtonByText('Generate hashtags'));
    await user.click(getButtonByText('Integrate keywords'));
    expect(props.onAdjustClick).toHaveBeenNthCalledWith(1, VALUE, 'generateHashtags', '');
    expect(props.onAdjustClick).toHaveBeenNthCalledWith(2, VALUE, 'includeKeywords', '');
  });

  test('forbiddenAjustOptions ["shorten"] hides only Shorten', () => {
    renderPanel('adjust', { forbiddenAjustOptions: ['shorten'] });
    expect(queryButtonByText('Shorten')).toBeNull();
    expect(queryButtonByText('Expand')).not.toBeNull();
    expect(queryButtonByText('Change tone')).not.toBeNull();
  });

  test('[bug-lock] forbiddenAjustOptions ["expand"] hides Expand AND Change tone', () => {
    // Baseline characterization: not a promised contract.
    renderPanel('adjust', { forbiddenAjustOptions: ['expand'] });
    expect(queryButtonByText('Expand')).toBeNull();
    // CURRENT BEHAVIOUR (suspected bug): Change tone is gated on 'expand' instead of 'changeTone'.
    expect(queryButtonByText('Change tone')).toBeNull();
    expect(queryButtonByText('Shorten')).not.toBeNull();
  });

  test('[bug-lock] forbiddenAjustOptions ["changeTone"] does NOT hide Change tone', () => {
    // Baseline characterization: not a promised contract.
    renderPanel('adjust', { forbiddenAjustOptions: ['changeTone'] });
    // CURRENT BEHAVIOUR (suspected bug): see above.
    expect(queryButtonByText('Change tone')).not.toBeNull();
  });

  test('without onAdjustClick an option logs an error and keeps going', async () => {
    const user = userEvent.setup();
    renderPanel('adjust', { onAdjustClick: undefined });
    await user.click(getButtonByText('Expand'));
    expect(consoleError).toHaveBeenCalledWith('clickAdjustOption: onAdjustClick not provided');
  });

  test('Try again after adjust without onAdjustClick does not throw', async () => {
    const user = userEvent.setup();
    const onAdjustClick = vi.fn();
    const { rerenderWith } = renderPanel('adjust', { onAdjustClick });
    await user.click(getButtonByText('Shorten'));
    rerenderWith({ status: 'open', onAdjustClick: undefined });
    await user.click(getButtonByText('Try again'));
    expect(onAdjustClick).toHaveBeenCalledTimes(1);
  });
});

describe('AIAssistantPanel MUI contract: textarea wrappers', () => {
  test.each<[AIAssistantStatus, number]>([
    ['needsCommand', 0],
    ['adjust', 1],
  ])('%s: mousedown on the textarea wrapper calls onTextareaMouseDown and stops propagation', (status, index) => {
    const outer = vi.fn();
    const props = { ...baseProps(), status };
    render(
      <div onMouseDown={outer}>
        <AIAssistantPanel {...props} />
      </div>,
    );
    fireEvent.mouseDown(getTextareas()[index]);
    expect(props.onTextareaMouseDown).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  test('mousedown without onTextareaMouseDown does not throw', () => {
    renderPanel('adjust', { onTextareaMouseDown: undefined });
    fireEvent.mouseDown(getTextareas()[0]);
    fireEvent.mouseDown(getTextareas()[1]);
    expect(getPanel()).toBeInTheDocument();
  });

  test.each<[AIAssistantStatus, number]>([
    ['needsCommand', 0],
    ['adjust', 1],
  ])('%s: clicking the send icon submits the command', async (status, index) => {
    const { props } = renderPanel(status);
    const textarea = getTextareas()[index];
    fireEvent.change(textarea, { target: { value: 'cmd' } });
    // Send icon renders asynchronously (useDynamicImport). It is the end adornment of this textarea.
    // Nearest ancestor of the textarea that holds a Vanguard Icon span (inline display:flex), without
    // leaving the textarea field (stop before any ancestor that also contains buttons).
    const findSendIcon = () => {
      for (
        let el: HTMLElement | null = textarea.parentElement;
        el && !el.querySelector('button');
        el = el.parentElement
      ) {
        const icon = el.querySelector<HTMLElement>('span[style*="flex"]');
        if (icon) return icon;
      }
      return null;
    };
    let sendIcon: HTMLElement | null = null;
    await waitFor(() => {
      sendIcon = findSendIcon();
      expect(sendIcon).not.toBeNull();
    });
    await act(() => {
      fireEvent.click(sendIcon!);
    });
    if (status === 'needsCommand') {
      expect(props.onGenerateClick).toHaveBeenCalledWith('cmd');
    } else {
      expect(props.onAdjustClick).toHaveBeenCalledWith(VALUE, 'command', 'cmd');
    }
  });
});
