import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { baseURL } from "../baseURL";
import { Container, Typography, TextField, Button, Alert } from "@mui/material";
import axios from "axios";
import AuthContext from "../Context";

const EditVoucherPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  const { voucherId } = useParams();
  const navigate = useNavigate();
  const [voucherName, setVoucherName] = useState("");
  const [signaturesRequired, setSignaturesRequired] = useState(0);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (
      !isAuthenticated ||
      isAuthenticated === false ||
      user.IS_ADMIN === false
    ) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchVoucher = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/vouchers/getvoucher/${voucherId}`
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch voucher");
        }
        console.log("response from voucher: ", response);
        setVoucherName(response.data.recordset[0].VOUCHER_NAME);
        setSignaturesRequired(response.data.recordset[0].SIGNATURES_REQUIRED);
      } catch (error) {
        console.error("Error fetching voucher: ", error.message);
        setError("Failed to fetch voucher");
      }
    };
    fetchVoucher();
  }, [voucherId]);

  const validateForm = () => {
    if (!voucherName) {
      setError("Voucher Name is requires");
      return false;
    }

    const signaturesNum = parseInt(signaturesRequired);

    if (!signaturesRequired || signaturesNum < 1 || signaturesNum > 5) {
      setError("Signatures Required should be a number between 1 and 5");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await axios.patch(
        `${baseURL}/vouchers/updatevoucher/${voucherId}`,
        { voucherName, signaturesRequired: parseInt(signaturesRequired) }
      );
      if (!response.status === 200) {
        throw new Error("Failed to update voucher");
      }
      setSuccessMessage("Voucher updated successfully");
      setTimeout(() => {
        setSuccessMessage("");
        navigate("/vouchers");
      }, 2000);
    } catch (error) {
      console.error("Error updating voucher: ", error.message);
      setError("Failed to update voucher. Please try again");
    }
  };

  return (
    <Container maxWidth="sm" className="top-margin">
      <Typography variant="h4" gutterBottom>
        Edit Voucher
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Voucher Name"
          value={voucherName}
          onChange={(e) => setVoucherName(e.target.value)}
          required
          style={{
            marginBottom: "1rem",
          }}
        />
        <TextField
          fullWidth
          label="Signatures Required (1 - 5)"
          value={signaturesRequired}
          onChange={(e) => setSignaturesRequired(e.target.value)}
          required
          style={{
            marginBottom: "1rem",
          }}
        />
        <Button type="submit" variant="contained" color="primary">
          Update Voucher
        </Button>
      </form>
      {error && <Alert severity="error">{error}</Alert>}
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
    </Container>
  );
};

export default EditVoucherPage;
