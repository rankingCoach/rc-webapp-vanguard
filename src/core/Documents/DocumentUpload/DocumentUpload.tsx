import { Collapse } from '@mui/material';
import { translationService } from '@services/translation.service';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { ContentType } from '@vanguard/Documents/Document.types';
import { DocumentContentProcessor } from '@vanguard/FileSelect/MediaItemProcessors/DocumentContentProcessor';
import { ImageContentProcessor } from '@vanguard/FileSelect/MediaItemProcessors/ImageContentProcessor';
import { ImageCompressorTransformer } from '@vanguard/FileSelect/MediaItemTransformers/ImageCompressorTransformer';
import { FileSizeValidator } from '@vanguard/FileSelect/MediaItemValidators/FileSizeValidator';
import { MediaItemSelectInput } from '@vanguard/FileSelect/MediaItemSelectInput';
import { MediaItemFile } from '@vanguard/Gallery/Gallery/Gallery';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { snackbarService } from '@vanguard/SnackbarRoot/SnackBarService';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useState } from 'react';

import { DocumentDataType, DocumentFileMimeType } from '../Document.types';
import { DocumentDisplay } from '@vanguard/Documents';
import styles from './DocumentUpload.module.scss';

export type DocumentUploadProps = {
  onDocumentSelected: (document: DocumentDataType) => void;
  onDocumentRemoved: () => void;
  width?: string;
  height?: string;
  testId?: string;
  documentName?: string;
};

const imageCompressorTransformer = new ImageCompressorTransformer({
  compressorOptions: { maxWidth: 3000, maxHeight: 3000, quality: 0.8, convertSize: 5242880 },
});
const documentContentProcessor = new DocumentContentProcessor();
const imageContentProcessor = new ImageContentProcessor({});
const fileSizeValidator = new FileSizeValidator({ maxSize: 5242880 });

export const DocumentUpload = (props: DocumentUploadProps) => {
  const {
    testId = 'DocumentUpload',
    onDocumentSelected,
    onDocumentRemoved,
    width = '192px',
    height = '154px',
    documentName,
  } = props;

  const [document, setDocument] = useState<DocumentDataType | undefined>();
  const [isFilePickerOpen, setIsFilePickerOpen] = useState(false);

  const text = documentName
    ? translationService.get('Upload %documentName%', { documentName: documentName }).value
    : 'Upload document';

  const handleFilesSelected = (files: MediaItemFile[]) => {
    const mediaItem = files[0];
    if (!mediaItem) return;

    if (mediaItem.isInvalid) {
      snackbarService.openErrorSnackbar('File size must be between 10kb and 5MB.');
      return;
    }

    const fileSrc = mediaItem.mediaItemContent?.base64EncodedContent;
    if (!fileSrc) return;

    const fileName = (mediaItem.file as File)?.name ?? 'document';

    const doc: DocumentDataType = {
      srcIsBase64: true,
      fileSrc,
      fileName,
      fileMimeType: mediaItem.fileType as DocumentFileMimeType,
      documentName,
    };
    setDocument(doc);
    onDocumentSelected(doc);
  };

  const handleRemove = () => {
    setDocument(undefined);
    onDocumentRemoved();
  };

  const handleChange = () => {
    setIsFilePickerOpen(true);
  };

  return (
    <ComponentContainer testId={testId} className={styles.container}>
      <Text type={TextTypes.textHelp} fontWeight={FontWeights.medium}>
        {documentName}
      </Text>

      <Collapse in={!!document?.fileSrc}>
        <UploadDocumentEditGroup onRemove={handleRemove} onChange={handleChange} />
      </Collapse>

      <Render if={!document?.fileSrc || !document?.fileMimeType}>
        <div style={{ width: width, height: height }}>
          <UploadDocumentButton text={text} onClick={handleChange} />
        </div>
      </Render>

      <Render if={!!document?.fileSrc && !!document?.fileMimeType}>
        <DocumentDisplay
          fileName={document?.fileName ?? 'file'}
          fileSrc={document?.fileSrc ?? ''}
          fileMimeType={document?.fileMimeType as DocumentFileMimeType}
          width={width}
          height={height}
          showDownload={false}
        />
      </Render>

      <MediaItemSelectInput
        isOpen={isFilePickerOpen}
        openCallback={() => setIsFilePickerOpen(false)}
        accept={[ContentType.APPLICATION_PDF, ContentType.IMAGE_PNG, ContentType.IMAGE_JPG, ContentType.IMAGE_JPEG]}
        mediaItemTransformers={[imageCompressorTransformer]}
        mediaItemProcessors={[documentContentProcessor, imageContentProcessor]}
        mediaItemValidators={[fileSizeValidator]}
        onFilesSelected={handleFilesSelected}
      />
    </ComponentContainer>
  );
};

const UploadDocumentButton = (props: { onClick: () => void; text: string }) => {
  return (
    <ComponentContainer testId={'UploadDocumentPlaceholder'} onClick={props.onClick} className={styles.button}>
      <Icon type={IconSize.large} hasCircle={true} color={'--n000'} fillColor={'--p500'} circleSize={40}>
        {IconNames.add}
      </Icon>
      <Text fontWeight={FontWeights.bold} color={'--p500'}>
        {props.text}
      </Text>
    </ComponentContainer>
  );
};

const UploadDocumentEditGroup = (props: { onRemove: () => void; onChange: () => void }) => {
  return (
    <ComponentContainer testId={'UploadDocumentEditGroup'} className={styles.editGroup}>
      <Button onClick={props.onRemove} type={ButtonTypes.secondary} size={ButtonSizes.small}>
        {'Remove'}
      </Button>
      <Button onClick={props.onChange} type={ButtonTypes.secondary} size={ButtonSizes.small}>
        {'Change'}
      </Button>
    </ComponentContainer>
  );
};
