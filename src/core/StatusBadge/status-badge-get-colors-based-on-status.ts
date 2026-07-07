import { BoostCampaignStatus } from '@models/swagger/App/Domain/Ads/Entities/Locations/Engagement/Boosts/BoostCampaign';
import { PostStatus } from '@models/swagger/App/Domain/Presence/Entities/Locations/Posts/Post';
import { IconNames } from '@vanguard/Icon/IconNames';
import { StatusBadgeStatus } from '@vanguard/StatusBadge/StatusBadge';

export const getColorsBasedOnStatus = (
  status: StatusBadgeStatus,
): {
  reverseColor: string;
  iconColor: string;
  textColor: string;
  bgColor: string;
  iconName: IconNames;
  borderColor?: string;
} => {
  if (!status) {
    status = 'info';
  }

  switch (status) {
    case 'live':
      return {
        reverseColor: '--s400',
        iconColor: '--s900',
        textColor: '--s900',
        bgColor: '--s100',
        iconName: IconNames.close,
      };
    case 'pending_verification':
      return {
        reverseColor: '--w400',
        iconColor: '--w900',
        textColor: '--w900',
        bgColor: '--w100',
        iconName: IconNames.close,
      };
    case PostStatus.NOT_APPROVED:
      return {
        reverseColor: '--e400',
        iconColor: '--e900',
        textColor: '--e900',
        bgColor: '--e100',
        iconName: IconNames.close,
      };
    case PostStatus.SCHEDULED:
      return {
        reverseColor: '--a1500',
        iconColor: '--a1900',
        textColor: '--a1900',
        bgColor: '--a1100',
        iconName: IconNames.close,
      };
    case BoostCampaignStatus.ARCHIVED:
    case BoostCampaignStatus.DRAFT:
    case PostStatus.DRAFT:
      return {
        reverseColor: '--n400',
        iconColor: '--n400',
        textColor: '--n700',
        bgColor: '--n100',
        iconName: IconNames.close,
      };
    case BoostCampaignStatus.DELETED:
    case PostStatus.ERROR:
    case 'deleted':
    case 'danger':
      return {
        reverseColor: '--e400',
        iconColor: '--e500',
        textColor: '--e500',
        bgColor: '--e100',
        iconName: IconNames.close,
      };
    case 'info':
      return {
        reverseColor: '--i400',
        iconColor: '--i500',
        textColor: '--i900',
        bgColor: '--i100',
        iconName: IconNames.help,
      };
    case BoostCampaignStatus.PAUSED:
    case 'warning':
      return {
        reverseColor: '--w400',
        iconColor: '--w500',
        textColor: '--w900',
        bgColor: '--w100',
        iconName: IconNames.exclamation,
      };

    case 'limitExcedeed':
      return {
        reverseColor: '--e400',
        iconColor: '--e500',
        textColor: '--e900',
        bgColor: '--e100',
        iconName: IconNames.lock,
      };
    case BoostCampaignStatus.ACTIVE:
    case 'success':
      return {
        reverseColor: '--s900',
        iconColor: '--s500',
        textColor: '--s900',
        bgColor: '--s100',
        iconName: IconNames.check,
      };
    case 'sent':
      return {
        reverseColor: '--s900',
        iconColor: '--s900',
        textColor: '--s900',
        bgColor: '--s100',
        iconName: IconNames.check,
      };
    case PostStatus.PUBLISHED:
    case 'connected':
    case 'published':
      return {
        reverseColor: '--s400',
        iconColor: '--s900',
        textColor: '--s900',
        bgColor: '--s100',
        iconName: IconNames.check,
      };
    case PostStatus.PUBLISHING:
    case 'publishing':
      return {
        reverseColor: '--n400',
        iconColor: '--n400',
        textColor: '--n700',
        bgColor: '--n100',
        iconName: IconNames.refresh,
      };
    case 'queued':
      return {
        reverseColor: '--w900',
        iconColor: '--w900',
        textColor: '--w900',
        bgColor: '--w100',
        iconName: IconNames.refresh,
      };
    case 'publishingStatic':
      return {
        reverseColor: '--n400',
        iconColor: '--n400',
        textColor: '--n700',
        bgColor: '--n100',
        iconName: IconNames.refresh,
      }; // Same as "publishing", but icon is not Rotating (see "spin" prop on icon)
    case 'neutral':
      return {
        reverseColor: '--n400',
        iconColor: '--n500',
        textColor: '--n400',
        bgColor: '--fn-bg',
        iconName: IconNames.close,
      };
    case 'not_sent':
      return {
        reverseColor: '--fn-fg-light',
        iconColor: '--fn-fg-light',
        textColor: '--fn-fg-light',
        bgColor: '--fn-bg',
        iconName: IconNames.close,
      };
    case 'published_variant':
      return {
        reverseColor: '--a3900',
        iconColor: '--a3900',
        textColor: '--a3900',
        bgColor: '--a3100',
        iconName: IconNames.check,
      };
    case 'ai':
      return {
        reverseColor: '--a1500',
        iconColor: '--a1500',
        textColor: '--a1500',
        bgColor: '--a1100',
        iconName: IconNames.ai,
      };
  }

  return {
    reverseColor: '',
    iconColor: '',
    textColor: '',
    bgColor: '',
    iconName: IconNames.close,
  };
};
