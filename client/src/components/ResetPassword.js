import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";
import { baseURL } from "../baseURL";

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!resetToken) {
      setError("Invalid or missing reset token");
    }
  }, [resetToken]);

  const validateForm = () => {
    if (!password || !confirmPassword) {
      setError("Password and confirm password are required");
      return false;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${baseURL}/users/reset-password/${resetToken}`,
        { password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      setSuccess(true);
      setError(null);
      setTimeout(() => {
        navigate("/login");
      });
    } catch (error) {
      if (error.response) {
        setError(
          error.response.data.error || "An error occurred. Please try again"
        );
      } else if (error.request) {
        setError("No response from server. Please try again");
      } else {
        setError("An error occurred. Please try again");
      }
      setSuccess(false);
    }
  };

  return (
    <Box
      component="form"
      sx={{
        "& > :not(style)": { m: 1, width: "80ch" },
      }}
      noValidate
      onSubmit={handleResetPassword}
      autoComplete="off"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Stack spacing={2}>
        <Typography variant="h3" gutterBottom align="center">
          Reset Password
        </Typography>
        {success && (
          <Alert severity="success">
            Password reset successful. Please log in.
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm Password"
          variant="outlined"
          type="password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button type="submit" variant="contained" color="primary">
          Reset Password
        </Button>
      </Stack>
    </Box>
  );
};

export default ResetPassword;
