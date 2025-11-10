import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function CalendarPopUp({ open, handleClose }) {
  return (
    <React.Fragment>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"How To Use Calendar"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            To generate the Apple Calendar, please email yourself the downloaded file into the Mail App. 
            Using any email client other than the Mail App will not work. Afterwords, simply click on the attachment and it will be added to your calendar.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>OK</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}