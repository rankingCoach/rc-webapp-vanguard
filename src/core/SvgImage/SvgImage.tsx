import * as React from 'react';

interface Props {
  path: string;
}

export const SvgImage = (props: Props) => {
  const { path } = props;
  const reactLogo = require(`${path}`);

  return <img data-slot={'svg-image'} src={reactLogo.default} height="120" />;
};
