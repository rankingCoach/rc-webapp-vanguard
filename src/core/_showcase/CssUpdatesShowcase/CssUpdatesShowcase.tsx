import { useMemo, useState } from 'react';

import { CssUpdateRenderedComponent } from './CssUpdateRenderedComponent/CssUpdateRenderedComponent';
import styles from './CssUpdatesShowcase.module.scss';
import { type CssUpdateRecord, cssUpdateRecords } from './data';

/** Matches #hex, rgb()/rgba(), and var(--token). */
const COLOR_RE = /(rgba?\((?:[^()]|\([^()]*\))*\)|var\(--[^)]+\)|#[0-9a-fA-F]{3,8})/g;

/** First folder under src/ (the "domain"), e.g. common / core / components. */
function domainOf(path: string): string {
  const parts = path.split('/');
  const i = parts.indexOf('src');
  return i >= 0 && parts[i + 1] ? parts[i + 1] : 'other';
}

function Swatch({ color }: { color: string }) {
  return (
    <span className={styles.swatch} title={color}>
      <span className={styles.swatchInner} style={{ background: color }} />
    </span>
  );
}

/** Renders one change line, appending a color swatch after every color value. */
function ChangeLine({ text }: { text: string }) {
  const parts = text.split(COLOR_RE);
  return (
    <li className={styles.changeItem}>
      {parts.map((part, i) => {
        if (!part) return null;
        const isColor = i % 2 === 1; // capture groups land on odd indices
        return isColor ? (
          <span key={i}>
            <code>{part}</code>
            <Swatch color={part} />
          </span>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </li>
  );
}

export function CssUpdatesShowcase() {
  const [filter, setFilter] = useState('');
  const [selectedPath, setSelectedPath] = useState(cssUpdateRecords[0]?.path ?? '');

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const filtered = cssUpdateRecords.filter(
      (r) => !q || r.title.toLowerCase().includes(q) || r.path.toLowerCase().includes(q),
    );
    const byDomain = new Map<string, CssUpdateRecord[]>();
    for (const r of filtered) {
      const d = domainOf(r.path);
      if (!byDomain.has(d)) byDomain.set(d, []);
      byDomain.get(d)!.push(r);
    }
    return [...byDomain.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filter]);

  const selected = useMemo(() => cssUpdateRecords.find((r) => r.path === selectedPath), [selectedPath]);

  return (
    <div className={styles.root}>
      <div className={styles.menu}>
        <div className={styles.menuHeader}>
          <p className={styles.menuTitle}>CSS Token Migration</p>
          <p className={styles.menuCount}>{cssUpdateRecords.length} modified stylesheets</p>
          <input
            className={styles.filter}
            placeholder="Filter…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className={styles.menuList}>
          {groups.map(([domain, records]) => (
            <div className={styles.group} key={domain}>
              <div className={styles.groupTitle}>{domain}</div>
              {records.map((r) => (
                <button
                  key={r.path}
                  className={`${styles.item} ${r.path === selectedPath ? styles.itemActive : ''}`}
                  onClick={() => setSelectedPath(r.path)}
                >
                  <span>{r.title}</span>
                  <span className={`${styles.tag} ${r.storyId ? styles.tagStory : styles.tagFallback}`}>
                    {r.storyId ? 'story' : 'fallback'}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.detail}>
        {selected ? (
          <>
            <div>
              <h1 className={styles.detailTitle}>{selected.title}</h1>
              <p className={styles.detailPath}>{selected.path}</p>
            </div>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>What changed</p>
              {selected.changes.length ? (
                <ul className={styles.changeList}>
                  {selected.changes.map((c, i) => (
                    <ChangeLine key={i} text={c} />
                  ))}
                </ul>
              ) : (
                <p className={styles.empty}>No textual changes detected.</p>
              )}
            </div>

            <div className={styles.section}>
              <p className={styles.sectionTitle}>Rendered component</p>
              <CssUpdateRenderedComponent record={selected} />
            </div>
          </>
        ) : (
          <p className={styles.empty}>Select a stylesheet from the left.</p>
        )}
      </div>
    </div>
  );
}
