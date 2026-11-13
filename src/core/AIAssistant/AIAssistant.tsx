import { mb2 } from '@globalStyles';
import { uuidv4 } from '@helpers/generate-uid';
import { AIAssistantPanel } from '@vanguard/AIAssistant/AIAssistentPanel/AIAssistantPanel';
import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import React from 'react';

import { useAiAssistantAdjustAndGenerate } from './useAiAssistant-GenerateAndAdjust';

export type AIAssistantStatus = 'closed' | 'writing' | 'needsCommand' | 'open' | 'adjust';
export type AIAssistantAdjustOptions =
  | 'command'
  | 'expand'
  | 'shorten'
  | 'generateHashtags'
  | 'includeKeywords'
  | 'formal'
  | 'changeTone'
  | 'professional'
  | 'informative'
  | 'friendly'
  | 'bold'
  | 'witty';

/**
 * A keyword the assistant may work into the text (`includeKeywords`). Only these fields are typed: a backend `Keyword`
 * fits as is. Vanguard doesn't read it; it hands `keywordsToInclude` to your `adjustCallback` (see
 * {@link AIAssistantAdjustContext}).
 */
export type AIAssistantKeyword = {
  id?: number | null;
  name?: string | null;
  objectType?: string | null;
};

/** What the component knows about the adjust request beyond the text: everything a backend adjust request needs. */
export type AIAssistantAdjustContext = {
  /** The component's `keywordsToInclude` (`[]` when unset), for `option === 'includeKeywords'`. */
  keywordsToInclude: AIAssistantKeyword[];
  /** The text is HTML (the component's `useHtml`; always so in RichTextEditor), else Markdown. */
  useHtml: boolean;
  /** The component's `keepShort`. */
  keepShort?: boolean;
};

/**
 * The consumer's adjust request, made with its own SDK: resolves to the adjusted text. Vanguard makes no request of its
 * own. Show your own error (or AI budget) modal from it; when it rejects, Vanguard resets the panel.
 *
 * `command` is the free-text instruction, set for `option === 'command'`.
 */
export type AIAssistantAdjustCallback = (
  text: string,
  option: AIAssistantAdjustOptions,
  command: string | undefined,
  context: AIAssistantAdjustContext,
) => Promise<string>;

export type AIAssistantProps = {
  id?: string;
  children?: React.ReactElement;
  anchorElem: HTMLElement | null; // Panel will position to this element
  generateBtnText?: string;
  generateCallback: (command?: string, keepShort?: boolean) => Promise<string>; // REQUIRED: A callback that will be called when the "Generate" button is clicked
  /** REQUIRED: the adjust request, made by the consumer (see {@link AIAssistantAdjustCallback}). */
  adjustCallback: AIAssistantAdjustCallback;
  useHtml?: boolean; // OPTIONAL: if true, will use HTML instead of plain text
  onKeepCallback?: () => void; // OPTIONAL: if provided, will be called when the "Keep" button is clicked
  onCloseCallback?: () => void; //OPTIONAL: if provided, will be called when the close button is clicked
  onPanelStatusChange?: (newPanelStatus: AIAssistantStatus) => void; //OPTIONAL: if provided, will be called when the close button is clicked
  className?: string;
  needsCommandOnGenerate?: boolean;
  hasGenerateHashtagsAdjustOption?: boolean;
  hasIncludeKeywordsAdjustOption?: boolean;
  keywordsToInclude?: AIAssistantKeyword[];
  value: string; // A state variable that will contain generated text (bind it to input)
  setValue: (value: string) => void; // A setter for the state variable, will be uset to set generated text
  disabled?: boolean;
  keepShort?: boolean;
  forbiddenAjustOptions?: AIAssistantAdjustOptions[];
};

export const AIAssistant = (props: AIAssistantProps) => {
  const {
    id = `AIAssistant_${uuidv4()}`,
    children,
    generateBtnText,
    className,
    value,
    setValue,
    anchorElem,
    needsCommandOnGenerate,
    disabled,
  } = props;

  const { panelStatus, setPanelStatus, generateError, onGenerateClick, onAdjustClick } =
    useAiAssistantAdjustAndGenerate(props);

  const onClickOnGenerateButton = () => {
    if (needsCommandOnGenerate) {
      setPanelStatus('needsCommand');
      return;
    }
    onGenerateClick();
  };

  /**
   * Return view
   * ---
   */
  return (
    <ComponentContainer id={id} testId={`${id}_TestID`} className={className}>
      <div className={mb2}>
        <Render if={panelStatus === 'closed' && value == ''}>
          <Button
            size={ButtonSizes.extraLarge}
            type={ButtonTypes.shimmer}
            iconLeft={IconNames.ai}
            onClick={onClickOnGenerateButton}
            disabled={disabled}
          >
            {generateBtnText ?? 'Generate'}
          </Button>
        </Render>
        <Render if={panelStatus === 'closed' && value != ''}>
          <Button
            size={ButtonSizes.extraLarge}
            type={ButtonTypes.shimmer}
            iconLeft={IconNames.ai}
            onClick={() => {
              setPanelStatus('open');
            }}
            disabled={disabled}
          >
            {'Use AI Assistant'}
          </Button>
        </Render>
        <Render if={panelStatus !== 'closed'}>
          <Button
            size={ButtonSizes.extraLarge}
            type={ButtonTypes.shimmer}
            iconLeft={IconNames.ai}
            onClick={() => {
              setPanelStatus('closed');
            }}
          >
            {'Close AI Assistant'}
          </Button>
        </Render>
      </div>

      <div>
        {children}
        {anchorElem && (
          <AIAssistantPanel
            {...props}
            anchorElem={anchorElem}
            status={panelStatus}
            setStatus={setPanelStatus}
            useHtml={true}
            //
            onGenerateClick={onGenerateClick}
            generateError={generateError}
            onAdjustClick={onAdjustClick}
            //
            value={value}
            setValue={setValue}
          />
        )}
      </div>
    </ComponentContainer>
  );
};
