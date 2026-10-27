import { AIBudgetEnd } from '@common/AIBudgetEnd/AIBudgetEnd';
import { aiBudgetExceededMessage } from '@common/AIBudgetEnd/AIBudgetEnd.data';
import { Validations } from '@config/validations';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { dFlex, flexGrow1, gap1, justifyContentBetween, mb1, mb2, mt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { getPathId } from '@helpers/get-path-id';
import {
  FacebookComment,
  FacebookCommentSocialMediaSourceType,
} from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Facebook/Locations/Comments/FacebookComment';
import { FacebookAccountProfile } from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Facebook/Locations/Connection/Token/FacebookAccountProfile';
import {
  InstagramComment,
  InstagramCommentSocialMediaSourceType,
} from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Instagram/Locations/Comments/InstagramComment';
import { SocialMediaCommentObjectType } from '@models/swagger/App/Domain/Presence/Entities/Locations/Comments/SocialMediaComment';
import { SocialUserObjectType } from '@models/swagger/App/Domain/Presence/Entities/Social/SocialUser';
import { SocialMediaCommentReplyAIGenerateResponseDto } from '@models/swagger/App/Presentation/Api/Client/Presence/Locations/Dtos/Comments/SocialMediaCommentReplyAIGenerateResponseDto';
import { supportService } from '@services/support.service';
import { PresenceStore, presenceStore } from '@stores/swagger/client/PresenceStore';
import { AIAssistant } from '@vanguard/AIAssistant/AIAssistant';
import { Avatar } from '@vanguard/Avatar/Avatar';
import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Render } from '@vanguard/Render/Render';
import { ErrorModal } from '@vanguard/StandardModals/ErrorModal/ErrorModal';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import { Textarea } from '@vanguard/Textarea/Textarea';
import moment from 'moment/moment';
import React, { Suspense, useEffect, useState } from 'react';
import { first } from 'rxjs';

import styles from './ReplyCommentItemForm.module.scss';

export type ReplyCommentItemFormProps = {
  comment?: FacebookComment | InstagramComment;
  actionFinished?: () => void;
  mostRecent?: boolean;
  isAddingACommentReply: boolean;
  commentExternalId: string;
  facebookPageExternalId: string;
  instagramPageExternalId: string;
  instagram: {
    name?: string;
    profilePictureUrl?: string;
  };
  facebook: {
    profile?: FacebookAccountProfile;
    connectedPage?: string;
    pageProfilePictureUrl?: string;
  };
  isFbConnected: boolean;
  isInstagramConnected: boolean;
};

export const ReplyCommentItemForm = (props: ReplyCommentItemFormProps) => {
  const {
    comment,
    actionFinished,
    mostRecent,
    isAddingACommentReply,
    facebookPageExternalId,
    instagramPageExternalId,
    instagram,
    facebook,
    isInstagramConnected,
    isFbConnected,
  } = props;
  const dispatch = useAppDispatch();

  const canGenerateReply = true; // get from feature flags

  /**
   * Reply Form
   */
  const [text, setText] = useState('');
  const [panelStatus, setPanelStatus] = useState<string>('closed');

  const [disableReplyButton, setDisableReplyButton] = useState(true);
  const [customerName, setCustomerName] = useState<string | undefined>(undefined);
  const [customerLogo, setCustomerLogo] = useState<string | undefined>(undefined);
  const [pageExternalId, setPageExternalId] = useState<string | undefined>(undefined);

  // const { isAddingACommentReply, commentExternalId } = useSelector(
  //   (state: EngagementDashboardState) => state.EngagementPostsList,
  // );
  // const { facebookPageExternalId, instagramPageExternalId, instagram, facebook, isFbConnected, isInstagramConnected } =
  //   useSelector((state: EngagementDashboardState) => state.EngagementCreatePost);

  useEffect(() => {
    if (isFbConnected && comment?.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK) {
      setCustomerName(facebook?.connectedPage);
      setPageExternalId(facebookPageExternalId);
      setCustomerLogo(facebook?.pageProfilePictureUrl);
    }

    if (isInstagramConnected && comment?.socialMediaSourceType === InstagramCommentSocialMediaSourceType.INSTAGRAM) {
      setCustomerName(instagram?.name);
      setPageExternalId(instagramPageExternalId);
      setCustomerLogo(instagram?.profilePictureUrl);
    }
  }, [isFbConnected, isInstagramConnected, facebook, instagram]);

  useEffect(() => {
    if (text !== '') {
      setDisableReplyButton(false);
    } else {
      setDisableReplyButton(true);
    }
  }, [text]);

  /**
   * Submit
   */
  const handleReplySubmit = () => {
    if (text === '') {
      console.error('Text is empty, cannot submit review reply');
      return;
    }

    return dispatch(
      PresenceStore.postClientPresenceLocationsCommentByLocationIdThunk({
        locationId: getPathId(),
        requestBody: {
          comment: {
            socialMediaEntityParentExternalId: comment?.externalId,
            socialMediaEntityParentId: comment?.socialMediaEntityParentId,
            message: text,
            socialMediaSourceType: comment?.socialMediaSourceType,
            isReply: true,
            from: {
              name: customerName,
              id: pageExternalId,
              objectType: SocialUserObjectType.App_Domain_Presence_Entities_Social_SocialUser,
            },
            createdTime: moment(new Date()).format('YYYY-MM-DDThh:mm:ss+01:00'),
            objectType: SocialMediaCommentObjectType.App_Domain_Presence_Entities_Locations_Comments_SocialMediaComment,
          },
        },
        queryParams: {},
      }),
    ).unwrap();
  };

  /**
   * AI Assistant Reply Generation
   */
  const generateCallback = () => {
    return new Promise<string>((resolve, reject) => {
      presenceStore
        .patchClientPresenceLocationsCommentAiReplyByLocationId(
          getPathId(),
          {
            comment: {
              ...comment,
              objectType:
                SocialMediaCommentObjectType.App_Domain_Presence_Entities_Locations_Comments_SocialMediaComment,
            },
          },
          {},
        )
        .pipe(first())
        .subscribe({
          next: (response: SocialMediaCommentReplyAIGenerateResponseDto) => {
            setDisableReplyButton(false);
            resolve(response.comment.message ?? '');
          },
          error: (error) => {
            console.error('Generating review error ', error);
            if (error.response.data.error === aiBudgetExceededMessage) {
              ModalService.open(<AIBudgetEnd close={() => {}} />);
              reject(new Error('AI budget exceeded'));
              return;
            }
            ModalService.open(
              <ErrorModal
                close={() => null}
                source={'REVIEW_CARD_FORM'}
                title={'Oh snap! Something went wrong!'}
                message={
                  'The application has encountered an unknown error. Please contact customer support for further help.'
                }
                ctaPositive={{
                  text: 'contact our support',
                  cta: () => {
                    supportService.show();
                  },
                  icon: IconNames.arrowRight,
                }}
                ctaPosition={'center'}
              />,
            );
            reject(new Error('AI generation failed'));
          },
        });
    });
  };

  const ID = `TEXTAREA_${mostRecent ? 'MOST_RECENT_' : ''}${comment?.externalId}`;
  return (
    <ComponentContainer className={styles.container}>
      <div className={classNames(dFlex, gap1)}>
        <Avatar size={'small'} name={customerName} image={customerLogo} noHover={true} />

        <div className={classNames(flexGrow1)}>
          <div className={mb2}>
            <Text type={TextTypes.textHelp} fontWeight={FontWeights.bold} className={classNames(mb1)}>
              {customerName}
            </Text>

            <Render if={canGenerateReply}>
              <Suspense fallback={<span />}>
                <AIAssistant
                  id={`AIAssistant_${comment?.externalId}`}
                  generateBtnText={'Generate reply'}
                  generateCallback={generateCallback}
                  value={text}
                  setValue={setText}
                  onPanelStatusChange={(s) => setPanelStatus(s)}
                  anchorElem={document.getElementById(ID)?.parentNode as HTMLElement}
                >
                  <Textarea
                    id={ID}
                    isLoading={panelStatus === 'writing'}
                    value={text}
                    counter={false}
                    placeholder={'Your reply message'}
                    maxLength={Validations.CONFIG_REVIEWS_REPLY_MAX_LENGTH}
                    onChange={(e) => setText(e.target.value)}
                  />
                </AIAssistant>
              </Suspense>
            </Render>

            <Render if={!canGenerateReply}>
              <div className={mb2}>
                <Textarea
                  id={`TEXTAREA_${mostRecent ? 'MOST_RECENT_' : ''}${comment?.externalId}`}
                  value={text}
                  counter={true}
                  placeholder={'Your reply message'}
                  maxLength={Validations.CONFIG_REVIEWS_REPLY_MAX_LENGTH}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
            </Render>
          </div>

          <div className={classNames(dFlex, justifyContentBetween, mt2)}>
            <Button
              size={ButtonSizes.extraLarge}
              isLoading={isAddingACommentReply}
              disabled={disableReplyButton || isAddingACommentReply}
              onClick={async () => {
                await handleReplySubmit();
                actionFinished && actionFinished();

                setText('');
                setPanelStatus('closed');
              }}
            >
              {'Send reply'}
            </Button>

            <Button
              size={ButtonSizes.extraLarge}
              type={ButtonTypes.default}
              onClick={() => {
                actionFinished && actionFinished();

                setText('');
                setPanelStatus('closed');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </ComponentContainer>
  );
};
