import { fn } from 'storybook/test';
import { StoryObj } from '@storybook/react';

import { DocumentUpload } from '../DocumentUpload';

export type Story = StoryObj<typeof DocumentUpload>;

export const mockOnDocumentSelected = fn();
export const mockOnDocumentRemoved = fn();
