/// <reference path="./global.d.ts" />
/// <reference types="vite/client" />

import { withLazy } from './helpers/with-lazy';

export * as VanguardStyle from './styles/general.module.tsx';

// Export styles helpers
export type { ComponentContainerProps } from './core/ComponentContainer/ComponentContainer.tsx';
export { ComponentContainer } from './core/ComponentContainer/ComponentContainer.tsx';
export * from './styles';

// Text
export { childrenAsText, childToString } from './core/Text/child-to-text';
export type { LinkReplacements, LinkReplacementsData, TextProps, TextReplacements } from './core/Text/Text';
export { FontWeights, Text, TextTypes } from './core/Text/Text';
export type { Props, SeeMoreConfig, TextWordBreak } from './core/Text/Text.types.tsx';
export type { TextAnimationProps } from './core/Text/text-animate-words-style.tsx';
export { applyWordAnimation } from './core/Text/text-animate-words-style.tsx';
export { parseFullLinks } from './core/Text/text-links-parser';
export type { TextWrapBalancerProps } from './core/Text/TextWrapBalancer/TextWrapBalancer';
export { TextWrapBalancer } from './core/Text/TextWrapBalancer/TextWrapBalancer';
export type { TextHighlightedProps } from './core/TextHighlighted/TextHighlighted';
export { TextHighlighted } from './core/TextHighlighted/TextHighlighted';

// TextIcon
export type { TextIconProps } from './common/TextIcon/TextIcon.tsx';
export { TextIcon } from './common/TextIcon/TextIcon.tsx';

// Textarea
export type { TextareaProps } from './core/Textarea/Textarea.tsx';
export { Textarea } from './core/Textarea/Textarea.tsx';

// Button
export type { ButtonProps, ButtonShape } from './core/Button/Button.tsx';
export { Button, ButtonSizes, ButtonTypes } from './core/Button/Button.tsx';

// Form
export { extractErrorScopes } from './core/Form/extract-error-scopes';
export type { FormStatus } from './core/Form/Form.tsx';
export { Form } from './core/Form/Form.tsx';
export { extractSetErrorsFromConfig } from './core/Form/FormElement/extract-set-errors-from-config';

// Input
export type { InputProps } from './core/Input/Input.tsx';
export { Input } from './core/Input/Input.tsx';

// Link
export type { LinkProps } from './core/Link/Link.tsx';
export { Link } from './core/Link/Link.tsx';

// Select
export type { SelectOnChange, SelectOptionProp, SelectOptionProps, SelectProps } from './core/Select/Select.tsx';
export type { SelectOptionsComponentProps } from './core/Select/Select.tsx';
export { Select } from './core/Select/Select.tsx';

// SearchableSelect
export type { SearchableSelectProps } from './core/SearchableSelect/SearchableSelect.tsx';
export { SearchableSelect } from './core/SearchableSelect/SearchableSelect.tsx';


// Tabs
export type { TabProps } from './core/Tabs/Tab/Tab.tsx';
export type { TabConfig, TabsProps } from './core/Tabs/Tabs.tsx';
export { Tabs } from './core/Tabs/Tabs.tsx';

// Icon
export type { IconProps } from './core/Icon/Icon.tsx';
export { Icon, IconSize } from './core/Icon/Icon.tsx';
export { IconNames } from './core/Icon/IconNames.ts';

// GeneratedWithAIPill
export type { GeneratedWithAIPillProps } from './common/GeneratedWithAIPill/GeneratedWithAIPill.tsx';
export { GeneratedWithAIPill } from './common/GeneratedWithAIPill/GeneratedWithAIPill.tsx';

// InfoBox
export type { InfoBoxProps } from './core/InfoBox/InfoBox.tsx';
export { InfoBox } from './core/InfoBox/InfoBox.tsx';

// Autocomplete
export type { AutocompleteProps } from './core/Autocomplete/Autocomplete.tsx';
export { Autocomplete } from './core/Autocomplete/Autocomplete.tsx';

// LottieAnimationLoader
export type {
  LottieAnimationLoaderProps,
  LottieAnimationType,
} from './core/LottieAnimationLoader/LottieAnimationLoader.tsx';
export { LottieAnimationLoader } from './core/LottieAnimationLoader/LottieAnimationLoader.tsx';

// ModalResponse
export type { ModalResponse } from './core/Modal/ModalResponse.ts';

// ModalRoot
export { ModalProvider, useModalContext } from './core/Modal/ModalContext.tsx';
export type { ModalResponseHandler, ModalState, StandardModalProps } from './core/Modal/ModalRoot/ModalRoot.tsx';
export { ModalRoot } from './core/Modal/ModalRoot/ModalRoot.tsx';

// ModalService
export type { ComponentWithId, ModalOpts } from './core/Modal/ModalService.tsx';
export { ModalService } from './core/Modal/ModalService.tsx';

// PageSectionLoading
export type { PageSectionLoadingProps } from './common/PageSectionLoading/PageSectionLoading.tsx';
export { PageSectionLoading } from './common/PageSectionLoading/PageSectionLoading.tsx';

// Popover
export type { PopoverPosition, PopoverProps, PopoverTheme } from './core/Popover/Popover.tsx';
export { Popover } from './core/Popover/Popover.tsx';

// Render
export type { RenderProps } from './core/Render/Render.tsx';
export { Render } from './core/Render/Render.tsx';

// Switch
export type { SwitchProps } from './core/Switch/Switch.tsx';
export { Switch } from './core/Switch/Switch.tsx';

// Skeleton
export type { SkeletonProps } from './core/Skeleton/Skeleton.tsx';
export { Skeleton, SkeletonTypes } from './core/Skeleton/Skeleton.tsx';

// TogglerWithText
export type { TogglerOption, TogglerState, TogglerWithTextProps } from './core/TogglerWithText/TogglerWithText.tsx';
export { TogglerWithText } from './core/TogglerWithText/TogglerWithText.tsx';

// EditableCard
export type { EditableCardProps, EditableCardTitleAIType } from './common/EditableCard/EditableCard.tsx';
export { EditableCard } from './common/EditableCard/EditableCard.tsx';

// StatusBadge
export type {
  StatusBadgeBoostStatus,
  StatusBadgeIconVariant,
  StatusBadgePostStatus,
  StatusBadgeProps,
  StatusBadgeReviewStatus,
  StatusBadgeStatus,
} from './core/StatusBadge/StatusBadge.tsx';
export { StatusBadge } from './core/StatusBadge/StatusBadge.tsx';
export type { StatusBadgeIconProps } from './core/StatusBadge/StatusBadgeIcon/StatusBadgeIcon.tsx';
export { StatusBadgeIcon } from './core/StatusBadge/StatusBadgeIcon/StatusBadgeIcon.tsx';

// TagList
export type { TagProps } from './core/TagList/Tag/Tag.tsx';
export { Tag } from './core/TagList/Tag/Tag.tsx';
export { TagType } from './core/TagList/Tag/TagType.enum.ts';
export { TagList } from './core/TagList/TagList.tsx';

// SlideTransition
export type { SlideTransitionProps } from './core/SlideTransition/SlideTransition.tsx';
export { SlideTransition } from './core/SlideTransition/SlideTransition.tsx';

// EditModal
export type { EditModalProps } from './core/CustomModals/EditModal/EditModal.tsx';
export { EditModal } from './core/CustomModals/EditModal/EditModal.tsx';
export { useFormConfig } from './custom-hooks/useFormConfig.ts';
export { classNames } from './helpers/classNames';


// AIOrb
export type { AIOrbProps } from './core/AIOrb/AIOrb.tsx';
export { AIOrb, AIOrbSize, AIOrbStatus } from './core/AIOrb/AIOrb.tsx';

// Accordion
export type { AccordionProps } from './core/Accordion/Accordion.tsx';
export { Accordion } from './core/Accordion/Accordion.tsx';

// CheckBox
export type { CheckBoxProps } from './core/CheckBox/CheckBox.tsx';
export { CheckBox } from './core/CheckBox/CheckBox.tsx';

