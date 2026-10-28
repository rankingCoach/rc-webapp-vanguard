import React, { useLayoutEffect, useRef, useState } from 'react';

import { getFirstLineCentre } from './_InfoBox.alignment';
import { CELL_WIDTH, InfoBoxCase, InfoBoxCaseGroup } from './_InfoBox.cases';

const captionStyle: React.CSSProperties = { fontSize: '12px', lineHeight: '16px', color: 'var(--n500)' };

// Dashed outline shows the cell the InfoBox is laid out in (matters for position / width / maxWidth).
// `showGuide` draws a red line across the cell through the measured centre of the InfoBox's first line.
export const CaseCell = ({
  infoBoxCase,
  caption,
  showGuide = false,
  children,
}: {
  infoBoxCase: InfoBoxCase;
  caption?: string;
  showGuide?: boolean;
  children: React.ReactNode;
}) => {
  const cellRef = useRef<HTMLDivElement>(null);
  const [guideTop, setGuideTop] = useState<number>();

  // measured, not computed from InfoBox's styles, so the guide follows any padding / line-height change;
  // re-measured when the cell resizes and once web fonts have loaded
  useLayoutEffect(() => {
    const cell = cellRef.current;
    if (!showGuide || !cell) return;
    let cancelled = false;
    const measure = () => {
      if (cancelled) return;
      const box = cell.querySelector<HTMLElement>('[data-testid=info-box-content]');
      const lineCentre = box && getFirstLineCentre(box);
      setGuideTop(typeof lineCentre === 'number' ? lineCentre - cell.getBoundingClientRect().top : undefined);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(cell);
    document.fonts?.ready.then(measure);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [showGuide]);

  return (
    <div
      data-case-key={infoBoxCase.key}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: `0 0 ${infoBoxCase.cellWidth ?? CELL_WIDTH}px`,
      }}
    >
      {caption && <span style={captionStyle}>{caption}</span>}
      <div ref={cellRef} style={{ position: 'relative', outline: '1px dashed var(--n200)', outlineOffset: '2px' }}>
        {children}
        {guideTop !== undefined && (
          <div
            style={{
              position: 'absolute',
              top: guideTop,
              left: 0,
              right: 0,
              borderTop: '1px solid rgba(255, 0, 0, 0.6)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
};

export const CaseGroupSection = ({ group, children }: { group: InfoBoxCaseGroup; children: React.ReactNode }) => (
  <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    <div>
      <h3 style={{ margin: 0, fontSize: '16px', lineHeight: '24px' }}>{group.title}</h3>
      {group.description && <p style={{ ...captionStyle, margin: 0 }}>{group.description}</p>}
    </div>
    {children}
  </section>
);

export const CasePage = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', padding: '16px' }}>{children}</div>
);
