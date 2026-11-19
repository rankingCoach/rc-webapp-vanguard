// Frozen MUI implementation (HEAD b0b02c2) for the own-core differential; do not edit.
import { PUB_SUB_EVENTS, pubSubService } from '@helpers/pub-sub';
import { Slide, SlideProps } from '@mui/material';
import { LineAlert } from '@vanguard/LineAlert/LineAlert';
import React, { useEffect, useState } from 'react';
import { Snackbar } from '../Snackbar/Snackbar';
import { SnackbarType } from './SnackBarService';

type Props = {};

//TODO the direction should be given from opts
function SlideTransitionLeft(props: SlideProps) {
  return <Slide {...props} direction="left" />;
}

export const SnackbarRootMuiReference = (props: Props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [onClose, seOnClose] = useState<(() => void) | null>(null);
  const [type, setType] = useState<SnackbarType | undefined>(undefined);

  useEffect(() => {
    pubSubService.$sub(PUB_SUB_EVENTS.reactSnackbarOpen, ({ type, message, title, onClose }) => {
      //console.log("Snackbar: Open", type, message, title, onClose);
      setIsOpen(false);
      setMessage(message);
      seOnClose(() => onClose);
      setType(type);

      setTimeout(() => {
        setIsOpen(true);
      });
    });

    pubSubService.$sub(PUB_SUB_EVENTS.reactSnackbarClose, ({ id }) => {
      //console.log("Snackbar: close", id);
      setIsOpen(false);
    });
  }, []);

  return (
    <section className={''}>
      <Snackbar
        autoHideDuration={3000}
        TransitionComponent={SlideTransitionLeft}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        onClose={() => {
          setIsOpen(false);
          onClose && onClose();
        }}
        open={isOpen}
      >
        <div>
          <LineAlert type={type}>{message}</LineAlert>
        </div>
      </Snackbar>
    </section>
  );
};
