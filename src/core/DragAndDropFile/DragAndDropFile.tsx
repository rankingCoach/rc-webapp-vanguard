import styles from './DragAndDropFile.module.scss';
import { classNames } from '@helpers/classNames';
import React, { useRef, useState } from 'react';

interface FileData {
  name: string;
  content: string;
}

type FileCallback = (fileData: FileData) => void;

export type DragAndDropFileProps = { onFileDrop: FileCallback };
export const DragAndDropFile: React.FC<DragAndDropFileProps> = ({ onFileDrop }) => {
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const fileList = e.dataTransfer.files;
    if (fileList.length === 0) return;

    handleFile(fileList[0]);
  };

  const handleFilePickerClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList && fileList.length > 0) {
      handleFile(fileList[0]);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      if (event.target && event.target.result) {
        const content = event.target.result.toString();
        const fileData: FileData = {
          name: file.name,
          content,
        };

        onFileDrop(fileData);
      }
    };

    if (file.type.includes('text') || file.type.includes('json')) {
      reader.readAsText(file);
    } else if (file.type.includes('image')) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      data-slot={'drag-and-drop-file'}
      className={classNames(styles.dropzone, dragging ? styles.dragging : undefined)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleFilePickerClick}
    >
      <label data-slot={'drag-and-drop-file-label'}>
        Drag and drop files here
        <input
          data-slot={'drag-and-drop-file-input'}
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
      </label>
    </div>
  );
};
