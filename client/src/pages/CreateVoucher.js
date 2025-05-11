import React, { useContext, useEffect, useState } from "react";
import AuthContext from "../Context";
import { baseURL } from "../baseURL";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import { Container, Typography, TextField, Button, Alert } from "@mui/material";

const CreateVoucher = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [voucherName, setVoucherName] = useState("");
  const [signaturesRequired, setSignaturesRequired] = useState(0);
  const [errors, setErrors] = useState({
    voucherName: "",
    signaturesRequired: "",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      voucherName: "",
      signaturesRequired: 0,
    };
    setErrors({
      voucherName: "",
      signaturesRequired: 0,
    });

    if (!voucherName) {
      newErrors.voucherName = "Voucher name is required";
      valid = false;
    }

    const signaturesNum = parseInt(signaturesRequired);
    if (!signaturesNum || signaturesNum < 1 || signaturesNum > 5) {
      newErrors.signaturesRequired =
        "Number of signatures must be between 1 and 5";

      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await axios.post(
        `${baseURL}/vouchers/addnewvoucher`,
        {
          voucherName,
          signaturesRequired,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (result.status === 200) {
        setSuccessMessage("Department created successfully");
        setVoucherName("");
        setSignaturesRequired("");
        navigate("/vouchers");
      }
    } catch (error) {
      console.log("Failed to create department", error.message);
      alert("Failed to creating a voucher");
    }
  };

  useEffect(() => {
    if (isAuthenticated === false || !user || user.IS_ADMIN !== true) {
      navigate("/login");
      return;
    }
  }, [user, navigate, isAuthenticated]);

  return (
    <Container maxWidth="sm" className="top-margin">
      <Typography variant="h4" gutterBottom>
        Create Voucher
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Voucher Name"
          variant="outlined"
          value={voucherName}
          onChange={(e) => setVoucherName(e.target.value)}
          error={!!errors.voucherName}
          helperText={errors.voucherName}
          required
          style={{
            marginBottom: "1rem",
          }}
        />
        <TextField
          fullWidth
          label="Signatures Required (1-5)"
          variant="outlined"
          type="text"
          value={signaturesRequired}
          onChange={(e) => setSignaturesRequired(e.target.value)}
          error={!!errors.signaturesRequired}
          helperText={errors.signaturesRequired}
          required
          style={{
            marginBottom: "1rem",
          }}
        />
        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>

        {successMessage && <Alert severity="success">{successMessage}</Alert>}
        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
      </form>
    </Container>
  );
};

export default CreateVoucher;
