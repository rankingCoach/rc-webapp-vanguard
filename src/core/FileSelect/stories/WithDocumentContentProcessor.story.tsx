import { ContentType } from '@vanguard/Documents/Document.types';
import { DocumentContentProcessor } from '@vanguard/FileSelect/MediaItemProcessors/DocumentContentProcessor';

import { createMockOnFilesSelected, createMockOpenCallback, Story } from './_MediaItemSelectInput.default';

const documentContentProcessor = new DocumentContentProcessor();

export const WithDocumentContentProcessor: Story = {
  args: {
    isOpen: false,
    openCallback: createMockOpenCallback(),
    onFilesSelected: createMockOnFilesSelected(),
    accept: [ContentType.APPLICATION_PDF],
    mediaItemProcessors: [documentContentProcessor],
  },
};
