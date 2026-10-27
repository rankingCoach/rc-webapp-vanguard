import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import {
  alignItemsCenter,
  cursorPointer,
  dFlex,
  dFlexRow,
  justifyContentBetween,
  mb1,
  mr2,
  mr3,
  positionRelative,
  w100,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import Collapse from '@mui/material/Collapse/Collapse';
import Fade from '@mui/material/Fade/Fade';
import Grow from '@mui/material/Grow';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { LottieAnimationLoader } from '@vanguard/LottieAnimationLoader/LottieAnimationLoader';
import { Render } from '@vanguard/Render/Render';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import { Textarea } from '@vanguard/Textarea/Textarea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// @ts-ignore
import animation from '../_assets/ai-loader-loop.json';
import { AIAssistantAdjustOptions, AIAssistantProps, AIAssistantStatus } from '../AIAssistant';
import styles from './AIAssistantPanel.module.scss';

export type AIAssistantPanelProps = Omit<AIAssistantProps, 'children' | 'anchorElem'> & {
  status?: AIAssistantStatus;
  setStatus?: (status: AIAssistantStatus) => void;
  anchorElem?: HTMLElement; // We'll position the panel relative to this element
  onGenerateClick?: (command?: string) => void; // Actual generation is done in parent component, but we need it also here
  onAdjustClick?: (text: string, option: AIAssistantAdjustOptions, command?: string) => void; // Same as with onGenerateClick prop, but for the adjust
  generateError?: boolean;
  onTextareaMouseDown?: () => void;
};

export const AIAssistantPanel = (props: AIAssistantPanelProps) => {
  const {
    id,
    value,
    setValue,
    className,
    status,
    setStatus,
    onGenerateClick,
    onAdjustClick,
    anchorElem,
    needsCommandOnGenerate,
    hasGenerateHashtagsAdjustOption, // TODO: Those two props should be moved to forbiddenAjustOptions logic
    hasIncludeKeywordsAdjustOption, // TODO: Those two props should be moved to forbiddenAjustOptions logic
    onKeepCallback,
    onCloseCallback,
    onTextareaMouseDown,
    forbiddenAjustOptions,
  } = props;

  const { SvgIcon: rcLogoSvg } = useDynamicImport('rc/rc_logo_gray.svg');

  const [toneOpen, setToneOpen] = useState(false);
  const [prevAction, setPrevAction] = useState<'generate' | 'adjust'>('generate');
  const [prevAdjustParams, setPrevAdjustParams] = useState<any>({});
  const adjustCommandRef = useRef<HTMLInputElement>(null);
  const generateCommandRef = useRef<HTMLInputElement>(null);

  /**
   * Key down event
   *  - ESC key (cancel's generation/adjustments)
   *  - Enter key (generates text)
   */
  const keyDownEv = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        setStatus && setStatus('closed');
      }
      if (event.key === 'Enter') {
        submitCommandInput();
      }
    },
    [value, prevAction, status],
  );
  useEffect(() => {
    document.addEventListener('keydown', keyDownEv, false);
    return () => {
      document.removeEventListener('keydown', keyDownEv, false);
    };
  }, [keyDownEv]);

  /**
   * Adjust options
   */
  const clickAdjustOption = (option: AIAssistantAdjustOptions) => {
    if (option === 'changeTone') {
      return;
    }
    setToneOpen(false);
    if (onAdjustClick) {
      const params = { value: value, option: option, command: adjustCommandRef.current?.value };
      onAdjustClick(params.value, params.option, params.command);
      setPrevAdjustParams({ value: params.value, option: params.option, command: params.command });
      setPrevAction('adjust');
      if (adjustCommandRef.current) {
        adjustCommandRef.current.value = '';
      }
    } else {
      console.error('clickAdjustOption: onAdjustClick not provided');
    }
  };

  /**
   * Submit command input
   */
  const submitCommandInput = () => {
    if (status === 'closed') {
      // Do nothing
    } else if (status === 'adjust') {
      clickAdjustOption('command');
    } else if (status === 'needsCommand') {
      onGenerateClick && onGenerateClick(generateCommandRef.current?.value);
      setPrevAction('generate');
    } else {
      console.error('submitCommandInput: status not supported', status);
    }
  };

  /**
   * Try Again
   */
  const onTryAgainClick = () => {
    if (prevAction === 'generate') {
      if (needsCommandOnGenerate) {
        onGenerateClick && onGenerateClick(generateCommandRef.current?.value);
        return;
      }
      onGenerateClick && onGenerateClick();
      return;
    }
    if (prevAction === 'adjust') {
      // console.log("adjust", prevAdjustParams?.value, prevAdjustParams?.option, prevAdjustParams?.command);
      onAdjustClick && onAdjustClick(prevAdjustParams?.value, prevAdjustParams?.option, prevAdjustParams?.command);
    }
  };

  /**
   * Remove
   */
  const onRemoveClick = () => {
    setValue('');
    setStatus && setStatus('closed');
  };

  /**
   * Return view
   * ---
   */
  return (
    <ApplyPortal anchorElem={anchorElem}>
      <div
        className={styles.portal}
        id={`${id}_Panel`}
        data-testid={`${id}_Panel`}
        style={{
          zIndex: 1100,
          transition: 'all 0.05s ease-in-out',
        }}
      >
        <Grow in={status !== 'closed'} timeout={350}>
          <div className={styles.topLine}>
            <div>
              <Fade in={status === 'writing'}>
                <div className={classNames(styles.container, styles.menu, className)}>
                  <StyledSVG width="13" height="16" src={rcLogoSvg} />
                  <div className={styles.animation}>
                    <LottieAnimationLoader src={animation} />
                  </div>

                  <Text type={TextTypes.textCaption} color={'--a1500'} className={mr3}>
                    {'writing'}
                  </Text>

                  <div className={styles.rightMenu}>
                    <Text>Stop</Text>
                    <Text color={'--n400'} fontSize={12} fontWeight={FontWeights.medium}>
                      ESC
                    </Text>
                  </div>
                </div>
              </Fade>
            </div>

            <div>
              <Fade in={status === 'open' || status === 'adjust' || status === 'needsCommand'}>
                <div className={classNames(styles.container, className)}>
                  <div className={styles.menu}>
                    <div className={classNames(dFlex, dFlexRow, alignItemsCenter, w100, justifyContentBetween)}>
                      <div className={classNames(dFlex, dFlexRow)}>
                        <StyledSVG width="13" height="16" src={rcLogoSvg} />
                        <Icon color={'--n400'}>{IconNames.ai}</Icon>

                        <Text type={TextTypes.textCaption} color={'--n400'} className={mr3}>
                          {'Assistant'}
                        </Text>
                      </div>
                      <div id={`${id}_ButtonClose`} className={styles.rightMenu}>
                        <Button
                          className={styles.x}
                          type={ButtonTypes.default}
                          size={ButtonSizes.medium}
                          iconLeft={IconNames.close}
                          iconColor={'--n500'}
                          iconHoverColor={'--n700'}
                          onClick={() => {
                            setStatus && setStatus('closed');
                            onCloseCallback && onCloseCallback();
                          }}
                        />
                      </div>
                    </div>
                    <Render if={status === 'open'}>
                      <Collapse in={status === 'open'}>
                        <Fade in={status === 'open'}>
                          <div className={styles.menu}>
                            <Button
                              size={ButtonSizes.medium}
                              type={ButtonTypes.muted}
                              iconLeft={IconNames.check}
                              onClick={() => {
                                setStatus && setStatus('closed');
                                onKeepCallback && onKeepCallback();
                              }}
                            >
                              {'Keep'}
                            </Button>

                            <Button
                              size={ButtonSizes.medium}
                              type={ButtonTypes.muted}
                              iconLeft={IconNames.audioSettings}
                              onClick={() => {
                                setStatus && setStatus('adjust');
                              }}
                            >
                              {'Adjust'}
                            </Button>

                            <Button
                              size={ButtonSizes.medium}
                              type={ButtonTypes.muted}
                              iconLeft={IconNames.refresh}
                              onClick={onTryAgainClick}
                            >
                              {'Try again'}
                            </Button>

                            <Button
                              size={ButtonSizes.medium}
                              type={ButtonTypes.muted}
                              iconLeft={IconNames.trash}
                              onClick={onRemoveClick}
                            />
                          </div>
                        </Fade>
                      </Collapse>
                    </Render>
                  </div>

                  <Collapse in={status === 'needsCommand'}>
                    <div className={styles.adjustContainer}>
                      <div
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          onTextareaMouseDown && onTextareaMouseDown();
                        }}
                      >
                        <Textarea
                          autoFocus={true}
                          inputRef={generateCommandRef}
                          placeholder={'Write commands to the Assistant'}
                          className={mb1}
                          minRows={1}
                          counter={false}
                          maxLength={255}
                          endAdornment={
                            <Icon
                              className={classNames(cursorPointer, mr2)}
                              onClick={() => submitCommandInput()}
                              color={'--n400'}
                              type={IconSize.large}
                            >
                              {IconNames.send}
                            </Icon>
                          }
                        />
                      </div>
                    </div>
                  </Collapse>

                  <Collapse in={status === 'adjust'}>
                    <div className={styles.adjustContainer}>
                      <div
                        onMouseDown={(event) => {
                          event.stopPropagation();
                          onTextareaMouseDown && onTextareaMouseDown();
                        }}
                      >
                        <Textarea
                          inputRef={adjustCommandRef}
                          placeholder={'Write commands to the Assistant'}
                          className={mb1}
                          minRows={1}
                          counter={false}
                          maxLength={255}
                          endAdornment={
                            <Icon
                              className={classNames(cursorPointer, mr2)}
                              onClick={() => submitCommandInput()}
                              color={'--n400'}
                              type={IconSize.large}
                            >
                              {IconNames.send}
                            </Icon>
                          }
                        />
                      </div>

                      <Render if={!forbiddenAjustOptions?.includes('expand')}>
                        <button
                          className={styles.adjustItem}
                          onMouseEnter={() => setToneOpen(false)}
                          onClick={() => clickAdjustOption('expand')}
                        >
                          <div className={styles.content}>
                            <Icon color={'--n500'}>{IconNames.maximize}</Icon>
                            <Text color={'--n500'}>Expand</Text>
                          </div>
                        </button>
                      </Render>

                      <Render if={!forbiddenAjustOptions?.includes('shorten')}>
                        <button
                          className={styles.adjustItem}
                          onMouseEnter={() => setToneOpen(false)}
                          onClick={() => clickAdjustOption('shorten')}
                        >
                          <div className={styles.content}>
                            <Icon color={'--n500'}>{IconNames.minimize}</Icon>
                            <Text color={'--n500'}>Shorten</Text>
                          </div>
                        </button>
                      </Render>

                      <Render if={!forbiddenAjustOptions?.includes('expand')}>
                        <div className={positionRelative}>
                          <button
                            className={styles.adjustItem}
                            onMouseEnter={() => setToneOpen(true)}
                            onClick={() => clickAdjustOption('changeTone')}
                          >
                            <div className={styles.content}>
                              <Icon color={'--n500'}>{IconNames.audioMicrophone}</Icon>
                              <Text color={'--n500'}>Change tone</Text>
                              <Icon color={'--n500'} className={styles.rightIcon}>
                                {IconNames.caretRight}
                              </Icon>
                            </div>
                          </button>

                          <Grow in={toneOpen} style={{ transformOrigin: 'top right' }}>
                            <div className={styles.dropdown}>
                              <button className={styles.adjustItem} onClick={() => clickAdjustOption('formal')}>
                                <div className={styles.content}>
                                  <Text color={'--n500'}>Formal</Text>
                                </div>
                              </button>
                              <button className={styles.adjustItem} onClick={() => clickAdjustOption('professional')}>
                                <div className={styles.content}>
                                  <Text color={'--n500'}>Professional</Text>
                                </div>
                              </button>
                              <button className={styles.adjustItem} onClick={() => clickAdjustOption('informative')}>
                                <div className={styles.content}>
                                  <Text color={'--n500'}>Informative</Text>
                                </div>
                              </button>
                              <button className={styles.adjustItem} onClick={() => clickAdjustOption('friendly')}>
                                <div className={styles.content}>
                                  <Text color={'--n500'}>Friendly</Text>
                                </div>
                              </button>
                              <button className={styles.adjustItem} onClick={() => clickAdjustOption('bold')}>
                                <div className={styles.content}>
                                  <Text color={'--n500'}>Bold</Text>
                                </div>
                              </button>
                              <button className={styles.adjustItem} onClick={() => clickAdjustOption('witty')}>
                                <div className={styles.content}>
                                  <Text color={'--n500'}>Witty</Text>
                                </div>
                              </button>
                            </div>
                          </Grow>
                        </div>
                      </Render>

                      <Render if={hasGenerateHashtagsAdjustOption}>
                        <button
                          className={styles.adjustItem}
                          onMouseEnter={() => setToneOpen(false)}
                          onClick={() => clickAdjustOption('generateHashtags')}
                        >
                          <div className={styles.content}>
                            <Icon color={'--n500'}>{IconNames.document}</Icon>
                            <Text color={'--n500'}>{'Generate hashtags '}</Text>
                          </div>
                        </button>
                      </Render>

                      <Render if={hasIncludeKeywordsAdjustOption}>
                        <button
                          className={styles.adjustItem}
                          onMouseEnter={() => setToneOpen(false)}
                          onClick={() => clickAdjustOption('includeKeywords')}
                        >
                          <div className={styles.content}>
                            <Icon color={'--n500'}>{IconNames.document}</Icon>
                            <Text color={'--n500'}>{'Integrate keywords'}</Text>
                          </div>
                        </button>
                      </Render>
                    </div>
                  </Collapse>
                </div>
              </Fade>
            </div>
          </div>
        </Grow>
      </div>
    </ApplyPortal>
  );
};

const ApplyPortal = ({ children, anchorElem }: { children: React.ReactElement; anchorElem?: HTMLElement }) => {
  if (anchorElem) {
    return createPortal(children, anchorElem ?? document.body);
  }
  return children;
};
