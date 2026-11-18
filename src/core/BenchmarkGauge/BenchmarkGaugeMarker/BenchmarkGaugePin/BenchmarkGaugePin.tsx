import { classNames } from '@helpers/classNames';
import { BenchmarkGaugeMarkerType, MarkerRenderContext } from '@vanguard/BenchmarkGauge';
import { Render } from '@vanguard/Render';
import React from 'react';

import styles from './BenchmarkGaugePin.module.scss';

interface BenchmarkGaugePinProps {
  marker: BenchmarkGaugeMarkerType;
  ctx: MarkerRenderContext;
  resolvedColor: string;
  isHighlighted: boolean;
  growHighlightedMarker?: boolean;
}

export const BenchmarkGaugePin = (props: BenchmarkGaugePinProps) => {
  const { marker, ctx, resolvedColor, isHighlighted, growHighlightedMarker } = props;

  return (
    <div data-slot={'benchmark-gauge-pin'} className={classNames(styles.pinWrapper)}>
      <Render if={!!marker.renderPin}>{marker.renderPin?.(ctx)}</Render>
      <Render if={!marker.renderPin}>
        <div
          data-slot={'benchmark-gauge-pin-default'}
          className={classNames(styles.defaultPin, growHighlightedMarker && isHighlighted && styles.defaultPinGrown)}
          style={{ background: resolvedColor }}
        >
          <Render if={!!marker.renderHighlightedContent}>
            <div data-slot={'benchmark-gauge-pin-highlighted-content'} className={classNames(styles.highlightedContent, isHighlighted && styles.highlightedContentVisible)}>
              {marker.renderHighlightedContent?.(ctx)}
            </div>
          </Render>
        </div>
      </Render>
    </div>
  );
};
