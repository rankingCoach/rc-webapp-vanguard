import './Loader.scss';

import React from 'react';

import { ComponentContainer } from '../ComponentContainer/ComponentContainer';

interface Props {
  loading: boolean;
  testId?: string;
}

export const Loader = (props: Props) => {
  const { loading, testId } = props;

  if (!loading) {
    return null;
  }

  return (
    <ComponentContainer className={'Loader-container'} testId={testId} data-slot={'loader-container'}>
      <div className="loading" data-slot={'loader'}>
        <div className="uil-ring-css">
          <div />
        </div>
      </div>
    </ComponentContainer>
  );
};
