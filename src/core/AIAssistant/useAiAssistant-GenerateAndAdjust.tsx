import { useEffect, useState } from 'react';

import { AIAssistantAdjustOptions, AIAssistantProps, AIAssistantStatus } from './AIAssistant';

export const useAiAssistantAdjustAndGenerate = (props: AIAssistantProps) => {
  const { generateCallback, adjustCallback, setValue, onPanelStatusChange, keywordsToInclude, keepShort, useHtml } =
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

  const onAdjustClick = (text: string, option: AIAssistantAdjustOptions, command?: string) => {
    setPanelStatus('writing');
    if (panelStatus !== 'writing') {
      adjustCallback(text, option, command, {
        keywordsToInclude: keywordsToInclude ?? [],
        useHtml: useHtml === true,
        keepShort,
      }).then(
        (generatedText) => {
          setGeneratedText(generatedText);
          setGeneratedCount(generatedCount + 1);
        },
        (error) => {
          console.error('Error while adjusting text ', error);
          setGeneratedText('');
          setGeneratedCount(generatedCount + 1);
        },
      );
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
