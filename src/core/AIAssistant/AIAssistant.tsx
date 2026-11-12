import { mb2 } from '@globalStyles';
import { uuidv4 } from '@helpers/generate-uid';
import { Keyword } from '@models/swagger/App/Domain/Common/Entities/Keywords/Keyword';
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

export type AIAssistantProps = {
  id?: string;
  children?: React.ReactElement;
  anchorElem: HTMLElement | null; // Panel will position to this element
  generateBtnText?: string;
  generateCallback: (command?: string, keepShort?: boolean) => Promise<string>; // REQUIRED: A callback that will be called when the "Generate" button is clicked
  /**
   * The consumer's adjust request: resolves to the adjusted text. Recommended.
   *
   * Without it, Vanguard adjusts through its own built-in request (its own SDK, to the page's origin). That usage is
   * deprecated, and editors show it struck through: see {@link AIAssistant}. The built-in request will be removed in the
   * next major version (VAN-64).
   */
  adjustCallback?: (text: string, option: AIAssistantAdjustOptions, command?: string) => Promise<string>;
  useHtml?: boolean; // OPTIONAL: if true, will use HTML instead of plain text
  onKeepCallback?: () => void; // OPTIONAL: if provided, will be called when the "Keep" button is clicked
  onCloseCallback?: () => void; //OPTIONAL: if provided, will be called when the close button is clicked
  onPanelStatusChange?: (newPanelStatus: AIAssistantStatus) => void; //OPTIONAL: if provided, will be called when the close button is clicked
  className?: string;
  needsCommandOnGenerate?: boolean;
  hasGenerateHashtagsAdjustOption?: boolean;
  hasIncludeKeywordsAdjustOption?: boolean;
  keywordsToInclude?: Keyword[];
  value: string; // A state variable that will contain generated text (bind it to input)
  setValue: (value: string) => void; // A setter for the state variable, will be uset to set generated text
  disabled?: boolean;
  keepShort?: boolean;
  forbiddenAjustOptions?: AIAssistantAdjustOptions[];
};

/**
 * AIAssistant's call signatures (VAN-64). With `adjustCallback` it matches the first, the recommended one. Without it,
 * the second, which is deprecated: editors show that usage struck through, while it still works as before.
 */
export type AIAssistantComponent = {
  /** Generates and adjusts text: `generateCallback` and `adjustCallback` make the requests, with your own SDK. */
  (props: AIAssistantProps & { adjustCallback: NonNullable<AIAssistantProps['adjustCallback']> }): React.JSX.Element;
  /**
   * @deprecated Pass `adjustCallback` and make the adjust request with your own SDK. Without it, AIAssistant adjusts
   * through Vanguard's built-in request (its own SDK, with a hardcoded empty base URL: the page's origin), which will be
   * removed in the next major version (VAN-64).
   */
  (props: AIAssistantProps): React.JSX.Element;
};

export const AIAssistant: AIAssistantComponent = (props: AIAssistantProps) => {
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
