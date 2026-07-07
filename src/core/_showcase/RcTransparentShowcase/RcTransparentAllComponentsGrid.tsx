import { useState } from 'react';

import { CssUpdateRenderedComponent } from '../CssUpdatesShowcase/CssUpdateRenderedComponent/CssUpdateRenderedComponent';
import styles from './RcTransparentAllComponentsGrid.module.scss';
import { rcTransparentRecords } from './data';

// The preview decorator applies the `theme` global to colorScheme in a
// useEffect, which runs AFTER this component's first render — so on a direct
// iframe load with &globals=theme:dark the style is not set yet. The URL
// globals param is the reliable source at mount time.
export function initialEmbeddedTheme(): 'light' | 'dark' {
  const globalsParam = new URLSearchParams(window.location.search).get('globals') ?? '';
  if (globalsParam.includes('theme:dark')) return 'dark';
  if (globalsParam.includes('theme:light')) return 'light';
  return document.documentElement.style.colorScheme === 'dark' ? 'dark' : 'light';
}

// Every converted component on one page, side by side, so the whole
// rc_transparent() migration can be eyeballed in a single pass per theme.
export function RcTransparentAllComponentsGrid() {
  const [embeddedTheme, setEmbeddedTheme] = useState<'light' | 'dark'>(initialEmbeddedTheme);

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>rc_transparent() migration — all {rcTransparentRecords.length} components</h2>
        <div className={styles.themeToggle}>
          {(['light', 'dark'] as const).map((theme) => (
            <button
              key={theme}
              className={`${styles.themeButton} ${embeddedTheme === theme ? styles.themeButtonActive : ''}`}
              onClick={() => setEmbeddedTheme(theme)}
            >
              {theme === 'light' ? '☀ Light' : '☾ Dark'}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {rcTransparentRecords.map((record) => (
          <div key={record.title} className={styles.cell} data-component={record.title}>
            <div className={styles.cellHeader}>
              <span className={styles.cellTitle}>{record.title}</span>
              <span className={styles.cellInspect}>{record.inspect}</span>
            </div>
            <CssUpdateRenderedComponent
              theme={embeddedTheme}
              record={{
                title: record.title,
                path: record.path,
                changes: [],
                storyId: record.storyId,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
