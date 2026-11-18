import React, { useLayoutEffect } from 'react';

/**
 * Consumer CSS at its PRODUCTION position for differential stories (D15, plan §21). In the built rc-webapp the head
 * order is: entry-chunk CSS link, vanguard.css link, (emotion, before the own core), route-chunk CSS links.
 */

/** rc-webapp entry-chunk CSS: before vanguard.css, so Vanguard's MUI-ported rules win equal ties against it. */
export const EntryCss = ({ css }: { css: string }) => {
  useLayoutEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-consumer-css', 'entry');
    el.textContent = css;
    document.head.prepend(el);
    return () => el.remove();
  }, [css]);
  return null;
};

/** rc-webapp route-chunk (lazy) CSS: after vanguard.css and emotion, so it wins equal ties. */
export const RouteCss = ({ css }: { css: string }) => <style data-consumer-css="route">{css}</style>;
