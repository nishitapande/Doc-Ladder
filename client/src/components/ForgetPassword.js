import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../baseURL";
import {
  Box,
  Alert,
  TextField,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import axios from "axios";

const ForgetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // validate form
  const validateForm = () => {
    if (!email) {
      setError("Email is required");
      return false;
    }
    setError(null);
    return true;
  };

  // handle form submission
  const handForgotPassword = async (e) => {
    e.preventDefault();
    if (!validateForm) return;
    try {
      // write a post route to forgot password to send email
      const response = await axios.post(
        `${baseURL}/users/forgot-password`,
        {
          email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess(true);
      setError(null);
      navigate(`/reset-password/${response.data.resetToken}`);
    } catch (error) {
      if (error.response) {
        setError(error.response.data.error);
      } else if (error.request) {
        console.log("Request failed", error.request);
        setError("Network Error");
      } else {
        console.log("Error", error.message);
        setError("An error have occured. Please try again later");
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
      autoComplete="off"
      onSubmit={handForgotPassword}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <Stack spacing={2}>
        <Typography variant="h4" gutterBottom align="left">
          Forgot Password
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="left">
          Enter your email address and we will send you a link to reset your
          password
        </Typography>
        {success && (
          <Alert severity="success">
            Password reset link has been sent to your email.
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          id="outlined-emial-input"
          label="Email"
          variant="outlined"
          tyoe="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button variant="conatined" type="submit" color="primary">
          Send Reset Link
        </Button>
      </Stack>
    </Box>
  );
};

export default ForgetPassword;
