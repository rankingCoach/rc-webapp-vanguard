import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { useTabsIndicator } from '@vanguard/Tabs/hooks/use-tabs-indicator';
import { useTabsKeyboard } from '@vanguard/Tabs/hooks/use-tabs-keyboard';
import { useTabsScroll } from '@vanguard/Tabs/hooks/use-tabs-scroll';
import { omitProps, Tab, TabProps } from '@vanguard/Tabs/Tab/Tab';
import { TabPanel } from '@vanguard/Tabs/TabPanel/TabPanel';
import { TabsCustomScroll } from '@vanguard/Tabs/TabsCustomScroll/TabsCustomScroll';
import React, { useId, useRef, useState } from 'react';

import styles from './Tabs.module.scss';

/** Visual configuration shared by all tabs of a `Tabs` bar. */
export type TabConfig = {
  /** Visual theme of the bar. Defaults to `'highlight'`. */
  theme?: 'highlight' | 'underline' | 'floating';
  /** Removes the 90px minimum width of each tab. */
  tabNoMinWidth?: boolean;
  /** `'small'` renders 36px high tabs. `'tall'` (default) keeps the 48px minimum. */
  tabHeight?: 'tall' | 'small';
  /** `'small'` applies an 8px padding to each tab. */
  padding?: 'default' | 'small';
  /** Size of the `tabIcons` avatars: `'small'` renders xs avatars. */
  iconSize?: 'default' | 'small';
  /** `false` prevents tabs from growing to fill the bar (themes that grow by default). */
  tabGrow?: boolean;
  /** Vertically centers the bar content. */
  alignCenter?: boolean;
  /** Text transform applied to the tab labels. Defaults to `'none'`. */
  tabTextTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
};

/** Change handler of `Tabs`. `value` is the clicked tab's `value` (or its index when the tab has no value). */
export type TabsChangeHandler = (event: React.SyntheticEvent, value: any) => void;

/** Keys of {@link TabConfig}; each can also be passed as a flat prop on `Tabs`. */
const TAB_CONFIG_KEYS: (keyof TabConfig)[] = [
  'theme',
  'tabNoMinWidth',
  'tabHeight',
  'padding',
  'iconSize',
  'tabGrow',
  'alignCenter',
  'tabTextTransform',
];

/** Props consumed by `Tabs` itself (not forwarded to the bar root element). */
const TABS_OWN_KEYS = [
  ...TAB_CONFIG_KEYS,
  'tabs',
  'value',
  'onChange',
  'className',
  'testId',
  'keepInactiveTabsInDom',
  'tabConfig',
  'selectionFollowsFocus',
  'onValueChange',
  'ariaLabel',
  'wrapperClassName',
  'tabListClassName',
  'aria-label',
  'aria-labelledby',
] as const;

/**
 * Props of `Tabs`. Every {@link TabConfig} key (`theme`, `tabHeight`, `padding`, ...) can be passed as a flat prop;
 * the same key in `tabConfig` takes precedence. Remaining HTML attributes (`id`, `style`, `data-*`, ...) are
 * forwarded to the tab-bar root element (the element receiving `className`).
 */
export interface TabsProps extends TabConfig, Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'children'> {
  /** Ref to the tab-bar root element (the element receiving `className`). */
  ref?: React.Ref<HTMLDivElement>;
  /** Tab definitions. Disabled tabs are hidden from the bar. */
  tabs: TabProps[];
  /**
   * Value of the selected tab, matched against each tab's `value` (or its index when the tab has no value).
   * When `undefined` the component keeps its own selection state, starting at `0`.
   */
  value?: any;
  /** Called on every tab click, including clicks on the already-selected tab. */
  onChange?: TabsChangeHandler;
  /** Class name applied to the tab-bar root element (not the outer wrapper). */
  className?: string;
  /** Base test id: each tab label gets `data-testid="${testId}-${index}"` (index in the `tabs` array). */
  testId?: string;
  /** Keep inactive panels mounted (hidden with `display: none`) so their state is preserved. */
  keepInactiveTabsInDom?: boolean;
  /**
   * Visual configuration (theme, sizes, paddings...) shared by all tabs. Same keys as the flat props; a key set
   * here wins over the flat prop.
   */
  tabConfig?: TabConfig;
  /** When true, moving focus with the keyboard also selects the focused tab (automatic activation). */
  selectionFollowsFocus?: boolean;
  /** Convenience callback fired together with `onChange`, with the value first. */
  onValueChange?: (value: any, event: React.SyntheticEvent) => void;
  /** Accessible name of the tablist. Same as passing `aria-label`. */
  ariaLabel?: string;
  /** Class name applied to the outer element wrapping the bar and the panels. */
  wrapperClassName?: string;
  /** Class name applied to the `role="tablist"` element. */
  tabListClassName?: string;
}

/** Tab-definition props forwarded to the tab button besides `aria-*`, `data-*` and `on*` event handlers. */
const FORWARDED_TAB_KEYS = new Set(['className', 'style', 'title', 'ref', 'lang', 'dir']);
/** Handled by `Tabs` itself even though they look like forwardable handlers. */
const NON_FORWARDED_TAB_HANDLERS = new Set(['onClick', 'onFocus']);

/**
 * Picks the attributes of a tab definition that are forwarded to its `<button>`. Tab objects are often built from
 * domain data (`{ ...item, label }`), so unknown fields are dropped instead of leaking onto the DOM.
 */
const pickForwardedTabProps = (tab: TabProps): Partial<TabProps> => {
  const forwarded: Record<string, unknown> = {};
  Object.keys(tab).forEach((key) => {
    const isHandler = /^on[A-Z]/.test(key) && !NON_FORWARDED_TAB_HANDLERS.has(key);
    if (FORWARDED_TAB_KEYS.has(key) || key.startsWith('aria-') || key.startsWith('data-') || isHandler) {
      forwarded[key] = (tab as Record<string, unknown>)[key];
    }
  });
  return forwarded as Partial<TabProps>;
};

const resolveValue = (tab: TabProps, index: number) => tab.value ?? index;

export const Tabs = (props: TabsProps) => {
  const {
    tabs,
    value,
    onChange,
    className,
    keepInactiveTabsInDom,
    testId,
    tabConfig,
    selectionFollowsFocus = false,
    onValueChange,
    ariaLabel,
    wrapperClassName,
    tabListClassName,
  } = props;
  const rootProps: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> } = omitProps(
    props,
    TABS_OWN_KEYS,
  );

  // Flat config props, overridden key by key by `tabConfig`.
  const config: TabConfig = {};
  TAB_CONFIG_KEYS.forEach((key) => {
    const resolved = tabConfig?.[key] ?? props[key];
    if (resolved !== undefined) {
      (config as Record<string, unknown>)[key] = resolved;
    }
  });

  const baseId = useId();
  const [internalValue, setInternalValue] = useState<any>(value ?? 0);
  const currentValue = value ?? internalValue;

  const tabList = tabs ?? [];
  const visibleTabs = tabList.map((tab, index) => ({ tab, index })).filter(({ tab }) => !tab.disabled);
  const hasSelectedVisibleTab = visibleTabs.some(({ tab, index }) => resolveValue(tab, index) === currentValue);

  const getTabId = (tab: TabProps, index: number) => tab.id ?? `${baseId}-tab-${index}`;
  const getPanelId = (index: number) => `${baseId}-panel-${index}`;

  const layoutKey = visibleTabs.map(({ tab, index }) => `${index}:${String(resolveValue(tab, index))}`).join('|');
  const isFloating = config.theme === 'floating';

  const { scrollerRef, listRef, canScrollStart, canScrollEnd, isOverflowing, onScroll, scrollToStart, scrollToEnd } =
    useTabsScroll({
      currentValue,
      layoutKey,
      measureKey: config.theme,
    });

  // Floating theme: one chip glides to the selected tab instead of each tab painting its own selected fill.
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const indicator = useTabsIndicator({ listRef, indicatorRef, enabled: isFloating, currentValue, layoutKey });

  const selectValue = (nextValue: any, event: React.SyntheticEvent) => {
    setInternalValue(nextValue);
    onChange?.(event, nextValue);
    onValueChange?.(nextValue, event);
  };

  const handleKeyDown = useTabsKeyboard({ listRef });

  // selectionFollowsFocus (MUI parity): select a tab when it receives keyboard focus (arrow keys, Home/End or
  // tabbing into the bar). Focus caused by a pointer press is skipped so a click does not fire onChange twice.
  const pointerFocusRef = useRef(false);
  const markPointerFocus = (): void => {
    pointerFocusRef.current = true;
  };

  const isPanelInDom = (tab: TabProps, index: number) =>
    tab.component !== undefined && (keepInactiveTabsInDom || resolveValue(tab, index) === currentValue);

  return (
    <ComponentContainer className={wrapperClassName}>
      <div
        {...rootProps}
        className={classNames(
          styles.tabsContainer,
          isFloating ? styles.floating : '',
          config.alignCenter ? styles.alignCenter : '',
          className ?? '',
        )}
      >
        {isOverflowing && (
          <TabsCustomScroll
            direction="left"
            disabled={!canScrollStart}
            onClick={scrollToStart}
            className={styles.scrollButton}
            testId={testId ? `${testId}-scroll-left` : undefined}
          />
        )}
        <div ref={scrollerRef} className={styles.scroller} onScroll={onScroll}>
          <div
            ref={listRef}
            role="tablist"
            aria-orientation="horizontal"
            aria-label={ariaLabel ?? props['aria-label']}
            aria-labelledby={props['aria-labelledby']}
            className={classNames(styles.tabList, tabListClassName ?? '')}
            onKeyDown={(event) => {
              pointerFocusRef.current = false;
              handleKeyDown(event);
            }}
            onPointerDown={markPointerFocus}
            onMouseDown={markPointerFocus}
            onPointerUp={() => {
              // Focus (if any) happens on press; clear afterwards so a press that focused nothing (e.g. the gap
              // between tabs) does not suppress the next keyboard focus.
              window.setTimeout(() => {
                pointerFocusRef.current = false;
              });
            }}
          >
            {indicator && (
              <span
                ref={indicatorRef}
                aria-hidden="true"
                className={styles.indicator}
                style={{
                  width: indicator.width,
                  height: indicator.height,
                  translate: `${indicator.left}px ${indicator.top}px`,
                }}
              />
            )}
            {visibleTabs.map(({ tab, index }, visibleIndex) => {
              const tabValue = resolveValue(tab, index);
              const selected = tabValue === currentValue;
              const focusable = selected || (!hasSelectedVisibleTab && visibleIndex === 0);
              const forwardedProps = pickForwardedTabProps(tab);

              return (
                <Tab
                  {...forwardedProps}
                  key={index}
                  id={getTabId(tab, index)}
                  aria-controls={isPanelInDom(tab, index) ? getPanelId(index) : tab['aria-controls']}
                  tabIndex={focusable ? 0 : -1}
                  testId={testId ? `${testId}-${index}` : tab.testId}
                  label={tab.label}
                  tabIcons={tab.tabIcons}
                  hasError={tab.hasError}
                  tabConfig={config}
                  selected={selected}
                  hasIndicator={indicator !== null}
                  onClick={(event: React.MouseEvent<HTMLDivElement>) => {
                    pointerFocusRef.current = false;
                    selectValue(tabValue, event);
                    tab.onClick?.(event);
                  }}
                  onFocus={(event: React.FocusEvent<HTMLDivElement>) => {
                    const fromPointer = pointerFocusRef.current;
                    pointerFocusRef.current = false;
                    if (selectionFollowsFocus && !selected && !fromPointer) {
                      selectValue(tabValue, event);
                    }
                    tab.onFocus?.(event);
                  }}
                />
              );
            })}
          </div>
        </div>
        {isOverflowing && (
          <TabsCustomScroll
            direction="right"
            disabled={!canScrollEnd}
            onClick={scrollToEnd}
            className={styles.scrollButton}
            testId={testId ? `${testId}-scroll-right` : undefined}
          />
        )}
      </div>
      {tabList.map((tab, index) =>
        tab.component === undefined ? null : (
          <TabPanel
            key={index}
            id={getPanelId(index)}
            labelledBy={tab.disabled ? undefined : getTabId(tab, index)}
            currentTab={currentValue}
            value={resolveValue(tab, index)}
            keepInDom={keepInactiveTabsInDom}
          >
            {tab.component}
          </TabPanel>
        ),
      )}
    </ComponentContainer>
  );
};
