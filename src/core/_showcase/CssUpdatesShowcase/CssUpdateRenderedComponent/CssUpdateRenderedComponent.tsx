import { useEffect, useRef, useState } from 'react';

import type { CssUpdateRecord } from '../data';
import styles from './CssUpdateRenderedComponent.module.scss';

/* ----------------------------- StoryFrame ----------------------------- */

function StoryFrame({ storyId }: { storyId: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [height, setHeight] = useState(420);

  useEffect(() => {
    setLoading(true);
  }, [storyId]);

  const onLoad = () => {
    setLoading(false);
    const frame = ref.current;
    const doc = frame?.contentDocument;
    if (!doc) return;
    // Storybook wraps stories in a 100vh container — collapse it so small
    // components don't sit in a huge frame.
    const sbRoot = doc.querySelector<HTMLElement>('#storybook-root, .sb-show-main');
    if (sbRoot) {
      sbRoot.style.height = 'auto';
      sbRoot.style.minHeight = '0';
    }
    // Measure the lowest rendered edge — scrollHeight misses absolutely
    // positioned content (badges, popovers).
    let bottom = 0;
    doc.querySelectorAll('body *').forEach((el) => {
      const b = el.getBoundingClientRect().bottom;
      if (Number.isFinite(b)) bottom = Math.max(bottom, b);
    });
    const measured = Math.ceil(bottom) + 24;
    setHeight(Math.min(1200, Math.max(200, measured || 420)));
  };

  return (
    <div className={styles.frameWrap} data-testid="css-update-story-frame">
      {loading && (
        <div className={styles.spinnerOverlay}>
          <div className={styles.spinner} />
        </div>
      )}
      <iframe
        ref={ref}
        key={storyId}
        title={storyId}
        className={styles.frame}
        style={{ height }}
        data-testid="css-update-story-iframe"
        src={`iframe.html?id=${encodeURIComponent(storyId)}&viewMode=story&singleStory=true`}
        onLoad={onLoad}
      />
    </div>
  );
}

function MissingStoryNotice({ record }: { record: CssUpdateRecord }) {
  return (
    <div className={styles.notice} data-testid="css-update-fallback">
      <strong>No Storybook story found.</strong> This stylesheet is not covered by the current Storybook index, so the
      showcase skips the unstable direct live mount.
      <div className={styles.noticePath}>{record.path}</div>
    </div>
  );
}

/* ------------------------------- entry -------------------------------- */

export function CssUpdateRenderedComponent({ record }: { record: CssUpdateRecord }) {
  if (record.storyId) return <StoryFrame storyId={record.storyId} />;
  return <MissingStoryNotice record={record} />;
}
