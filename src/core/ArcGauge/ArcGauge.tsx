import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { classNames } from '@helpers/classNames';
import { parseCssVariable } from '@helpers/css-variables-parser';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

import styles from './ArcGauge.module.scss';

export interface ArcGaugeProps {
  value: number; // Value between 0 and 100,
  color1?: string;
  color2?: string;
  text?: string;
  mask?: 'full' | 'simple';
}

export const ArcGauge = (props: ArcGaugeProps) => {
  const { value, color1 = 'var(--n500)', color2 = 'var(--n300)', text, mask = 'full' } = props;
  const { SvgIcon } = useDynamicImport(`reputation/rep-${mask}-gauge-mask.svg`);

  const parsedColor1 = parseCssVariable(color1);
  const parsedColor2 = parseCssVariable(color2);

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  };

  const clamped = Math.max(0, Math.min(100, value));

  const generateSectorPath = (value: number): string => {
    const cx = 120;
    const cy = 120;
    const r = 117;

    const arcEndX = 3;
    const arcEndY = 120;

    // Degenerate sector at 0%
    if (clamped === 0) {
      return `M ${cx} ${cy} L ${arcEndX} ${arcEndY} A ${r} ${r} 0 0 0 ${arcEndX} ${arcEndY} Z`;
    }

    // Angle: map 0–100 → 180°–0° (clockwise)
    const angle = 180 - (clamped / 100) * 180;
    const start = polarToCartesian(cx, cy, r, -angle);

    const largeArcFlag = 0;
    const sweepFlag = 0; // clockwise

    return `M ${cx} ${cy} L ${start.x.toFixed(2)} ${start.y.toFixed(
      2,
    )} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag} ${arcEndX} ${arcEndY} Z`;
  };

  return (
    <div data-slot={'arc-gauge'} className={classNames(styles.container)}>
      <svg
        data-slot={'arc-gauge-track'}
        className={styles.arcGauge}
        viewBox="0 0 240 120"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background semicircle */}
        <path d="M 3 120 A 117 117 0 0 1 237 120" fill="var(--n200)" />
      </svg>

      <div
        data-slot={'arc-gauge-fill'}
        className={classNames(styles.arcGauge)}
        style={{
          background: `conic-gradient(from 270deg at 50% 100%, ${parsedColor1} 0deg, ${parsedColor2} ${
            (clamped / 100) * 180
          }deg)`,
          clipPath: `path('${generateSectorPath(value)}')`,
        }}
      />

      <img data-slot={'arc-gauge-mask'} src={SvgIcon} className={classNames(styles.overlayMask)} alt={''} />

      <Render if={!!text}>
        <div data-slot={'arc-gauge-text'} className={classNames(styles.textContainer)}>
          <Text
            type={TextTypes.textIntro}
            fontWeight={FontWeights.bold}
            textAlign="center"
            className={classNames(styles.text)}
          >
            {text}
          </Text>
        </div>
      </Render>
    </div>
  );
};
