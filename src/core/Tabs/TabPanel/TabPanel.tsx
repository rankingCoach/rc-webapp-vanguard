import { Render } from '@vanguard/Render/Render';
import React from 'react';

export interface TabPanelProps {
  /** The currently selected tab value. Compared by strict equality with `value`. */
  currentTab: any;
  /** The value this panel belongs to. The panel is shown when it equals `currentTab`. */
  value: any;
  /** Keep the panel mounted when inactive (hidden with `display: none`) to preserve its state. */
  keepInDom?: boolean;
  /** Panel content. */
  children?: React.ReactNode;
  /** DOM id of the panel element; pair with the tab's `aria-controls`. */
  id?: string;
  /** Id of the tab element labelling this panel (rendered as `aria-labelledby`). */
  labelledBy?: string;
  /** Extra class name applied to the panel element. */
  className?: string;
  /** Value of the `data-testid` attribute on the panel element. */
  testId?: string;
}

export const TabPanel = (props: TabPanelProps) => {
  const { currentTab, value, children, keepInDom, id, labelledBy, className, testId } = props;

  return (
    <Render if={currentTab === value} keepInDom={keepInDom}>
      <div role="tabpanel" id={id} aria-labelledby={labelledBy} className={className} data-testid={testId}>
        {children}
      </div>
    </Render>
  );
};
