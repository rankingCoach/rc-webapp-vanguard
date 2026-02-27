import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer';
import { FrostedGlass } from '@vanguard/FrostedGlass';
import { Header, HeaderTypes } from '@vanguard/Header';
import { Render } from '@vanguard/Render';
import { TextReplacements } from '@vanguard/Text';
import React, { RefObject } from 'react';

import { GradientRcBackground } from './GradientRcBackground';
import styles from './PageSection.module.scss';

export enum PageSectionBackground {
  frostedGlass = 'frostedGlass',
  functionalBg = 'functionalBg',
  transparent = 'transparent',
  gradientRc = 'gradientRc',
  gradientBgVarTop = 'gradientBgVarTop',
  gradientBgVarBottom = 'gradientBgVarBottom',
}

export enum PageSectionRoundedEdges {
  top = 'top',
  bottom = 'bottom',
  both = 'both',
}

export type PageSectionInnerRef = RefObject<HTMLDivElement | null> | ((node?: Element | null | undefined) => void);

type PageSectionBaseProps = {
  headerActionArea?: React.ReactNode;
  children?: React.ReactNode;
  testId?: string;
  innerRef?: PageSectionInnerRef;
  className?: string;
  background?: PageSectionBackground;
  roundedEdges?: PageSectionRoundedEdges;
  noDefaultPadding?: boolean;
  isVisible?: boolean;
};

export type PageSectionWithTitle = PageSectionBaseProps & {
  title: string;
  description?: string;
  replacements?: TextReplacements;
  headerType?: HeaderTypes;
};

export type PageSectionWithoutTitle = PageSectionBaseProps & {
  title?: undefined;
  description?: never;
  replacements?: never;
  headerType?: never;
};

export type PageSectionProps = PageSectionWithTitle | PageSectionWithoutTitle;

export const PageSection = (props: PageSectionProps) => {
  const {
    title,
    description,
    replacements,
    headerType = HeaderTypes.sectionHeader,
    headerActionArea,
    children,
    testId,
    isVisible = true,
  } = props;

  if (!isVisible) return null;

  return (
    <PageSectionContainer {...props}>
      {(title || headerActionArea) && (
        <div className={styles.header}>
          <Render if={!!title}>
            <Header
              title={title}
              type={headerType}
              description={description}
              replacements={replacements}
              testId={testId}
            />
          </Render>

          <Render if={!!headerActionArea}>{headerActionArea}</Render>
        </div>
      )}

      <div data-testid={testId ? `${testId}_Children` : undefined}>{children}</div>
    </PageSectionContainer>
  );
};

const PageSectionContainer = (props: PageSectionProps) => {
  const {
    testId,
    className,
    background = PageSectionBackground.functionalBg,
    children,
    innerRef,
    noDefaultPadding,
    roundedEdges,
  } = props;

  const getBackgroundClass = () => {
    switch (background) {
      case PageSectionBackground.frostedGlass:
        return styles.frostedGlass;
      case PageSectionBackground.functionalBg:
        return styles.functionalBg;
      case PageSectionBackground.gradientRc:
        return styles.gradientRc;
      case PageSectionBackground.transparent:
        return styles.transparent;
      case PageSectionBackground.gradientBgVarTop:
        return styles.gradientBgVarTop;
      case PageSectionBackground.gradientBgVarBottom:
        return styles.gradientBgVarBottom;
      default:
        return styles.functionalBg;
    }
  };

  const containerClasses = classNames(
    styles.container,
    getBackgroundClass(),
    !noDefaultPadding && styles.defaultPadding,
    (roundedEdges === PageSectionRoundedEdges.top || roundedEdges === PageSectionRoundedEdges.both) &&
      styles.roundedTop,
    (roundedEdges === PageSectionRoundedEdges.bottom || roundedEdges === PageSectionRoundedEdges.both) &&
      styles.roundedBottom,
    className,
  );

  if (background === PageSectionBackground.frostedGlass) {
    return (
      <FrostedGlass testId={testId} className={containerClasses} innerRef={innerRef}>
        {children}
      </FrostedGlass>
    );
  }

  return (
    <ComponentContainer testId={testId} className={containerClasses} innerRef={innerRef}>
      {background === PageSectionBackground.gradientRc && <GradientRcBackground />}
      {children}
    </ComponentContainer>
  );
};
