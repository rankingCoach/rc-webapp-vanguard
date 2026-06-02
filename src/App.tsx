import './App.css';

import { alignItemsCenter, dFlex, gap1, justifyContentCenter, mb3 } from '@globalStyles';
import { AIOrb, AIOrbSize, AIOrbStatus } from '@vanguard/AIOrb/AIOrb.tsx';
import { Button, ButtonTypes } from '@vanguard/Button/Button.tsx';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer.tsx';
import { CreditCard, CreditCardType } from '@vanguard/CreditCard/CreditCard';
import { EditModal } from '@vanguard/CustomModals/EditModal/EditModal.tsx';
import { Form } from '@vanguard/Form/Form.tsx';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Input } from '@vanguard/Input/Input.tsx';
import { LottieAnimationLoader } from '@vanguard/LottieAnimationLoader/LottieAnimationLoader.tsx';
import { Menu, MenuItemConfig } from '@vanguard/Menu/Menu';
import { ModalProvider } from '@vanguard/Modal/ModalContext.tsx';
import { ModalResponse } from '@vanguard/Modal/ModalResponse.ts';
import { ModalRoot, StandardModalProps } from '@vanguard/Modal/ModalRoot/ModalRoot.tsx';
import { ModalService } from '@vanguard/Modal/ModalService.tsx';
import { SearchableSelect } from '@vanguard/SearchableSelect/SearchableSelect';
import { Select } from '@vanguard/Select/Select.tsx';
import { SlideTransition } from '@vanguard/SlideTransition/SlideTransition.tsx';
import { TagType } from '@vanguard/TagList/Tag/TagType.enum';
import { TagList } from '@vanguard/TagList/TagList.tsx';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text.tsx';
import { TogglerWithText, TogglerWithTextProps } from '@vanguard/TogglerWithText/TogglerWithText.tsx';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import * as aiLoaderLoop from './assets/ai-loader-loop.json';
import * as loadingOptimization from './assets/loading-optimization.json';
import { MainStore, MainStorePersistor } from './main.store';

export const ANIMATION_SPEED_MODIFIER = 1;
const WELCOME_TEXT = 'Your project setup is now complete';
const SUMMARY_TEXT = 'Here is a summary';
export const WELCOME_TEXTS = [
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
  WELCOME_TEXT,
  SUMMARY_TEXT,
];
export const TEXT_FADE_ANIMATION_DURATION = 50 * ANIMATION_SPEED_MODIFIER;
export const TEXT_WELCOME_ANIMATION_WAIT_BETWEEN_COMPONENTS = 2000 * ANIMATION_SPEED_MODIFIER;
export const TEXT_WELCOME_ANIMATION_ANIMATION_DURATION = 250 * ANIMATION_SPEED_MODIFIER;
export const TEXT_AND_ANIMATION_INTERPOLATION_DURATION = 500 * ANIMATION_SPEED_MODIFIER;
export const ANIMATION_BETWEEN_WELCOME_TEXT_AND_BODY_WAIT =
  (WELCOME_TEXTS.length - 1) * TEXT_WELCOME_ANIMATION_WAIT_BETWEEN_COMPONENTS +
  (WELCOME_TEXTS.length - 1) * TEXT_WELCOME_ANIMATION_ANIMATION_DURATION -
  TEXT_AND_ANIMATION_INTERPOLATION_DURATION;
export const TRANSITION_CARD_ANIMATION_IN_DURATION: number = 500 * ANIMATION_SPEED_MODIFIER;
export const TRANSITION_CARD_ANIMATION_DELAY_DURATION: number = 5000 * ANIMATION_SPEED_MODIFIER;
export const BOTTOM_TEXT_DELAY: number = 2500 * ANIMATION_SPEED_MODIFIER;
export const BOTTOM_TEXT_DELAY_EXTRA: number = 1000 * ANIMATION_SPEED_MODIFIER;
export const BOTTOM_TEXT_IN_AND_OUT: number = 250 * ANIMATION_SPEED_MODIFIER;
export const BOTTOM_TEXT_WORD_IN: number = 300 * ANIMATION_SPEED_MODIFIER;
export const INITIAL_SCROLL_DELAY: number = 350 * ANIMATION_SPEED_MODIFIER;
export const SMOOTH_SCROLL_DURATION: number = 1000 * ANIMATION_SPEED_MODIFIER;
export const END_ANIMATION_DELAY: number = TRANSITION_CARD_ANIMATION_DELAY_DURATION;
export const BODY_SCROLL_UP_IN: number = 1000 * ANIMATION_SPEED_MODIFIER;
export const BODY_AFTER_SCROLL_UP_TRANSITION_DELAY: number = 50 * ANIMATION_SPEED_MODIFIER;
export const FADE_BACK_IN_AFTER_SCROLL_UP: number = 500 * ANIMATION_SPEED_MODIFIER;

export const App = () => {
  const ToggleWithNode = (props: TogglerWithTextProps): React.ReactElement => {
    const Left = (): React.ReactElement => {
      return (
        <div className={classNames(dFlex, alignItemsCenter, gap1)}>
          <Text>Annual</Text>
          <Text color={'--a3500'} type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
            Save 33%
          </Text>
        </div>
      );
    };

    return (
      <div>
        <TogglerWithText
          {...props}
          left={{ component: Left(), value: 'Annual' }}
          right={'Monthly'}
          togglerState={'left'}
        />
      </div>
    );
  };

  const CustomEditModal = (props: StandardModalProps<null>): React.ReactElement => {
    const { close } = props;
    return (
      <EditModal
        title={'Edit business details'}
        close={close}
        closeOnSave={false}
        savable={false}
        saveCallback={(): void => {}}
        cancelCallback={(): void => {}}
        savingInProgress={true}
        requestGotError={true}
        testId={'business-profile-details-edit-modal'}
      >
        Some content
      </EditModal>
    );
  };

  const openModal = (): void => {
    const modalId = ModalService.open(
      <CustomEditModal
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        close={function (_: ModalResponse<null>): void {
          ModalService.closeEv(modalId);
        }}
      />,
    );
  };

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedMenuKey, setSelectedMenuKey] = useState<string>('document');

  const menuItems: MenuItemConfig[] = (
    [
      { key: 'edit', children: 'Edit', icon: IconNames.edit, iconPosition: 'before' },
      {
        key: 'document',
        children: 'Document',
        icon: IconNames.document,
        iconPosition: 'before',
        useActiveIcon: 'document' === selectedMenuKey,
      },
      { key: 'share', children: 'Share', icon: IconNames.share, iconPosition: 'before' },
      { key: 'delete', children: 'Delete', icon: IconNames.trash, iconPosition: 'before', disabled: true },
    ] as MenuItemConfig[]
  ).map((item) => ({
    ...item,
    selected: item.key === selectedMenuKey,
    onClick: () => {
      setSelectedMenuKey(item.key as string);
      setMenuAnchorEl(null);
    },
  })) as MenuItemConfig[];

  const isGenerating = true;

  return (
    <Provider store={MainStore}>
      <PersistGate persistor={MainStorePersistor}>
        <ModalProvider>
          <ModalRoot />
          <h2>Sample form</h2>

          <AIOrb
            state={isGenerating ? AIOrbStatus.Thinking : AIOrbStatus.Waiting}
            className={classNames(mb3)}
            size={AIOrbSize.Large}
          />

          <ComponentContainer style={{ width: '30px' }}>
            <LottieAnimationLoader src={aiLoaderLoop} />
          </ComponentContainer>
          <ComponentContainer style={{ width: '250px' }}>
            <LottieAnimationLoader src={loadingOptimization} />
          </ComponentContainer>

          <ComponentContainer style={{ height: '80px', width: '800px', boxSizing: 'content-box' }}>
            <div className={classNames(dFlex, alignItemsCenter, justifyContentCenter)} style={{ height: '70px' }}>
              <SlideTransition
                waitBetweenComponents={TEXT_WELCOME_ANIMATION_WAIT_BETWEEN_COMPONENTS}
                duration={TEXT_WELCOME_ANIMATION_ANIMATION_DURATION}
              >
                {WELCOME_TEXTS.map((txt) => {
                  return (
                    <Text
                      key={txt}
                      type={TextTypes.heading1}
                      fontWeight={FontWeights.bold}
                      //textWrap={"no-wrap"}
                      textAlign={'center'}
                      animateWords={{
                        animation: 'fade-up',
                        duration: TEXT_FADE_ANIMATION_DURATION,
                        delay: 150,
                      }}
                    >
                      {txt}
                    </Text>
                  );
                })}
              </SlideTransition>
            </div>
          </ComponentContainer>

          <Form onChange={() => null} className={'class-form'}>
            <Input label={'Business name'} testId={'business-profile-details-edit-name'} />
            <Input label={'Business email'} testId={'business-profile-details-edit-email'} />
            <Select
              label={'Industry'}
              onChange={() => {
                ModalService.open(<CustomEditModal close={() => {}} />);
              }}
              options={[
                {
                  key: 'A',
                  value: 'A',
                  title: 'Option A',
                },
                {
                  key: 'B',
                  value: 'B',
                  title: 'Option B',
                },
                {
                  key: 'C',
                  value: 'C',
                  title: 'Option C',
                },
              ]}
            />
          </Form>

          <ComponentContainer>
            <Button type={ButtonTypes.primary} onClick={openModal}>
              Open modal
            </Button>
          </ComponentContainer>

          <ComponentContainer>
            <TagList
              tags={[
                {
                  id: 1,
                  text: 'Tag 1',
                  type: TagType.default,
                  hasDeleteBtn: true,
                  deleteBtnCallback: (): void => {},
                },
                {
                  id: 2,
                  text: 'Tag 2',
                  type: TagType.primary,
                  hasDeleteBtn: true,
                  deleteBtnCallback: (): void => {},
                },
                {
                  id: 3,
                  text: 'Tag 3',
                  type: TagType.default,
                  hasDeleteBtn: true,
                  deleteBtnCallback: (): void => {},
                },
              ]}
            />
          </ComponentContainer>

          <ComponentContainer>
            <ToggleWithNode left={'A'} right={'B'} togglerState={'left'} />
          </ComponentContainer>

          <ComponentContainer>
            <CreditCard type={CreditCardType.Visa} disabled={false} small={true} />
          </ComponentContainer>

          <ComponentContainer>
            <Button onClick={(e) => setMenuAnchorEl(e.currentTarget as HTMLElement)}>Open Menu</Button>
            <Menu
              anchorEl={menuAnchorEl}
              open={Boolean(menuAnchorEl)}
              onClose={() => setMenuAnchorEl(null)}
              items={menuItems}
            />
          </ComponentContainer>

          <SearchableSelect
            options={[
              { value: 1, title: 'A', key: 1 },
              { value: 2, title: 'B', key: 2 },
              { value: 3, title: 'C', key: 3 },
              { value: 4, title: 'D', key: 4 },
              { value: 5, title: 'E', key: 5 },
              { value: 6, title: 'F', key: 6 },
              { value: 7, title: 'G', key: 7 },
              { value: 8, title: 'H', key: 8 },
              { value: 9, title: 'I', key: 9 },
              { value: 10, title: 'J', key: 10 },
            ]}
          />
        </ModalProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;
