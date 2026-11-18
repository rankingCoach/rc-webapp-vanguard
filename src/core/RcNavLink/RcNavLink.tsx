import React from 'react';

// export type LinkComponentProps = LinkComponent<'a'>;
// export type LinkComponentProps = LinkComponent<'a'> & {};
export type LinkComponentProps = {
  to?: string;
  params: {
    locationId: string;
  };
  children?: React.ReactNode;
};

export const RcNavLink = (props: LinkComponentProps) => {
  let { to, params, children } = props;
  // if (to && to.indexOf("/") === 0) {
  //   to = to.substring(1);
  // }
  if (to && params.locationId) {
    to = to.replace('$locationId', params.locationId);
  }
  return (
    <a data-slot={'rc-nav-link'} href={to} {...props}>
      {children}
    </a>
  );
};
