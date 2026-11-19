import { StoryObj } from '@storybook/react';

import { DocumentDisplay } from '../DocumentDisplay';

export type Story = StoryObj<typeof DocumentDisplay>;

export const testDocumentData = {
  fileName: 'sample-document.pdf',
  fileSrc:
    'data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlIC9DYXRhbG9nCi9QYWdlcyAyIDAgUgo+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlIC9QYWdlcwovS2lkcyBbMyAwIFJdCi9Db3VudCAxCj4+CmVuZG9iagozIDAgb2JqCjw8L1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwvTGVuZ3RoIDg4Pj4Kc3RyZWFtCmJ0CjEwMCAyMDAgVEQoL0YxIDEyIFRmCihIZWxsbyBXb3JsZCkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTkgMDAwMDAgbiAKMDAwMDAwMDEwOSAwMDAwMCBuIAowMDAwMDAwMTk3IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgozMDQpCiUlRU9GCg==',
  fileMimeType: 'application/pdf' as const,
  documentName: 'Sample Document',
};

export const testImageData = {
  fileName: 'sample-image.png',
  fileSrc:
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  fileMimeType: 'image/png' as const,
  documentName: 'Sample Image',
};
