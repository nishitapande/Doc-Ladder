import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";

const RemarkDialog = ({ open, handleClose, handleSubmit }) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState(false);

  const maxLength = 500;
  const onSubmit = () => {
    if (remarks.trim() === "") {
      setError(true);
    } else {
      handleSubmit(remarks);
      setRemarks("");
      setError(false);
    }
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setRemarks(newValue);
      setError(false);
    } else {
      setError(true);
    }
  };
  return (
    <Dialog open={open} onClose={handleChange}>
      <DialogTitle>Enter Remarks</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Remarks"
          type="text"
          fullWidth
          variant="outlined"
          value={remarks}
          onChange={handleChange}
          error={error}
          required
          helperText={
            error
              ? remarks.length > maxLength
                ? "Maximum length is 500 characters"
                : "Remarks field is required"
              : ""
          }
          inputProps={{
            style: { minWidth: "40ch" },
            maxLength: maxLength,
          }}
        />
        <Typography
          variant="caption"
          color="textSecondary"
          style={{
            marginTop: 8,
          }}
        >
          Maximum length: 500 characters
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          disabled={remarks.trim() === "" || remarks.length > maxLength}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemarkDialog;
