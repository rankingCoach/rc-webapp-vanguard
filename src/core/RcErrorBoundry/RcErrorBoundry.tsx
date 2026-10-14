import { alignItemsCenter, dFlexColumn, gap2, justifyContentCenter, p4 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { Accordion } from '@vanguard/Accordion/Accordion';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { IconSize } from '@vanguard/Icon/Icon';
import { ErrorModal } from '@vanguard/StandardModals/ErrorModal/ErrorModal';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { Component, ErrorInfo } from 'react';

export type ErrorBoundaryProps = {
  children: React.ReactNode;
  onError: (error?: Error, errorInfo?: ErrorInfo) => void;
  isModal?: boolean; // If true, will return the error as a modal
};

type ErrorBoundaryState = { error: any; errorInfo: any; hasError: boolean };

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
  }

  state: ErrorBoundaryState = {
    error: '',
    errorInfo: '',
    hasError: false,
  };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.log({ error, errorInfo });
    this.props.onError(error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    const { hasError, errorInfo } = this.state;
    const { isModal } = this.props;

    if (hasError) {
      if (isModal) {
        console.error('ErrorBoundary', errorInfo);
        return <ErrorModal close={() => location.reload()} source={'ErrorBoundry'} />;
      }

      return (
        <div className="card my-5">
          <div className={classNames(dFlexColumn, justifyContentCenter, gap2, alignItemsCenter, p4)}>
            <Text type={TextTypes.heading2} fontWeight={FontWeights.bold}>
              Aw, snap!
            </Text>
            <Text>An error occurred while processing your request</Text>
            <Button
              type={ButtonTypes.muted}
              size={ButtonSizes.extraLarge}
              onClick={() => {
                window.location.reload();
              }}
            >
              Reload page
            </Button>
            <Accordion
              variant={'outlined'}
              summaryCustomStyle={{ justifyContent: 'space-between', paddingLeft: '12px' }}
              baseCustomStyle={{ borderBottom: '1px solid var(--n200)', marginBottom: '1px', maxWidth: '100%' }}
              detailsCustomStyle={{ marginLeft: '12px', marginBottom: '16px' }}
              accordionId={'FrequentlyAskedQuestionsAccordion'}
              disableGutters={true}
              iconSize={IconSize.small}
              summaryChildren={
                <Text testId={'question'} fontWeight={FontWeights.medium}>
                  Error info:
                </Text>
              }
              detailsChildren={<Text testId={'answer'}>{errorInfo && errorInfo.componentStack.toString()}</Text>}
            />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
