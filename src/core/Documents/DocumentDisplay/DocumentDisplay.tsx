import { px2 } from '@globalStyles';
import { downloadFile, inspectFileMimeTypeFromURL } from '@helpers/download-helpers';
import { Collapse } from '@mui/material';
import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Render } from '@vanguard/Render/Render';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useEffect, useState } from 'react';

import {
  CONTENT_TYPE_IMAGE_JPEG,
  CONTENT_TYPE_IMAGE_JPG,
  CONTENT_TYPE_IMAGE_PNG,
  DocumentDataType,
  DocumentFileMimeType,
} from '../Document.types';
import styles from './DocumentDisplay.module.scss';

export type DocumentDisplayProps = {
  testId?: string;
  width?: string;
  height?: string;
  showDownload?: boolean;
} & DocumentDataType;

export const DocumentDisplay = (props: DocumentDisplayProps) => {
  const {
    testId = 'DocumentDisplay',
    fileSrc,
    width = '192px',
    height = '154px',
    documentName,
    showDownload = true,
    fileName,
    fileMimeType: fileMimeTypeProp,
  } = props;

  const [format, setFormat] = useState<DocumentFileMimeType>(fileMimeTypeProp);
  useEffect(() => {
    if (fileMimeTypeProp == 'unknown') {
      inspectFileMimeTypeFromURL(fileSrc).then((format) => {
        setFormat(format);
      });
    } else {
      setFormat(fileMimeTypeProp);
    }
  }, [fileSrc]);

  const getContent = () => {
    if ([CONTENT_TYPE_IMAGE_PNG, CONTENT_TYPE_IMAGE_JPG, CONTENT_TYPE_IMAGE_JPEG].includes(format)) {
      return (
        <div data-testid={`${testId}_IMAGE`} className={styles.image} style={{ width: width, height: height }}>
          <img src={fileSrc} />
        </div>
      );
    }

    if (format == 'application/pdf') {
      return (
        <embed
          data-testid={`${testId}_PDF`}
          className={styles.pdf}
          src={fileSrc}
          type={'application/pdf'}
          width={width}
          height={height}
        />
      );
    }

    // Display an empty card if the file format is unknown
    return (
      <div data-testid={`${testId}_IMAGE`} className={styles.image} style={{ width: width, height: height }}>
        <Icon color="--n400" type={IconSize.large}>
          {IconNames.document}
        </Icon>
      </div>
    );
  };

  /**
   * Return View
   * ---
   */
  return (
    <ComponentContainer testId={testId} className={styles.container}>
      <Collapse in={!!documentName}>
        <Text type={TextTypes.textHelp} fontWeight={FontWeights.medium}>
          {props.documentName}
        </Text>
      </Collapse>

      <Render if={showDownload}>
        <Button
          onClick={() => downloadFile(fileSrc, fileName, format)}
          type={ButtonTypes.muted}
          size={ButtonSizes.medium}
          iconLeft={IconNames.download}
        >
          {'Download'}
        </Button>
      </Render>

      {getContent()}

      <Collapse in={!!fileName}>
        <div style={{ maxWidth: width }}>
          <Text type={TextTypes.textCaption} color={'--n500'} className={px2} textWrap={'wrap'}>
            {fileName}
          </Text>
        </div>
      </Collapse>
    </ComponentContainer>
  );
};
