import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights } from '@vanguard/Text/Text';
import React, { SyntheticEvent } from 'react';

import styles from './ExportXLS.module.scss';

export interface ExportXLSProps {
  rows?: Array<object>;
  fileName?: string;
  buttonText?: string;
}

/** xlsx and file-saver are loaded on the first export, so they stay out of the eager bundle. */
const exportToCSV = async (
  csvData: any,
  fileName: string,
  fileExtension: string = '.xlsx',
  fileType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
) => {
  const [XLSX, fileSaver] = await Promise.all([import('xlsx'), import('file-saver')]);
  // file-saver is CommonJS: depending on interop its namespace exposes saveAs directly or only under default.
  const FileSaver = ('saveAs' in fileSaver ? fileSaver : fileSaver.default) as {
    saveAs: (data: Blob, name: string) => void;
  };
  const ws = XLSX.utils.json_to_sheet(csvData);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

export const useExportXLS = (rows: Array<any> = [], fileName: string = `export_${Date.now()}`) => {
  const exportHandler = () => {
    void exportToCSV(rows, fileName);
  };
  return {
    exportHndlerFn: exportHandler,
  };
};

export const ExportXLS = (props: ExportXLSProps) => {
  const { rows = [], fileName = `export_${Date.now()}`, buttonText = 'Export XLS' } = props;

  const exportHandler = (e: SyntheticEvent) => {
    void exportToCSV(rows, fileName);
  };

  return (
    <ComponentContainer className={styles.container}>
      <Button
        onClick={exportHandler}
        iconLeft={IconNames.download}
        size={ButtonSizes.medium}
        type={ButtonTypes.muted}
        className={styles.button}
        fontWeight={FontWeights.bold}
      >
        {buttonText}
      </Button>
    </ComponentContainer>
  );
};
