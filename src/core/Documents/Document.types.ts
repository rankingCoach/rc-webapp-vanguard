export const CONTENT_TYPE_IMAGE_ANY = 'image/*';
export const CONTENT_TYPE_IMAGE_JPEG = 'image/jpeg';
export const CONTENT_TYPE_IMAGE_JPG = 'image/jpg';
export const CONTENT_TYPE_IMAGE_PNG = 'image/png';
export const CONTENT_TYPE_VIDEO_MOV = 'video/quicktime';
export const CONTENT_TYPE_VIDEO_MP4 = 'video/mp4';
export const CONTENT_TYPE_UNKNOWN = 'unknown';
export const CONTENY_TYPE_APPLICATION_PDF = 'application/pdf';

export enum ContentType {
  FILE_ANY = '*',
  IMAGE_ANY = 'image/*',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_JPG = 'image/jpg',
  IMAGE_PNG = 'image/png',
  VIDEO_ANY = 'video/*',
  VIDEO_MOV = 'video/quicktime',
  VIDEO_MP4 = 'video/mp4',
  UNKNOWN = 'unknown',
  APPLICATION_PDF = 'application/pdf',
  TEXT_CSV = 'text/csv',
}

export type MediaItemFileType = `${ContentType}`;

export type DocumentFileMimeType =
  | typeof CONTENY_TYPE_APPLICATION_PDF
  | typeof CONTENT_TYPE_IMAGE_PNG
  | typeof CONTENT_TYPE_IMAGE_JPG
  | typeof CONTENT_TYPE_IMAGE_JPEG
  | typeof CONTENT_TYPE_UNKNOWN;

export type DocumentDataType = {
  documentName?: string;
  fileName: string;
  fileSrc: string; // or Base64
  srcIsBase64?: boolean;
  fileMimeType: DocumentFileMimeType; // png | jpg | jpeg | pdf
};
