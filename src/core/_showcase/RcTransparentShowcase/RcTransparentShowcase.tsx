import { useMemo, useState } from 'react';

import { CssUpdateRenderedComponent } from '../CssUpdatesShowcase/CssUpdateRenderedComponent/CssUpdateRenderedComponent';
import { initialEmbeddedTheme } from './RcTransparentAllComponentsGrid';
import styles from './RcTransparentShowcase.module.scss';
import { type RcTransparentRecord, rcTransparentRecords } from './data';

function ChangePair({ before, after }: { before: string; after: string }) {
  return (
    <li className={styles.changeItem}>
      <code className={styles.before}>{before}</code>
      <span className={styles.arrow}>→</span>
      <code className={styles.after}>{after}</code>
    </li>
  );
}

export function RcTransparentShowcase() {
  const [selectedTitle, setSelectedTitle] = useState(rcTransparentRecords[0]?.title ?? '');
  // Nested story iframes do not inherit the toolbar globals — the embedded
  // theme is forced explicitly via &globals=theme:… on the iframe URL.
  const [embeddedTheme, setEmbeddedTheme] = useState<'light' | 'dark'>(initialEmbeddedTheme);

  const selected: RcTransparentRecord | undefined = useMemo(
    () => rcTransparentRecords.find((r) => r.title === selectedTitle),
    [selectedTitle],
  );

  return (
    <div className={styles.root}>
      <div className={styles.menu}>
        <div className={styles.menuHeader}>
          <p className={styles.menuTitle}>rc_transparent() migration</p>
          <p className={styles.menuCount}>
            {rcTransparentRecords.length} visually impactful components — rgba(var(--token-rgb), a) → color-mix()
          </p>
        </div>
        <div className={styles.menuList}>
          {rcTransparentRecords.map((record) => (
            <button
              key={record.title}
              className={`${styles.item} ${record.title === selectedTitle ? styles.itemActive : ''}`}
              onClick={() => setSelectedTitle(record.title)}
            >
              {record.title}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.detail}>
        {selected && (
          <>
            <div className={styles.detailHeader}>
              <div className={styles.detailTitleRow}>
                <h2 className={styles.detailTitle}>{selected.title}</h2>
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
              <p className={styles.detailPath}>{selected.path}</p>
              <p className={styles.inspect}>👁 {selected.inspect}</p>
              <ul className={styles.changeList}>
                {selected.changes.map((change, i) => (
                  <ChangePair key={i} before={change.before} after={change.after} />
                ))}
              </ul>
            </div>
            <CssUpdateRenderedComponent
              theme={embeddedTheme}
              record={{
                title: selected.title,
                path: selected.path,
                changes: [],
                storyId: selected.storyId,
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
