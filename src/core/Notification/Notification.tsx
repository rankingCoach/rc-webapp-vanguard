import './Notification.scss';

import * as React from 'react';
import { ReactElement, ReactNode } from 'react';

import { Avatar, AvatarIcon } from '../Avatar/Avatar';
import { NotificationSource } from '../NotificationSource/NotificationSource';
import { Text, TextTypes } from '../Text/Text';
import { ContentPlaceholder } from './ContentPlaceholder/ContentPlaceholder';
import { NotificationAction, NotificationActionProps } from './NotificationAction/NotificationAction';

export type NotificationProps = {
  isCompetitor: boolean;
  title: string | ReactElement;
  date: string;
  actions?: Array<NotificationActionProps>;
  icon?: AvatarIcon;
  children?: ReactNode;
};

const getSourceFromCompetitor = (isCompetitor: boolean): 'competitor' | 'own' => {
  return isCompetitor ? 'competitor' : 'own';
};

const NotificationHeader = (props: NotificationProps) => {
  const { isCompetitor, title, date, icon = 'notificationbell' } = props;
  const source = isCompetitor ? 'competitor' : 'own';

  return (
    <div data-slot={'notification-header'} className={'notif-header'}>
      <div className={'notif-header-left'}>
        <div className={'notif-top-container'}>
          <div className={'notif-left-container'}>
            <Avatar icon={icon} />
            <div data-slot={'notification-header-title'} className={'notif-title-container'}>
              <Text className={'notif-title notif-text'} type={TextTypes.textIntro}>
                {title || 'Notification title'}
              </Text>
              <div data-slot={'notification-header-meta'} className={'notif-bottom-texts'}>
                <Text
                  textWrap={'no-wrap'}
                  color={'--n400'}
                  className={'notif-date notif-text'}
                  type={TextTypes.textCaption}
                >
                  {date || '10.01.2020'} &#8226; {'Source'} &#8226;&nbsp;
                </Text>
                <NotificationSource source={source} />
              </div>
            </div>
          </div>
          <div className={'notif-right-container'}>
            {/* @todo Reimplement with a Button and the new DropdownMenu */}
            {/*<DropdownMenu*/}
            {/*  items={[*/}
            {/*    {*/}
            {/*      label: "Clone",*/}
            {/*      icon: IconNames.add,*/}
            {/*      onClick: () => alert("Clone"),*/}
            {/*    },*/}
            {/*    {*/}
            {/*      label: "Share",*/}
            {/*      icon: IconNames.share,*/}
            {/*      onClick: () => alert("Share"),*/}
            {/*    },*/}
            {/*    {*/}
            {/*      label: "Delete",*/}
            {/*      icon: IconNames.trash,*/}
            {/*      onClick: () => alert("Delete"),*/}
            {/*    },*/}
            {/*  ]}*/}
            {/*/>*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Notification = (props: NotificationProps) => {
  const { children, isCompetitor, actions = [] } = props;

  return (
    <div data-slot={'notification'} className={`notif-body ${getSourceFromCompetitor(isCompetitor)}`}>
      <NotificationHeader {...props} />
      <div data-slot={'notification-content'} className={'notif-content-container'}>
        {children && typeof children !== 'string' ? children : <ContentPlaceholder />}
        AICI
      </div>
      <div data-slot={'notification-actions'} className={'notif-actions-container'}>
        {actions.map((action, index) => {
          return <NotificationAction key={index} {...action} width={100 / actions.length} />;
        })}
      </div>
    </div>
  );
};
