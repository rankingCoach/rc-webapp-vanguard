import 'cropperjs/src/css/cropper.scss';
import './Cropper.scss';

import { InfoIcon } from '@common/InfoIcon/InfoIcon';
import { useToggle } from '@custom-hooks/useToggle';
import { dFlexColumn, gap2, mt2 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { GetCampaignByFieldsQueryParams } from '@models/business-processor/GetCampaignByFieldsQueryParams';
import { Collapse } from '@vanguard/Collapse/Collapse/Collapse';
import { InternalFile } from '@vanguard/FileSelect/MediaItemSelectInput';
import { galleryFindRational } from '@vanguard/Gallery/Gallery/gallery-find-rational';
import { Slider } from '@vanguard/Slider/Slider';
import Cropper from 'cropperjs';
import React, { MutableRefObject, useEffect, useRef, useState } from 'react';
import CropperBase from 'react-cropper';

import { Button, ButtonTypes, ButtonSizes } from '../Button/Button';
import { Icon, IconSize } from '../Icon/Icon';
import { IconNames } from '../Icon/IconNames';
import { Modal } from '../Modal/Modal';
import { ModalBody } from '../Modal/ModalBody/ModalBody';
import { ModalHeader } from '../Modal/Modalheader/ModalHeader';
import { ModalResponse } from '../Modal/ModalResponse';
import { FontWeights, Text, TextTypes } from '../Text/Text';

const CSS_VARIABLE_PERCENTAGE_NAME = '--rc-cropper-sidebar-width';
const CSS_VARIABLE_BORDER_PERCENTAGE_NAME = '--rc-cropper-border-width';

type SaveFunction = (imageFile?: InternalFile[]) => void;

export type ExtendedCropperProps = {
  secondaryAspectRatio?: number;
} & Cropper.Options;

export type RcCropperProps = {
  imageFile: File | Blob;
  close: (value?: ModalResponse<GetCampaignByFieldsQueryParams>) => void;
  closeAfterCrop?: boolean;
  save: SaveFunction;
} & ExtendedCropperProps;

export const RcCropper = (props: RcCropperProps) => {
  const { save, close, imageFile, closeAfterCrop = true } = props;
  const cropperProps: RcCropperProps = {
    aspectRatio: 1,

    viewMode: 0,
    dragMode: 'move',

    responsive: true,
    restore: true,
    checkCrossOrigin: true,
    checkOrientation: true,
    rotatable: false,
    scalable: true,

    modal: true,
    guides: false,
    center: false,
    highlight: false,
    background: false,

    autoCrop: true,
    movable: true,
    zoomable: true,
    zoomOnTouch: false,
    zoomOnWheel: false,

    cropBoxMovable: false,
    cropBoxResizable: false,
    toggleDragModeOnDblclick: false,

    ...props,
  };

  const cropperRef = useRef<HTMLImageElement | any>(null);
  const secondaryCropperRef = useRef<HTMLImageElement | any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cropperDetailsOpen, toggleDetailsOpen] = useToggle(false);
  const [src, setSrc] = useState<string>('');
  let prevZoom = 0;
  const { aspectRatio, secondaryAspectRatio } = cropperProps;

  useEffect(() => {
    const r = document.querySelector(':root');

    if (aspectRatio && secondaryAspectRatio) {
      // when secondary aspect ratio exists we create
      // visual representation using before and after
      const { numerator: numeratorA, denominator: denominatorA } = galleryFindRational(aspectRatio);
      const { numerator: numeratorS, denominator: denominatorS } = galleryFindRational(secondaryAspectRatio);
      const heightDiff = denominatorA / denominatorS;
      const adjustedLen = numeratorS * heightDiff;
      const percentage = (((numeratorA - adjustedLen) / numeratorA) * 100) / 2;
      // @ts-ignore
      r?.style.setProperty(CSS_VARIABLE_PERCENTAGE_NAME, `${percentage}%`);
      // @ts-ignore
      r?.style.setProperty(CSS_VARIABLE_BORDER_PERCENTAGE_NAME, '1px');
    }

    if (!secondaryAspectRatio) {
      // @ts-ignore
      r?.style.setProperty(CSS_VARIABLE_PERCENTAGE_NAME, '0%');
      // @ts-ignore
      r?.style.setProperty(CSS_VARIABLE_BORDER_PERCENTAGE_NAME, '0px');
    }
  }, [aspectRatio, secondaryAspectRatio]);
  /**
   * Effect: Image file changed
   */
  useEffect(() => {
    if (imageFile) {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        if (typeof fileReader.result === 'string') {
          setSrc(fileReader.result);
        }
      };
      fileReader.readAsDataURL(imageFile);
    }
  }, [imageFile]);

  useEffect(() => {
    setTimeout(() => {
      syncCroppers();
    }, 0);
  }, [cropperRef.current, secondaryCropperRef.current]);

  const saveFn: SaveFunction = (imageFiles?: InternalFile[]) => {
    save(imageFiles);

    if (closeAfterCrop) {
      close();
    }
  };
  /**
   * FN: Synchronise the two croppers
   * when the primary one changes change the second hiddden one
   * we use this to create multiple crop zones
   */
  const syncCroppers = () => {
    const copper = cropperRef?.current?.cropper;
    const secondaryCropper = secondaryCropperRef?.current?.cropper;

    if (!copper || !secondaryCropper) {
      return false;
    }
    const style = getComputedStyle(document.body);
    const percentageMove = parseInt(style.getPropertyValue(CSS_VARIABLE_PERCENTAGE_NAME));
    /**
     * Left position is slightly altered by the percentage difference in crop areas
     * We keep acount of that when calculatin the new left
     * */
    const leftPos = copper.canvasData?.left - copper.cropBoxData?.width * (percentageMove / 100);
    secondaryCropper.moveTo(leftPos, copper.canvasData?.top);
    // we remove the width when setting the new data because we have different aspect ratios
    // width would mess things up
    const { width, ...restCbData } = copper.cropBoxData ?? {};
    secondaryCropper.setCropBoxData({
      ...restCbData,
    });
    secondaryCropper.setData({
      ...copper.data,
    });
  };

  /**
   * FN: Handle Zoom
   */
  const handleZoom = (event: any, value: number) => {
    if (!cropperRef?.current || !cropperRef?.current['cropper']) {
      console.warn('Cropper: cropper is not initialized');
      return;
    }

    if (!secondaryCropperRef?.current || !secondaryCropperRef?.current['cropper']) {
      console.warn('Cropper: cropper is not initialized');
      return;
    }

    let zoomTimes;
    let zoomIn;

    if (value > prevZoom) {
      zoomTimes = value - prevZoom;
      zoomIn = true;
    } else {
      zoomTimes = prevZoom - value;
      zoomIn = false;
    }

    for (let i = 0; i < zoomTimes; i++) {
      cropperRef.current['cropper'].zoom(zoomIn ? 0.02 : -0.02);
      secondaryCropperRef.current['cropper'].zoom(zoomIn ? 0.02 : -0.02);
    }

    prevZoom = value;
  };

  /**
   * FN: Get Cropped Image Blob From CropperJS
   */
  const getCroppedCanvas = (ref: MutableRefObject<HTMLImageElement | null>) => {
    //@ts-ignore
    if (!ref?.current || !ref?.current['cropper']) {
      console.warn('Cropper: cropper is not initialized');
      return;
    }
    //@ts-ignore
    return ref.current['cropper'].getCroppedCanvas({
      fillColor: '#fff',
    });
  };

  /**
   * FN: Get Cropped Image Blob From CropperJS as a promise
   */
  const getCroppedCanvasBlob = async (ref: MutableRefObject<HTMLImageElement | null>): Promise<Blob | null> => {
    const canvas = getCroppedCanvas(ref);

    return new Promise((resolve) => {
      canvas?.toBlob((blob: Blob | null) => {
        resolve(blob);
      });
    });
  };

  /**
   * Save Image
   */
  const saveImage = () => {
    setIsLoading(true);

    if (typeof save === 'function') {
      Promise.all([getCroppedCanvasBlob(cropperRef), getCroppedCanvasBlob(secondaryCropperRef)]).then(
        ([blob1, blob2]) => {
          setIsLoading(false);
          const blob1Parsed: InternalFile | undefined = blob1
            ? {
                file: blob1,
                filePriority: 'primary',
              }
            : undefined;
          const blob2Parsed: InternalFile | undefined = blob2
            ? {
                file: blob2,
                filePriority: 'secondary',
              }
            : undefined;

          if (!secondaryAspectRatio) {
            if (blob1Parsed) {
              saveFn([blob1Parsed]);
            }
          } else {
            if (blob1Parsed && blob2Parsed) {
              saveFn([blob1Parsed, blob2Parsed]);
            }
          }
        },
      );
    }
  };
  const getReplacements = () => {
    if (aspectRatio === 1) {
      return {
        aspect_ratio_values: '1:1',
        min_height: '250',
        min_width: '250',
        max_height: '500',
        max_width: '500',
      };
    }
    if (aspectRatio === 16 / 9) {
      return {
        aspect_ratio_values: '16:9',
        min_height: '270',
        min_width: '480',
        max_height: '1192',
        max_width: '2120',
      };
    }
  };

  /**
   * Return view
   * ---
   */
  return (
    <Modal className={'Cropper-modal'} modalPosition={'center'} maxWidth={'900px'}>
      <ModalHeader closeFn={close}>
        <Text fontWeight={FontWeights.bold} type={TextTypes.heading4}>
          Crop your photo
        </Text>
      </ModalHeader>

      <ModalBody>
        <CropperBase
          className={'CropperBase-container'}
          src={src}
          ref={cropperRef}
          {...cropperProps}
          aspectRatio={aspectRatio}
          cropmove={() => {
            syncCroppers();
          }}
        />
        <CropperBase
          className={classNames('CropperBase-container', 'CropperBase-hidden')}
          src={src}
          ref={secondaryCropperRef}
          {...cropperProps}
          aspectRatio={secondaryAspectRatio}
        />
        <div className={'Cropper-slider-container'}>
          <div className={'Cropper-slider'}>
            <Icon color={'--n000'}>{IconNames.remove}</Icon>
            <Slider
              value={0}
              min={-50}
              max={50}
              step={1}
              valueLabelDisplay={'auto'}
              type={'simple'}
              size={'small'}
              onChange={handleZoom}
            />
            <Icon color={'--n000'}>{IconNames.add}</Icon>
          </div>
        </div>
      </ModalBody>

      <div className={'modal-footer'}>
        <div className={'Cropper-footer-action-container'}>
          <span onClick={toggleDetailsOpen} className={'Cropper-footer-info-details'}>
            <InfoIcon size={IconSize.small} />
            <Text type={TextTypes.text} color={'--p500'}>
              Cropping details
            </Text>
          </span>

          <div className={'action-buttons'}>
            <Button size={ButtonSizes.extraLarge} type={ButtonTypes.default} onClick={close}>
              Cancel
            </Button>
            <Button size={ButtonSizes.extraLarge} type={ButtonTypes.primary} onClick={saveImage} isLoading={isLoading}>
              Save
            </Button>
          </div>
        </div>

        <Collapse isOpen={cropperDetailsOpen}>
          <div className={classNames(dFlexColumn, gap2, mt2)}>
            <Text>
              To ensure the image is presented in the best possible way, you can use the zoom feature, enabling you to
              fit more or less content in to the crop area
            </Text>
            <Text>
              If you would only like to upload a certain section of an image, you can do so by moving the cropping tool
              borders over the desired area of the picture
            </Text>
            <Text>You can enlarge and minimize the crop size by clicking and dragging the cropping borders</Text>
            {aspectRatio && (
              <Text replacements={getReplacements()}>
                Uploaded images must have a %aspect_ratio_values% aspect ratio, with a minimum size of %min_height%px
                tall and %min_width%px wide and a maximum size of %max_height%px tall and %max_width%px wide.
              </Text>
            )}
            <Text>File size must be between 10kb and 5MB.</Text>
          </div>
        </Collapse>
      </div>
    </Modal>
  );
};
