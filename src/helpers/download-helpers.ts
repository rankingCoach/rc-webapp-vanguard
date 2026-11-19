import {
  CONTENT_TYPE_IMAGE_JPG,
  CONTENT_TYPE_IMAGE_PNG,
  CONTENY_TYPE_APPLICATION_PDF,
  DocumentFileMimeType,
} from '@vanguard/Documents/Document.types';

type FileMimeType = DocumentFileMimeType; // Extend if needed

export const downloadFile = async (fileSrc: string, fileName: string, mimeType?: FileMimeType) => {
  const response = await fetch(fileSrc);

  let fileBlob;
  if (mimeType) {
    const fileData = await response.arrayBuffer();
    fileBlob = new Blob([fileData], { type: mimeType });
  } else {
    fileBlob = await response.blob();
  }

  const fileURL = URL.createObjectURL(fileBlob);
  const link = document.createElement('a');
  link.href = fileURL;
  link.style.display = 'none';
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
  }, 0);
};

export const downloadZipFile = async (files: { src: string; name: string }[], zipFileName: string) => {
  // Loaded on use: jszip (~40 KB gzip) stays out of every importer's eager bundle.
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();

  // Fetch each file and add it to the ZIP
  for (const file of files) {
    const response = await fetch(file.src);
    const fileData = await response.arrayBuffer();
    zip.file(file.name, fileData);
  }

  // Generate the ZIP file and download it
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const zipURL = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = zipURL;
  link.style.display = 'none';
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(zipURL);
  }, 0);
};

export const downloadZipBlob = async (blob: Blob, zipFileName: string) => {
  const zipURL = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = zipURL;
  link.style.display = 'none';
  link.download = zipFileName;
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(zipURL);
  }, 0);
};

export async function inspectFileMimeTypeFromURL(url: string) {
  const response = await fetch(url, { method: 'GET', headers: { Range: 'bytes=0-20' } });
  const data = await response.arrayBuffer();
  const arr = new Uint8Array(data);
  const header = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');

  // Check for a few file type headers (magic numbers)
  const fileTypeMappings: Record<string, FileMimeType> = {
    'ff d8 ff': CONTENT_TYPE_IMAGE_JPG, // JPG/JPEG
    '89 50 4e 47 0d 0a 1a 0a': CONTENT_TYPE_IMAGE_PNG, // PNG
    '25 50 44 46': CONTENY_TYPE_APPLICATION_PDF, // PDF
  };

  for (const magicNumber in fileTypeMappings) {
    if (header.startsWith(magicNumber)) {
      return fileTypeMappings[magicNumber] as FileMimeType;
    }
  }

  return 'unknown' as FileMimeType;
}
