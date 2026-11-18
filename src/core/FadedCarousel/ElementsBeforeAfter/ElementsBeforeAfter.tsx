import React from 'react';

export interface ElementsBeforeAfterProps {
  children: React.JSX.Element[];
  widthElement?: string | number;
  margin?: number | string;
  className?: string;
  isFirstElement?: boolean;
}

export const ElementsBeforeAfter = (props: ElementsBeforeAfterProps) => {
  const { children, widthElement = 50, margin = 0, className, isFirstElement = false } = props;

  const style = (index: number) => {
    const elementStyle: Record<string, string> = {
      width: `${widthElement}%`,
    };

    if (isFirstElement) {
      if (index === 0) {
        elementStyle['marginLeft'] = `${margin}%`;
      }
    } else if (index + 1 === children.length) {
      elementStyle['marginRight'] = `${margin}%`;
    }

    return elementStyle;
  };

  return (
    <>
      {children.map((element, index) => (
        <div data-slot="elements-before-after" key={index} style={style(index)} className={className}>
          {element}
        </div>
      ))}
    </>
  );
};
