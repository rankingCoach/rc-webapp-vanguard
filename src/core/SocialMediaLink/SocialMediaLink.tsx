import React from "react";
import { Avatar, AvatarIcon } from "@vanguard/Avatar/Avatar";
import styles from "./SocialMediaLink.module.scss";
import { classNames } from "@helpers/classNames";
import { Icon } from "@vanguard/Icon/Icon";
import { IconNames } from "@vanguard/Icon/IconNames";
import { detectNetworkFromUrl } from "./utils";

export type SocialMediaLinkProps = {
  network?: AvatarIcon;
  url?: string;
  testId?: string;
  greyScale?: boolean;
};

export const SocialMediaLink = (props: SocialMediaLinkProps) => {
  const { network: explicitNetwork, url, testId, greyScale } = props;

  // Use explicit network if provided, otherwise detect from URL
  const network = explicitNetwork || (url ? detectNetworkFromUrl(url) : undefined);

  // If no network could be determined, don't render
  if (!network) {
    console.warn(`SocialMediaLink: Could not determine network${url ? ` from URL: ${url}` : ''}`);
    return null;
  }

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    // Stop propagation to prevent parent click handlers from firing
    event.stopPropagation();
  };

  if (greyScale) {
    return (
      <div data-slot={'social-media-link'} className={classNames(styles.missingSocialMediaLink)} data-testid={testId}>
        <Avatar icon={network} size={"small"} noHover={true} greyScale />
      </div>
    );
  }

  return (
    <a
      data-slot={'social-media-link'}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={classNames(styles.socialMediaLink)}
      data-testid={testId}
      onClick={handleClick}
    >
      <Avatar icon={network} size={"small"} noHover={false} />
      <Icon color={"--fn-fg-light"} className={styles.icon}>
        {IconNames.newTab}
      </Icon>
    </a>
  );
};
