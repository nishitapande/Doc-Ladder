import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { baseURL } from "../baseURL";
import AuthContext from "../Context";

const EditDepartmentPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const { departmentId } = useParams();
  const navigate = useNavigate();
  const [departmentName, setDepartmentName] = useState("");
  const [hodId, setHodId] = useState(0);
  const [managers, setManagers] = useState([]);
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
    const fetchDepartment = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/departments/getdepartment/${departmentId}`
        );
        // console.log("department: ", response.data.recordset[0]);
        setDepartmentName(response.data.recordset[0].DEPARTMENT_NAME);
        setHodId(response.data.recordset[0].HOD_ID);
      } catch (error) {
        setError("Failed to fetch department details");
        console.error(error);
      }
    };

    const getAllEmployees = async () => {
      try {
        const result = await axios.get(`${baseURL}/users/employeesname`);
        //console log the result
        console.log("managers: ", result);

        setManagers(result.data.recordsets[0]);
      } catch (error) {
        setError("Failed to fetch employee names");
        console.error(error);
      }
    };

    fetchDepartment();
    getAllEmployees();
  }, [departmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${baseURL}/departments/updatedepartment/${departmentId}`,
        {
          departmentName,
          hodId,
        }
      );
      setSuccessMessage("Department updated successfully");
      navigate(`/departments`);
    } catch (error) {
      setError("Failed to update department");
      console.error(error);
    }
  };

  return (
    <Container maxWidth="sm" className="top-margin">
      <Typography variant="h4" gutterBottom>
        Edit Department
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Department Name"
          variant="outlined"
          value={departmentName}
          onChange={(e) => setDepartmentName(e.target.value)}
          required
          style={{
            marginBottom: "1rem",
          }}
        />
        <FormControl
          variant="outlined"
          fullWidth
          style={{
            marginBottom: "1rem",
          }}
        >
          <InputLabel>Head of Department</InputLabel>
          <Select
            label="Head of Department"
            value={hodId}
            onChange={(e) => setHodId(parseInt(e.target.value))}
            required
          >
            <MenuItem value={0}>Select Head of Department</MenuItem>
            {managers.map((manager) => (
              <MenuItem key={manager.EMPLOYEE_ID} value={manager.EMPLOYEE_ID}>
                {manager.NAME}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" type="submit" fullWidth>
          Update Department
        </Button>
        {error && <Alert severity="error">{error}</Alert>}
        {successMessage && <Alert severity="success">{successMessage}</Alert>}
      </form>
    </Container>
  );
};

export default EditDepartmentPage;
