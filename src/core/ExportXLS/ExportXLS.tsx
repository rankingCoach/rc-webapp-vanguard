import { Button, ButtonSizes, ButtonTypes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { IconNames } from '@vanguard/Icon/IconNames';
import { FontWeights } from '@vanguard/Text/Text';
// @ts-ignore
import * as FileSaver from 'file-saver';
import React, { SyntheticEvent } from 'react';
import * as XLSX from 'xlsx';

import styles from './ExportXLS.module.scss';

export interface ExportXLSProps {
  rows?: Array<object>;
  fileName?: string;
  buttonText?: string;
}

const exportToCSV = (
  csvData: any,
  fileName: string,
  fileExtension: string = '.xlsx',
  fileType: string = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
) => {
  const ws = XLSX.utils.json_to_sheet(csvData);
  const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
};

export const useExportXLS = (rows: Array<any> = [], fileName: string = `export_${Date.now()}`) => {
  const exportHandler = () => exportToCSV(rows, fileName);
  return {
    exportHndlerFn: exportHandler,
  };
};

export const ExportXLS = (props: ExportXLSProps) => {
  const { rows = [], fileName = `export_${Date.now()}`, buttonText = 'Export XLS' } = props;

  const exportHandler = (e: SyntheticEvent) => exportToCSV(rows, fileName);

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
