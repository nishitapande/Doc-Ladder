import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { baseURL } from "../baseURL";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Typography,
  Select,
} from "@mui/material";

import AuthContext from "../Context";
import { useNavigate } from "react-router-dom";

const SelectManager = ({ open, handleClose, handleSubmit, managerData }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedManagerId, setSelectedManagerId] = useState(null);
  const [error, setError] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const getManagers = async () => {
      try {
        const result = await axios.get(`${baseURL}/users/employeesname`);
        setManagers(result.data.recordsets[0]);
      } catch (error) {
        console.error("Error in fetching managers: ", error);
      }
    };

    getManagers();
  }, []);

  useEffect(() => {
    if (managerData && managerData.MANAGER_ID) {
      setSelectedManagerId(managerData.MANAGER_ID);
    } else if (user && user.MANAGER_ID) {
      setSelectedManagerId(user.MANAGER_ID);
    }
  }, [managerData, user]);

  const onSubmit = () => {
    if (!selectedManagerId) {
      setError(true);
    } else {
      handleSubmit(selectedManagerId);
      setError(false);
    }
  };

  const handleChange = (e) => {
    setSelectedManagerId(parseInt(e.target.value));
    setError(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Select Manager</DialogTitle>
      <DialogContent>
        <FormControl fullWidth error={error} variant="outlined">
          <InputLabel>Manager</InputLabel>
          <Select
            value={selectedManagerId || ""}
            onChange={handleChange}
            label="Manager"
          >
            <MenuItem value="">Select The Employee</MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.EMPLOYEE_ID} value={manager.EMPLOYEE_ID}>
                {manager.NAME}
              </MenuItem>
            ))}
          </Select>
          {error && (
            <Typography variant="caption" color="error">
              Please select a manager
            </Typography>
          )}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          disabled={!selectedManagerId}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectManager;
