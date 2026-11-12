import { AIBudgetEnd } from '@common/AIBudgetEnd/AIBudgetEnd';
import { aiBudgetExceededMessage } from '@common/AIBudgetEnd/AIBudgetEnd.data';
import { getPathId } from '@helpers/get-path-id';
import { AITextObjectType, AITextOutputFormat } from '@models/swagger/App/Domain/AI/Entities/Text/AIText';
import { Keywords, KeywordsObjectType } from '@models/swagger/App/Domain/Common/Entities/Keywords/Keywords';
import { supportService } from '@services/support.service';
import { aiStore } from '@stores/swagger/client/AiStore';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ModalService } from '@vanguard/Modal/ModalService';
import { ErrorModal } from '@vanguard/StandardModals/ErrorModal/ErrorModal';
import React, { useEffect, useState } from 'react';

import { mapAdjustOptionsToBE } from './_helpers/ai-assistent-adjust-options';
import { AIAssistantAdjustOptions, AIAssistantProps, AIAssistantStatus } from './AIAssistant';

export const useAiAssistantAdjustAndGenerate = (props: AIAssistantProps) => {
  const { generateCallback, adjustCallback, setValue, onPanelStatusChange, useHtml, keywordsToInclude, keepShort } =
    props;

  // PANEL STATUS
  const [panelStatus, setPanelStatus] = useState<AIAssistantStatus>('closed');

  useEffect(() => {
    onPanelStatusChange && onPanelStatusChange(panelStatus);
  }, [panelStatus]);

  // GENERATE & ADJUST actions
  const [generatedText, setGeneratedText] = useState('');
  const [generatedCount, setGeneratedCount] = useState(0);
  const [generateError, setGenerateError] = useState(false);

  useEffect(() => {
    // We use an useEffect, because we cannot stop a promise, but we need the "STOP(ESC)" functionality
    if (generatedCount && panelStatus === 'writing') {
      if (generatedText && generatedText !== '') {
        setValue(generatedText);
      }
      setPanelStatus('open');
    }
  }, [generatedCount]);

  const onGenerateClick = (command?: string) => {
    setPanelStatus('writing');
    if (panelStatus !== 'writing') {
      generateCallback(command, keepShort).then(
        (generatedText) => {
          setGeneratedText(generatedText);
          setGeneratedCount(generatedCount + 1);
          setGenerateError(false); // Reset error state on success
        },
        (error) => {
          console.error('Error while generating text ', error);
          setPanelStatus('closed');
          setGeneratedText('');
          setGeneratedCount(generatedCount + 1);
          setGenerateError(true); // Set error state to true
        },
      );
    }
  };

  /**
   * The request Vanguard makes itself when there is no `adjustCallback`: Vanguard's own SDK, with its hardcoded empty
   * `apiBase`, so it goes to the page's origin (VAN-64).
   *
   * @deprecated Pass `adjustCallback` (or `aiAdjustCallback` on RichTextEditor) and make the request with your own SDK.
   * This fallback will be removed in the next major version.
   */
  const legacyAdjustRequest = (text: string, option: AIAssistantAdjustOptions, command?: string) => {
    aiStore
      .postClientAiTextAdjustByLocationId(
        getPathId(),
        {
          aiText: {
            outputFormat: useHtml ? AITextOutputFormat.HTML_TAGS : AITextOutputFormat.MARKDOWN,
            text: text,
            objectType: AITextObjectType.App_Domain_AI_Entities_Text_AIText,
          },
          command: command,
          expand: option === 'expand',
          shorten: option === 'shorten',
          generateHashtags: option === 'generateHashtags',
          keywordsToIntegrate:
            option === 'includeKeywords' && keywordsToInclude
              ? ({
                  elements: keywordsToInclude,
                  objectType: KeywordsObjectType.App_Domain_Common_Entities_Keywords_Keywords,
                } as unknown as Keywords)
              : undefined,
          tone: mapAdjustOptionsToBE(option),
          keepShort: keepShort,
        },
        {},
      )
      .subscribe({
        next: (response) => {
          setGeneratedText(response.aiText?.adjustedText ?? '');
          setGeneratedCount(generatedCount + 1);
        },
        error: (error) => {
          setPanelStatus('closed');
          console.error('Error while adjusting text ', error);
          if (error.response.data.error === aiBudgetExceededMessage) {
            ModalService.open(<AIBudgetEnd close={() => {}} />);
            return;
          }
          ModalService.open(
            <ErrorModal
              close={() => null}
              source={'AI_ASSISTANT'}
              title={'Oh snap! Something went wrong!'}
              message={
                'The application has encountered an unknown error. Please contact customer support for further help.'
              }
              ctaPositive={{
                text: 'contact our support',
                cta: () => {
                  supportService.show();
                },
                icon: IconNames.arrowRight,
              }}
              ctaPosition={'center'}
            />,
          );
          setGeneratedText('');
          setGeneratedCount(generatedCount + 1);
        },
      });
  };

  const onAdjustClick = (text: string, option: AIAssistantAdjustOptions, command?: string) => {
    setPanelStatus('writing');
    if (panelStatus !== 'writing') {
      if (adjustCallback) {
        /**
         * CUSTOM ADJUST CALLBACK
         */
        adjustCallback(text, option, command).then(
          (generatedText) => {
            setGeneratedText(generatedText);
            setGeneratedCount(generatedCount + 1);
          },
          (error) => {
            console.log('Error while adjusting text ', error);
            setGeneratedText('');
            setGeneratedCount(generatedCount + 1);
          },
        );
      } else {
        legacyAdjustRequest(text, option, command);
      }
    }
  };

  /**
   * Return data
   * ---
   */
  return {
    panelStatus,
    setPanelStatus,
    generateCallback,
    generatedCount,
    generateError,
    onGenerateClick,
    onAdjustClick,
  };
};
