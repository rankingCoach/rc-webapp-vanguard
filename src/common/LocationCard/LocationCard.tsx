import { LocationCardGoogleMaps } from '@common/LocationCard/LocationCardGoogleMaps';
import { TextIcon } from '@common/TextIcon/TextIcon';
import { breakpoints } from '@config/breakpoints';
import { useWindowResize } from '@custom-hooks/use-window.resize';
import {
  alignItemsCenter,
  alignItemsEnd,
  alignItemsStart,
  alignItemsTabletCenter,
  dFlex,
  dFlexColumn,
  dFlexMobileColumn,
  dFlexRow,
  dFlexTabletColumn,
  gap1,
  gap2,
  gap3,
  gap4,
  h100,
  justifyContentBetween,
  p3,
  w100,
} from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { GoogleLocation } from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Google/Locations/GoogleLocation';
import { GooglePlace } from '@models/swagger/App/Domain/Presence/Entities/ListingServices/Google/Places/GooglePlace';
import { LocationMediaItemType } from '@models/swagger/App/Domain/Presence/Entities/Locations/MediaItems/LocationMediaItem';
import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { Collapse } from '@vanguard/Collapse/Collapse/Collapse';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { InfoBox } from '@vanguard/InfoBox/InfoBox';
import { ModalService } from '@vanguard/Modal/ModalService';
import { Render } from '@vanguard/Render/Render';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useMemo, useState } from 'react';

import imagePlaceholder from './img/placeholder.svg';
import styles from './LocationCard.module.scss';

export enum GBPStatus {
  isVerified = 'isVerified',
  needsVerification = 'needsVerification',
  noRights = 'noRights',
  isSuspended = 'isSuspended',
  isDuplicate = 'isDuplicate',
}

export interface LocationCardProps {
  googleLocation: GoogleLocation | GooglePlace;
  cta: React.ReactNode;
  showImage?: boolean;
  showOnMap?: boolean;
  languageCode: string;
}

export const LocationCard = (props: LocationCardProps) => {
  const { googleLocation, cta, showImage = false, showOnMap = true, languageCode } = props;

  const { company, address, website, mediaItems } = googleLocation;
  const { locationState, categories } = {
    categories: null,
    ...(googleLocation as GoogleLocation),
  };

  const width = useWindowResize();

  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [mobileModalId, setMobileModalId] = useState<string>('');

  const imageUrl = mediaItems?.elements?.find((e) => e.type === LocationMediaItemType.photo)?.publicUrl;

  const phoneNumber = useMemo(
    () => company?.contactInfos?.elements?.find((e) => e.type === 'PHONE')?.value,
    [googleLocation],
  );

  const openMobileView = () => {
    const mobileModalId = ModalService.open(
      <MapMobileView
        exitClick={() => {
          setIsMapOpen(false);
          ModalService.closeEv(mobileModalId);
        }}
      />,
      {
        fullscreen: true,
        width: '100%',
        wrapInModal: true,
      },
    );
    return mobileModalId;
  };

  const MapMobileView = (props: { exitClick: () => void }) => {
    const { exitClick } = props;
    return (
      <div className={classNames(dFlex, dFlexColumn, gap3, p3, alignItemsCenter, w100, h100, styles.whiteBackground)}>
        <div className={classNames(styles.componentContainer)}>
          <LocationCardGoogleMaps
            lat={address?.geoPoint?.lat?.toString() ?? ''}
            lng={address?.geoPoint?.lng?.toString() ?? ''}
            languageCode={languageCode}
          />
        </div>
        <Button
          size={ButtonSizes.extraLarge}
          type={ButtonTypes.default}
          iconRight={IconNames.visibilityOff}
          onClick={exitClick}
        >
          Hide map
        </Button>
      </div>
    );
  };

  const showGBPStatus = () => {
    switch (true) {
      case locationState?.requiresVerification:
        return (
          <InfoBox
            type={'warn'}
            description={'This listing is not verified. To connect you must verify it.'}
            position={'start'}
          />
        );
        break;
      case locationState?.isSuspended:
        return (
          <InfoBox
            type={'danger'}
            description={'This listing is suspended and you cannot connect it right now.'}
            position={'start'}
          />
        );
        break;
      case locationState?.hasOwnershipConflict:
        return (
          <InfoBox type={'danger'} description={'This listing is a duplicate of another you own.'} position={'start'} />
        );
        break;
      case locationState?.hasVoiceOfMerchant:
        break;
      /*
      case GBPStatus.noRights:
        return <InfoBox type={"warn"} description={"You don't have ownership rights for this listing."} />;
        */
    }
  };

  return (
    <ComponentContainer className={classNames(dFlex, dFlexColumn, gap3, justifyContentBetween)}>
      <div className={classNames(dFlex, dFlexRow, alignItemsStart, gap3, dFlexTabletColumn, justifyContentBetween)}>
        <div className={classNames(dFlex, dFlexRow, alignItemsStart, gap4, dFlexMobileColumn)}>
          <Render if={showImage && !!imageUrl}>
            <div className={classNames(imageUrl ? styles.displayNoneMobile : '')}>
              <img
                src={imageUrl}
                width={width > breakpoints.mobile ? 128 : 343}
                height={width > breakpoints.mobile ? 128 : 86}
              />
            </div>
          </Render>

          <Render if={showImage && !imageUrl}>
            <div className={classNames(imageUrl ? styles.displayNoneMobile : '')}>
              <StyledSVG
                src={imagePlaceholder}
                width={width > breakpoints.mobile ? 128 : 343}
                height={width > breakpoints.mobile ? 128 : 86}
              />
            </div>
          </Render>

          <div className={classNames(dFlex, dFlexColumn)}>
            <Text fontWeight={FontWeights.bold} type={TextTypes.textIntro}>
              {company?.doingBusinessAsName}
            </Text>
            <Text
              fontWeight={FontWeights.regular}
              type={TextTypes.textHelp}
              className={classNames(styles.category)}
              color={'var(--n400)'}
              textTight={true}
            >
              {categories?.primary?.name}
            </Text>

            <div>{showGBPStatus()}</div>

            <div className={classNames(dFlex, gap1, dFlexColumn)}>
              <TextIcon icon={IconNames.location} textType={TextTypes.text} fontWeight={FontWeights.medium}>
                {address?.formattedAddress}
              </TextIcon>
              <Render if={!!website}>
                <TextIcon icon={IconNames.language} textType={TextTypes.textHelp} textColor={'var(--n400)'}>
                  {website?.domain?.name}
                </TextIcon>
              </Render>

              <Render if={!!phoneNumber}>
                <TextIcon icon={IconNames.phone} textType={TextTypes.textHelp} textColor={'var(--n400)'}>
                  {phoneNumber}
                </TextIcon>
              </Render>
            </div>
          </div>
        </div>
        <div className={classNames(dFlex, dFlexColumn, alignItemsEnd, alignItemsTabletCenter, gap2)}>
          <Render if={false}>
            <div className={classNames(dFlex, dFlexRow, gap1)}>
              <Text fontWeight={FontWeights.regular} type={TextTypes.textHelp} color={'var(--n400)'} textTight={true}>
                Your role:
              </Text>
              <Text fontWeight={FontWeights.bold} type={TextTypes.textHelp} textTight={true}>
                {/* TODO: fix this after BE is in place */}
                {'Here we need the role from googleLocation'}
              </Text>
            </div>
          </Render>

          <div className={classNames(styles.actions)}>
            {cta}
            <Render if={showOnMap && !!address?.formattedAddress}>
              <Button
                size={ButtonSizes.extraLarge}
                type={ButtonTypes.default}
                iconRight={isMapOpen ? IconNames.visibilityOff : IconNames.visibility}
                onClick={() => {
                  if (width > breakpoints.mobile) {
                    setIsMapOpen(!isMapOpen);
                  } else {
                    const id = openMobileView();
                    setMobileModalId(id);
                  }
                }}
              >
                {isMapOpen ? 'Hide map' : 'Show on map'}
              </Button>
            </Render>
          </div>
        </div>
      </div>

      <Collapse className={w100} isOpen={isMapOpen}>
        <div className={classNames(styles.componentContainer)}>
          <LocationCardGoogleMaps
            lat={address?.geoPoint?.lat?.toString() ?? ''}
            lng={address?.geoPoint?.lng?.toString() ?? ''}
            languageCode={languageCode}
          />
        </div>
      </Collapse>
    </ComponentContainer>
  );
};
