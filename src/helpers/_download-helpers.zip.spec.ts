import JSZip from 'jszip';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { downloadZipFile } from './download-helpers';

// jsdom's Blob has no arrayBuffer(); FileReader works.
const readBlob = (b: Blob) =>
  new Promise<ArrayBuffer>((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.readAsArrayBuffer(b);
  });

/** Characterization (track f): downloadZipFile zips every fetched file and downloads one blob, before and after jszip became lazy. */
describe('downloadZipFile', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('fetches each file, zips them under their names and clicks one download link', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (src: string) => ({ arrayBuffer: async () => Buffer.from(`content of ${src}`) })),
    );
    let blob: Blob | undefined;
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: (b: Blob) => {
        blob = b;
        return 'blob:zip';
      },
      revokeObjectURL: () => {},
    });
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    await downloadZipFile(
      [
        { src: '/a.png', name: 'a.png' },
        { src: '/b.pdf', name: 'b.pdf' },
      ],
      'photos.zip',
    );

    expect(click).toHaveBeenCalledTimes(1);
    const zip = await JSZip.loadAsync(await readBlob(blob as Blob));
    expect(Object.keys(zip.files).sort()).toEqual(['a.png', 'b.pdf']);
    expect(await zip.file('b.pdf')?.async('string')).toBe('content of /b.pdf');
  });
});
