import React, { useId } from 'react';

import styles from './PageSection.module.scss';

export const GradientRcBackground = () => {
  const uid = useId();
  const gId = (n: number) => `${uid}-gBg${n}`;

  return (
    <svg
      className={styles.gradientRcSvg}
      viewBox="0 0 1620 720"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <rect width="1620" height="720" fill="var(--lp-hero-dynamic-gradient-primary)" />
      <rect width="1620" height="720" fill="var(--lp-hero-dynamic-gradient-color1)" />
      <rect width="1620" height="720" fill={`url(#${gId(0)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(1)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(2)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(3)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(4)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(5)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(6)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(7)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(8)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(9)})`} />
      <rect width="1620" height="720" fill={`url(#${gId(10)})`} />

      <defs>
        <radialGradient
          id={gId(0)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(852 -8.37317e-05) rotate(117.072) scale(505.371 1585.98)"
        >
          <stop offset="0.634769" stopColor="var(--lp-hero-dynamic-gradient-primary)" stopOpacity="0" />
          <stop offset="0.932819" stopColor="var(--lp-hero-dynamic-gradient-primary)" />
        </radialGradient>

        <radialGradient
          id={gId(1)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(782 320) rotate(121.483) scale(1022.52 3088.46)"
        >
          <stop stopColor="var(--lp-hero-dynamic-gradient-color3)" stopOpacity="0" />
          <stop offset="0.932819" stopColor="var(--lp-hero-dynamic-gradient-color3)" />
        </radialGradient>

        <radialGradient
          id={gId(2)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(-142 784) rotate(-47.07) scale(352.369 1114.56)"
        >
          <stop offset="0.0671808" stopColor="var(--lp-hero-dynamic-gradient-color3)" />
          <stop offset="1" stopColor="var(--lp-hero-dynamic-gradient-color3)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(3)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1424 72.0001) rotate(103.289) scale(408.95 1108.79)"
        >
          <stop offset="0.0671808" stopColor="var(--lp-hero-dynamic-gradient-color2)" />
          <stop offset="1" stopColor="var(--lp-hero-dynamic-gradient-color2)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(4)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1504 -52) rotate(109.573) scale(286.559 668.261)"
        >
          <stop offset="0.0671808" stopColor="var(--lp-hero-dynamic-gradient-primary)" />
          <stop offset="1" stopColor="var(--lp-hero-dynamic-gradient-primary)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(5)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1510 540) rotate(124.444) scale(284.253 507.558)"
        >
          <stop stopColor="var(--lp-hero-dynamic-gradient-primary)" />
          <stop offset="1" stopColor="var(--lp-hero-dynamic-gradient-primary)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(6)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(740 68.0001) rotate(143.584) scale(303.21 861.191)"
        >
          <stop stopColor="var(--lp-hero-dynamic-gradient-primary)" />
          <stop offset="1" stopColor="var(--lp-hero-dynamic-gradient-primary)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(7)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(166 238) rotate(130.406) scale(317.805 471.409)"
        >
          <stop stopColor="var(--lp-hero-dynamic-gradient-primary)" />
          <stop offset="0.846218" stopColor="var(--lp-hero-dynamic-gradient-primary)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(8)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(278 152) rotate(122.417) scale(324.58 872.784)"
        >
          <stop stopColor="var(--lp-hero-dynamic-gradient-color1)" stopOpacity="0.6" />
          <stop offset="0.745581" stopColor="var(--lp-hero-dynamic-gradient-color1)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(9)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1526 288) rotate(113.29) scale(328.792 1881.14)"
        >
          <stop offset="0.0519575" stopColor="var(--lp-hero-dynamic-gradient-color1)" stopOpacity="0.4" />
          <stop offset="0.745581" stopColor="var(--lp-hero-dynamic-gradient-color1)" stopOpacity="0" />
        </radialGradient>

        <radialGradient
          id={gId(10)}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(1512 370) rotate(111.991) scale(112.161 519.22)"
        >
          <stop offset="0.0519575" stopColor="var(--lp-hero-dynamic-gradient-color1)" stopOpacity="0.3" />
          <stop offset="1" stopColor="var(--lp-hero-dynamic-gradient-color1)" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};
