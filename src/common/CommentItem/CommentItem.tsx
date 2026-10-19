import { ReplyCommentItemForm } from '@common/CommentItem/ReplyCommentItemForm/ReplyCommentItemForm';
import { useAppDispatch } from '@custom-hooks/use-app-dispatch';
import { alignItemsCenter, dFlex, dFlexRow, gap1, pb2, pl4, pt0_5, pt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { getPathId } from '@helpers/get-path-id';
import {
  FacebookComment,
  FacebookCommentSocialMediaSourceType,
  FacebookCommentViewerReaction,
} from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Facebook/Locations/Comments/FacebookComment';
import { FacebookAccountProfile } from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Facebook/Locations/Connection/Token/FacebookAccountProfile.ts';
import {
  InstagramComment,
  InstagramCommentSocialMediaSourceType,
} from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Instagram/Locations/Comments/InstagramComment';
import {
  SocialMediaComment,
  SocialMediaCommentObjectType,
} from '@models/swagger/App/Domain/Presence/Entities/Locations/Comments/SocialMediaComment';
import { PresenceStore } from '@stores/swagger/client/PresenceStore';
import { Accordion } from '@vanguard/Accordion/Accordion';
import { Avatar } from '@vanguard/Avatar/Avatar';
import { AvatarIconMap } from '@vanguard/Avatar/Avatar.enum';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { Collapse } from '@vanguard/Collapse/Collapse/Collapse';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

const LIGHT_COLOR = '--fn-fg-light';

export interface CommentItemProps {
  comment: FacebookComment | InstagramComment;
  commentLevel?: number;
  replyOptionAvailable?: boolean;
  showReplies?: boolean;
  mostRecent?: boolean;
  isHidingComment: boolean;
  isDeletingComment: boolean;
  isAddingReaction: boolean;
  isDeletingReaction: boolean;
  //Form props @Todo centralize them
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
}

export const CommentItem = (props: CommentItemProps): React.JSX.Element => {
  const {
    comment,
    replyOptionAvailable = true,
    commentLevel = 1,
    showReplies = true,
    mostRecent = false,
    commentExternalId,
    instagramPageExternalId,
    facebookPageExternalId,
    instagram,
    isAddingACommentReply,
    facebook,
    isInstagramConnected,
    isFbConnected,
    isHidingComment,
    isDeletingComment,
    isDeletingReaction,
    isAddingReaction,
  } = props;
  const dispatch = useAppDispatch();

  // const { facebookPageExternalId, instagramPageExternalId, instagram, facebook } = useSelector(
  //   (state: EngagementDashboardState) => state.EngagementCreatePost,
  // );
  //
  // const { isAddingReaction, isDeletingReaction, commentExternalId, isHidingComment, isDeletingComment } = useSelector(
  //   (state: EngagementDashboardState) => state.EngagementPostsList,
  // );
  const [isCustomerComment, setIsCustomerComment] = useState<boolean>(false);
  const [showForm, setShowForm] = useState(false);
  const [buttonColor, setButtonColor] = useState(LIGHT_COLOR);

  const repliesCount = comment.nestedComments?.elements?.length ?? 0;
  const firstReply = comment.nestedComments?.elements?.[0];

  const [showAllReplies, toggleShowAllReplies] = useState(false);

  useEffect(() => {
    const color =
      (comment as FacebookComment)?.viewerReaction !== FacebookCommentViewerReaction.NONE ? '--p500' : 'LIGHT_COLOR';
    setButtonColor(color);
  }, [comment]);

  useEffect(() => {
    let pageId;

    if (comment.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK) {
      pageId = facebookPageExternalId;
    } else if (comment.socialMediaSourceType === InstagramCommentSocialMediaSourceType.INSTAGRAM) {
      pageId = instagramPageExternalId;
    }

    if (pageId === comment.from?.id) {
      setIsCustomerComment(true);
    }
  }, [facebookPageExternalId, instagramPageExternalId, comment]);

  const addLikeReaction = (): Promise<any> => {
    return dispatch(
      PresenceStore.postClientPresenceLocationsCommentReactionByLocationIdThunk({
        locationId: getPathId(),
        requestBody: {
          comment: {
            ...comment,
            objectType: SocialMediaCommentObjectType.App_Domain_Presence_Entities_Locations_Comments_SocialMediaComment,
          } as SocialMediaComment,
        },
        queryParams: {},
      }),
    ).unwrap();
  };

  const deleteLikeReaction = (): Promise<any> => {
    return dispatch(
      PresenceStore.deleteClientPresenceLocationsCommentReactionByLocationIdThunk({
        locationId: getPathId(),
        requestBody: {
          comment: {
            ...comment,
            objectType: SocialMediaCommentObjectType.App_Domain_Presence_Entities_Locations_Comments_SocialMediaComment,
          } as SocialMediaComment,
        },
        queryParams: {},
      }),
    ).unwrap();
  };

  const hideComment = (toBeHidden: boolean): Promise<any> => {
    return dispatch(
      PresenceStore.patchClientPresenceLocationsCommentByLocationIdThunk({
        locationId: getPathId(),
        requestBody: {
          comment: {
            ...comment,
            isHidden: toBeHidden,
            objectType: SocialMediaCommentObjectType.App_Domain_Presence_Entities_Locations_Comments_SocialMediaComment,
          } as SocialMediaComment,
        },
        queryParams: {},
      }),
    ).unwrap();
  };

  const deleteComment = (): Promise<any> => {
    return dispatch(
      PresenceStore.deleteClientPresenceLocationsCommentByLocationIdThunk({
        locationId: getPathId(),
        requestBody: {
          comment: {
            ...comment,
            objectType: SocialMediaCommentObjectType.App_Domain_Presence_Entities_Locations_Comments_SocialMediaComment,
          } as SocialMediaComment,
        },
        queryParams: {},
      }),
    ).unwrap();
  };

  return (
    <ComponentContainer>
      <>
        <div className={classNames(dFlexRow, gap1, alignItemsCenter, pt2)}>
          <Render if={isCustomerComment}>
            <Avatar
              size={'small'}
              name={comment.from?.name}
              image={
                comment.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK
                  ? facebook?.pageProfilePictureUrl
                  : comment.socialMediaSourceType === InstagramCommentSocialMediaSourceType.INSTAGRAM
                    ? instagram?.profilePictureUrl
                    : undefined
              }
              noHover={true}
            />
          </Render>

          <Render if={!isCustomerComment}>
            <Avatar
              noHover={true}
              size={'small'}
              icon={
                comment.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK
                  ? AvatarIconMap.facebook
                  : comment.socialMediaSourceType === InstagramCommentSocialMediaSourceType.INSTAGRAM
                    ? AvatarIconMap.instagram
                    : undefined
              }
              name={
                comment.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK
                  ? AvatarIconMap.facebook
                  : comment.socialMediaSourceType === InstagramCommentSocialMediaSourceType.INSTAGRAM
                    ? AvatarIconMap.instagram
                    : undefined
              }
            />
          </Render>

          <Text type={TextTypes.textHelp} fontWeight={FontWeights.bold}>
            {comment.from?.name}
          </Text>

          <Text
            type={TextTypes.textCaption}
            replacements={{
              date: comment.createdTime,
            }}
          >
            {'Posted on %date%'}
          </Text>
        </div>

        <Text className={classNames(pl4)}>{comment.message}</Text>

        <div className={classNames(dFlex, pl4, pt0_5, gap1, pb2)}>
          <Collapse isOpen={!comment.isHidden && replyOptionAvailable && !showForm} orientation={'horizontal'}>
            <Button
              type={ButtonTypes.default}
              iconLeft={IconNames.message}
              iconColor={'LIGHT_COLOR'}
              color={'LIGHT_COLOR'}
              hoverColor={'LIGHT_COLOR'}
              size={ButtonSizes.medium}
              textType={TextTypes.textHelp}
              fontWeight={FontWeights.regular}
              onClick={() => {
                setShowForm(true);
              }}
            >
              Reply
            </Button>
          </Collapse>

          <Render
            if={
              (isCustomerComment &&
                comment.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK &&
                (comment as FacebookComment).canHide &&
                (comment as FacebookComment).application?.name === 'rankingCoach') ||
              (!isCustomerComment && comment.socialMediaSourceType === InstagramCommentSocialMediaSourceType.INSTAGRAM)
            }
          >
            <Button
              type={ButtonTypes.default}
              iconLeft={comment.isHidden ? IconNames.visibility : IconNames.visibilityOff}
              iconColor={'LIGHT_COLOR'}
              color={'LIGHT_COLOR'}
              hoverColor={'LIGHT_COLOR'}
              size={ButtonSizes.medium}
              textType={TextTypes.textHelp}
              fontWeight={FontWeights.regular}
              isLoading={isHidingComment && commentExternalId === comment.externalId}
              disabled={isHidingComment && commentExternalId === comment.externalId}
              onClick={() => {
                if (comment.isHidden) {
                  hideComment(false).catch(() => {});
                } else {
                  hideComment(true).catch(() => {});
                }
              }}
            >
              {comment.isHidden ? 'Unhide' : 'Hide'}
            </Button>
          </Render>

          <Button
            type={ButtonTypes.default}
            iconLeft={IconNames.trash}
            iconColor={'LIGHT_COLOR'}
            color={'LIGHT_COLOR'}
            hoverColor={'LIGHT_COLOR'}
            size={ButtonSizes.medium}
            textType={TextTypes.textHelp}
            fontWeight={FontWeights.regular}
            isLoading={isDeletingComment && commentExternalId === comment.externalId}
            disabled={isDeletingComment && commentExternalId === comment.externalId}
            onClick={() => {
              deleteComment().catch(() => {});
            }}
          >
            Delete comment
          </Button>

          <Render
            if={
              !isCustomerComment &&
              !comment.isHidden &&
              comment.socialMediaSourceType === FacebookCommentSocialMediaSourceType.FACEBOOK
            }
          >
            <Button
              type={ButtonTypes.default}
              iconLeft={IconNames.like}
              iconColor={buttonColor}
              iconFillColor={buttonColor}
              color={buttonColor}
              hoverColor={buttonColor}
              size={ButtonSizes.medium}
              textType={TextTypes.textHelp}
              fontWeight={FontWeights.regular}
              isLoading={
                (isAddingReaction && commentExternalId === comment.externalId) ||
                (isDeletingReaction && commentExternalId === comment.externalId)
              }
              disabled={
                (isAddingReaction && commentExternalId === comment.externalId) ||
                (isDeletingReaction && commentExternalId === comment.externalId)
              }
              onClick={() => {
                if ((comment as FacebookComment)?.viewerReaction !== FacebookCommentViewerReaction.NONE) {
                  deleteLikeReaction().catch(() => {});
                } else {
                  addLikeReaction().catch(() => {});
                }
              }}
            >
              {(comment as FacebookComment)?.viewerReaction !== FacebookCommentViewerReaction.NONE ? 'Liked' : 'Like'}
            </Button>
          </Render>
        </div>

        <Accordion
          variant={'outlined'}
          expanded={showForm}
          accordionId="replyForm"
          disableGutters={true}
          detailsChildren={
            <div className={classNames(pl4, pb2, pt0_5)}>
              <ReplyCommentItemForm
                comment={comment}
                actionFinished={() => {
                  setShowForm(false);
                }}
                mostRecent={mostRecent}
                isAddingACommentReply={isAddingACommentReply}
                commentExternalId={commentExternalId}
                isFbConnected={isFbConnected}
                isInstagramConnected={isFbConnected}
                facebookPageExternalId={facebookPageExternalId}
                instagramPageExternalId={instagramPageExternalId}
                facebook={facebook}
                instagram={instagram}
              />
            </div>
          }
        />
      </>

      <Render if={!!repliesCount && showReplies}>
        <div className={classNames(pl4)}>
          {firstReply && (
            <CommentItem
              commentExternalId={commentExternalId}
              comment={firstReply}
              commentLevel={commentLevel + 1}
              mostRecent={mostRecent}
              instagram={instagram}
              facebook={facebook}
              facebookPageExternalId={facebookPageExternalId}
              instagramPageExternalId={instagramPageExternalId}
              isAddingACommentReply={isAddingACommentReply}
              isDeletingReaction={isDeletingReaction}
              isInstagramConnected={isInstagramConnected}
              isDeletingComment={isDeletingComment}
              isHidingComment={isHidingComment}
              isAddingReaction={isAddingReaction}
              isFbConnected={isFbConnected}
              replyOptionAvailable={replyOptionAvailable}
              showReplies={showReplies}
            />
          )}

          <Render if={repliesCount > 1}>
            <Accordion
              variant={'outlined'}
              disableGutters={true}
              expanded={false}
              accordionId={'test'}
              reverse={true}
              iconSize={IconSize.small}
              summaryChildren={
                <Text
                  type={TextTypes.textHelp}
                  textTight={true}
                  fontWeight={FontWeights.medium}
                  replacements={{ repliesCount: repliesCount - 1 }}
                >
                  {showAllReplies ? 'Hide %repliesCount% replies' : 'Show %repliesCount% replies'}
                </Text>
              }
              onExpandedChange={(expanded) => {
                toggleShowAllReplies(expanded);
              }}
              detailsChildren={comment.nestedComments?.elements
                ?.filter((reply, index) => {
                  return index > 0;
                })
                .map((reply, index) => {
                  return (
                    <CommentItem
                      key={index}
                      comment={reply}
                      commentLevel={commentLevel + 1}
                      mostRecent={mostRecent}
                      isAddingACommentReply={isAddingACommentReply}
                      commentExternalId={commentExternalId}
                      instagram={instagram}
                      facebook={facebook}
                      facebookPageExternalId={facebookPageExternalId}
                      instagramPageExternalId={instagramPageExternalId}
                      isInstagramConnected={isInstagramConnected}
                      isDeletingComment={isDeletingComment}
                      isHidingComment={isHidingComment}
                      isAddingReaction={isAddingReaction}
                      isFbConnected={isFbConnected}
                      isDeletingReaction={isDeletingReaction}
                      showReplies={showReplies}
                      replyOptionAvailable={replyOptionAvailable}
                    />
                  );
                })}
            />
          </Render>
        </div>
      </Render>
    </ComponentContainer>
  );
};
