import { classNames } from '@helpers/classNames';
import { Tabs as MuiTabs, TabsProps as MuiTabsProps } from '@mui/material';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Tab, TabProps } from '@vanguard/Tabs/Tab/Tab';
import { TabPanel } from '@vanguard/Tabs/TabPanel/TabPanel';
import { TabsCustomScroll } from '@vanguard/Tabs/TabsCustomScroll/TabsCustomScroll';
import React, { useState } from 'react';

import styles from './Tabs.module.scss';

export type TabConfig = {
  theme?: 'highlight' | 'underline' | 'floating';
  tabNoMinWidth?: boolean;
  tabHeight?: 'tall' | 'small';
  padding?: 'default' | 'small';
  iconSize?: 'default' | 'small';
  tabGrow?: boolean;
  alignCenter?: boolean;
  tabTextTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
};

export interface TabsProps extends MuiTabsProps {
  tabs: TabProps[];
  className?: string;
  testId?: string;
  keepInactiveTabsInDom?: boolean;
  tabConfig?: TabConfig;
}

export const Tabs = (props: TabsProps) => {
  const { tabs, value, onChange, className, keepInactiveTabsInDom, testId, tabConfig: config } = props;

  const [tabValue, setTabValue] = useState(value ?? 0);

  const handleTabChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>, value: any) => {
    setTabValue(value);
    onChange && onChange(e, value);
  };

  const tabStyles = {
    ...(config?.tabHeight === 'small' && { minHeight: '36px', height: '36px' }),
    ...(config?.tabNoMinWidth === true && { minWidth: '0' }),
    ...(config?.padding === 'small' && { padding: '8px' }),
    ...(config?.tabGrow === false && { flexGrow: '0' }),
  };

  return (
    <ComponentContainer>
      <MuiTabs
        className={classNames(
          styles.tabsContainer,
          config?.theme === 'floating' ? styles.floating : undefined,
          className,
        )}
        scrollButtons="auto"
        ScrollButtonComponent={TabsCustomScroll}
        variant="scrollable"
        style={{
          ...(config?.alignCenter && {
            display: 'flex',
            alignItems: 'center',
          }),
        }}
        allowScrollButtonsMobile={true}
        value={value ?? tabValue}
        TabIndicatorProps={{
          style: {
            display: 'none',
          },
        }}
      >
        {tabs.map((tab, index) => {
          if (tab.disabled) {
            return null;
          }
          return (
            <Tab
              testId={`${testId}-${index}`}
              key={index}
              style={tabStyles}
              label={tab.label}
              value={tab.value ?? index}
              onClick={(e) => handleTabChange(e, tab.value ?? index)}
              selected={index === (value ?? tabValue)}
              tabIcons={tab.tabIcons}
              hasError={tab.hasError}
              tabConfig={config}
              showBackgroundColor={tab.showBackgroundColor}
              hasBorderBottom={tab.hasBorderBottom}
              simple={tab.simple}
            />
          );
        })}
      </MuiTabs>
      {tabs.map((tab, index) => (
        <TabPanel
          currentTab={value ?? tabValue}
          value={tab.value ?? index}
          key={index}
          keepInDom={keepInactiveTabsInDom}
        >
          {tab.component}
        </TabPanel>
      ))}
    </ComponentContainer>
  );
};
