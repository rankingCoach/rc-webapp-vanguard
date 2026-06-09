import { ContentType } from '@vanguard/Documents/Document.types';
import { CsvContentValidator } from '@vanguard/FileSelect/MediaItemValidators/CsvContentValidator';

import { createMockOnFilesSelected, createMockOpenCallback, Story } from './_MediaItemSelectInput.default';

const csvContentValidator = new CsvContentValidator({ requiredHeaders: ['email', 'name'] });

export const WithCsvValidator: Story = {
  args: {
    isOpen: false,
    openCallback: createMockOpenCallback(),
    onFilesSelected: createMockOnFilesSelected(),
    accept: [ContentType.TEXT_CSV],
    mediaItemValidators: [csvContentValidator],
  },
};
