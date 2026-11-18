import { SVGObject } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { classNames } from '@helpers/classNames';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { BlobAnimation } from '@vanguard/IllustrationBlob/BlobAnimation/BlobAnimation';
import { Render } from '@vanguard/Render/Render';
import { StyledSVG } from '@vanguard/StyledSVG/StyledSVG';
import React from 'react';
import styles from './IllustrationBlob.module.scss';

export interface IllustrationBlobProps {
  icon?: IconNames;
  SVGObject?: SVGObject;
  onlyImage?: boolean;
  imageAlignments?: {
    top?: number;
    left: number;
  };
  color?: string;
}

export const IllustrationBlob = (props: IllustrationBlobProps) => {
  const { icon, SVGObject, onlyImage = false, imageAlignments, color } = props;
  const {
    SvgIcon: SvgImage,
    loading,
    error,
  } = SVGObject || { SvgIcon: '', loading: false, error: null };
  const value = [1, 2];
  if (SVGObject && (loading || error)) return null;

  return (
    <div data-slot="illustration-blob" className={styles.mainContainer}>
      {value.map((item, i) => {
        return (
          <div data-slot="illustration-blob-layer" className={classNames(styles.container, item === 2 ? styles.orbChild : undefined)} key={item}>
            <div data-slot="illustration-blob-image" className={styles.image} style={{ ...imageAlignments }}>
              <StyledSVG src={SvgImage} uniquifyIDs={true} />
            </div>
            <Render if={!onlyImage}>
              <div data-slot="illustration-blob-decoration" className={styles.blobAndIconContainer}>
                <BlobAnimation size={'small'} baseColor={color} />

                <Render if={!!icon}>
                  <div data-slot="illustration-blob-icon" className={styles.icon}>
                    <Icon type={IconSize.large} forceSize={48} color={'--n000'}>
                      {icon ?? IconNames.card}
                    </Icon>
                  </div>
                </Render>
              </div>
            </Render>
          </div>
        );
      })}
    </div>
  );
};

