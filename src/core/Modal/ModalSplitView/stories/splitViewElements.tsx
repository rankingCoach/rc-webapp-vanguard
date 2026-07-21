import { SplitViewElement } from '@vanguard/Modal/ModalSplitView/ModalSplitView';
import React from 'react';

export const splitViewElements: [SplitViewElement, SplitViewElement] = [
  {
    fullWidth: '100%',
    contractedWidth: '30%',
    component: <div style={{ width: '100%', height: '100%', backgroundColor: 'red' }}>LEFT</div>,
  },
  {
    fullWidth: '70%',
    contractedWidth: '70%',
    component: <div style={{ width: '100%', height: '100%', backgroundColor: 'blue' }}>RIGHT</div>,
  },
];
