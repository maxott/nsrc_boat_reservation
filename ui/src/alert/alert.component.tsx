/* eslint-disable @typescript-eslint/explicit-function-return-type */
import * as React from 'react';
import { ReduxAction } from '@pihanga/core';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert, { AlertProps, Color } from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

// import { createLogger } from '@pihanga/core';

// const logger = createLogger('alert.component');

enum Reason { 'clickaway', 'unknown' }
type PiAlertClose = {
  reason: Reason;
};
export type PiAlertCloseAction = ReduxAction & PiAlertClose;

export type Props = {
  title?: string;
  message: string;
  severity: Color;
  isOpen?: boolean;
  asSnackBar: boolean;
  withAction: boolean;
  autoHideDuration: number;
  mui: {[k: string]: unknown};
  onClose: (ev: PiAlertClose) => void;
};

const DEF_OPTS = {
  message: '???',
  severity: 'info',
  isOpen: false,
  withAction: true,
  asSnackBar: true,
  autoHideDuration: 6000,
  mui: {},
};

function Alert(props: AlertProps) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export const AlertComponent = (opts: Props) => {
  const {
    title,
    message,
    severity,
    isOpen,
    asSnackBar,
    withAction,
    mui,
    onClose,
  } = { ...DEF_OPTS, ...opts };

  const action = withAction ? { onClose: handleClose } : {};

  function handleClose(_: React.SyntheticEvent, reason?: string) {
    const r = ((reason || 'unknown') as unknown) as Reason;
    onClose({ reason: r });
  }


  function renderAlertTitle() {
    if (title) {
      return (<AlertTitle>{title}</AlertTitle>);
    } else {
      return null;
    }
  }

  function renderAlert() {
    if (!asSnackBar && !isOpen) {
      return (<> </>);
    }
    return (
      <Alert {...action} severity={severity} {...mui}>
        { renderAlertTitle() }
        { message }
      </Alert>
    );
  }

  function renderSnackBar() {
    return (
      <Snackbar
        open={isOpen}
        autoHideDuration={6000}
        {...action}
      >
        { renderAlert() }
      </Snackbar>
    );
  }
  return asSnackBar ? renderSnackBar() : renderAlert();
};
