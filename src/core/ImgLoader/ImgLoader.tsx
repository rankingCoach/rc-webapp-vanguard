import { useDynamicImport } from '@custom-hooks/use-dynamic-import/use-dynamic-import';
import { alignItemsCenter, dFlexColumn, justifyContentCenter, mb1_5, mt1_5 } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { FontWeights, Text, TextReplacements, TextTypes } from '@vanguard/Text/Text';
import React from 'react';

export interface ImgLoaderProps {
  title?: string;
  description?: string;
  replacements?: TextReplacements;
}

export const ImgLoader = (props: ImgLoaderProps) => {
  const { title, description, replacements } = props;
  const { SvgIcon, loading, error } = useDynamicImport('gifs/loading.gif');
  return (
    <ComponentContainer data-slot="img-loader-container">
      <div data-slot="img-loader" className={classNames(dFlexColumn, alignItemsCenter, justifyContentCenter)}>
        <img data-slot="img-loader-image" style={{ width: 200, height: 200 }} src={SvgIcon} />

        <Text
          testId={'title'}
          className={classNames(mb1_5, mt1_5)}
          replacements={replacements}
          type={TextTypes.textIntro}
          fontWeight={FontWeights.bold}
          translate={false}
        >
          {title}
        </Text>

        <Text testId={'description'} className={mb1_5} replacements={replacements} translate={false}>
          {description}
        </Text>
      </div>
    </ComponentContainer>
  );
};
