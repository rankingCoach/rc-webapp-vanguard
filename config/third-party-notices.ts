import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, sep } from 'node:path';
import type { Plugin } from 'vite';

export interface PackageNotice {
  name: string;
  version: string;
  license: string;
  text: string;
}

/** The node_modules package directory that owns `file` (handles scoped and nested node_modules). */
export const packageDirOf = (file: string): string | undefined => {
  const marker = `${sep}node_modules${sep}`;
  const at = file.lastIndexOf(marker);
  if (at < 0) return undefined;
  const rest = file.slice(at + marker.length).split(sep);
  const depth = rest[0].startsWith('@') ? 2 : 1;
  return file.slice(0, at + marker.length) + rest.slice(0, depth).join(sep);
};

/** name, version, licence id and licence text (LICENSE/LICENCE/COPYING file) of the package at `dir`. */
export const readNotice = (dir: string): PackageNotice | undefined => {
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) return undefined;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
    name?: string;
    version?: string;
    license?: unknown;
    licenses?: { type?: string }[];
  };
  if (!pkg.name) return undefined;
  const file = readdirSync(dir).find((f) => /^(licen[cs]e|copying)([.-][\w.-]+)?$/i.test(f));
  // SPDX string, the legacy `{ type }` object, or the legacy `licenses: [{ type }]` array.
  const license =
    typeof pkg.license === 'string'
      ? pkg.license
      : typeof (pkg.license as { type?: string } | undefined)?.type === 'string'
        ? (pkg.license as { type: string }).type
        : Array.isArray(pkg.licenses) && pkg.licenses.length
          ? pkg.licenses.map((l) => l.type).join(' OR ')
          : 'SEE LICENSE';
  return {
    name: pkg.name,
    version: pkg.version ?? '',
    license,
    text: file ? readFileSync(join(dir, file), 'utf8').trim() : `(${license}; no licence file in the package)`,
  };
};

export const formatNotices = (title: string, notices: PackageNotice[]) =>
  [
    title,
    '',
    ...[...notices]
      .sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version))
      .map((n) => `${'='.repeat(80)}\n${n.name}@${n.version} (${n.license})\n${'-'.repeat(80)}\n${n.text}\n`),
  ].join('\n');

/**
 * Writes THIRD_PARTY_NOTICES.txt next to the bundle: the licence of every npm package whose code is bundled into
 * this build (MIT requires the notice to ship with copies). The minifier drops legal comments, so this file is the
 * place they live. Deterministic (sorted by name/version).
 */
export const thirdPartyNotices = (): Plugin => ({
  name: 'vanguard-third-party-notices',
  apply: 'build',
  enforce: 'post',
  generateBundle(_options, bundle) {
    const dirs = new Set<string>();
    for (const item of Object.values(bundle)) {
      if (item.type !== 'chunk') continue;
      for (const id of Object.keys(item.modules)) {
        const clean = id.replace(/^\0/, '').split('?')[0];
        const dir = packageDirOf(clean);
        if (dir) dirs.add(dir);
      }
    }
    const notices = [...dirs].map((d) => readNotice(d)).filter((n): n is PackageNotice => Boolean(n));
    const unique = new Map(notices.map((n) => [`${n.name}@${n.version}`, n]));
    this.emitFile({
      type: 'asset',
      fileName: 'THIRD_PARTY_NOTICES.txt',
      source: formatNotices(
        'Third-party software bundled into @rankingcoach/vanguard (runtime). Vendored type declarations: types/_vendor/mui.d.ts header.',
        [...unique.values()],
      ),
    });
  },
});
