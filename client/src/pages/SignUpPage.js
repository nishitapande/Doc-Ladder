import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import AuthContext from "../Context";
import axios from "axios";
import {
  Alert,
  Checkbox,
  Box,
  Button,
  Link,
  FormControlLabel,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { baseURL } from "../baseURL";

axios.defaults.withCredentials = true;

const SignUpPage = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Create useState hooks for all fields
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");
  const [managerId, setManagerId] = useState(0);
  const [departmentId, setDepartmentId] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [viewableDepartments, setViewableDepartments] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user.IS_ADMIN === true) {
      // Fetch managers and departments only if authenticated and admin
      fetchManagers();
      fetchDepartments();
    } else {
      // If not authenticated or not admin, navigate to login page
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  const fetchManagers = async () => {
    try {
      const response = await axios.get(`${baseURL}/users/employeenames`);
      setManagers(response.data.recordsets[0]);
    } catch (error) {
      console.error("Error fetching managers:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        managers: "Failed to fetch managers",
      }));
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${baseURL}/departments/alldepartments`);
      setDepartments(response.data.recordsets[0]);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setErrors((prevErrors) => ({
        ...prevErrors,
        departments: "Failed to fetch departments",
      }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    if (!firstName) {
      newErrors.firstName = "First name is required";
      isValid = false;
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required";
      isValid = false;
    }

    if (!email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    if (!gender) {
      newErrors.gender = "Gender is required";
      isValid = false;
    }

    if (departmentId === 0) {
      newErrors.departmentId = "Department selection is required";
      isValid = false;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //console.log all the state
    console.log("Form submitted");
    console.log("First Name:", firstName);
    console.log("Middle Name:", middleName);
    console.log("Last Name:", lastName);
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Gender:", gender);
    console.log("Address:", address);
    console.log("Manager ID:", managerId);
    console.log("Department ID:", departmentId);
    console.log("Is Admin:", isAdmin);

    if (!validateForm()) return;

    try {
      const response = await axios.post(
        `${baseURL}/users/signup`,
        {
          firstName,
          middleName,
          lastName,
          email,
          password,
          gender,
          address,
          managerId,
          departmentId,
          isAdmin,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      if (response.status === 200) {
        setSuccess(true);
        // Reset form or navigate to another page
      }
    } catch (error) {
      if (error.response) {
        console.error("Response error: ", error.response.data);
        setErrors(
          error.response.data.message || "An error occurred. Please try again"
        );
      } else if (error.request) {
        console.error("Network error: ", error.request);
        setErrors("No response from server. Please try again");
      } else {
        console.error("Error: ", error.message);
        setErrors("An error occurred. Please try again");
      }
      setSuccess(false);
    }
  };

  return (
    //Box from mui
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        width: "100%",
        maxWidth: 1200,
        margin: "90px auto ",
      }}
      noValidate
      autoComplete="off"
      onSubmit={handleSubmit}
    >
      <Typography variant="h3" gutterBottom align="center">
        Create User
      </Typography>
      {success && (
        <Alert
          severity="success"
          icon={<CheckIcon fontSize="inherit " />}
          mb="3"
        >
          Registration successful! Account is created.
        </Alert>
      )}
      {errors.submit && (
        <Alert severity="error" mb="3">
          {errors}
        </Alert>
      )}
      <Grid container spacing={2} marginTop="10px">
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            required
            fullWidth
            label="First Name"
            variant="outlined"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={!!errors.firstName}
            helperText={errors.firstName}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="Middle Name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            variant="outlined"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            variant="outlined"
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={!!errors.lastName}
            helperText={errors.lastName}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            required
            fullWidth
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Gender</InputLabel>
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              label="Gender"
              error={!!errors.gender}
            >
              <MenuItem value="">
                <em>Select Gender</em>
              </MenuItem>
              <MenuItem value="Male">Male</MenuItem>
              <MenuItem value="Female">Female</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
            {errors.gender && (
              <Typography colro="error" variant="outlined">
                {errors.gender}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Manger</InputLabel>
            <Select
              value={managerId}
              onChange={(e) => setManagerId(parseInt(e.target.value))}
              label="Manager"
            >
              <MenuItem value="">
                <em>Select Manager</em>
              </MenuItem>
              {managers.map((manager) => (
                <MenuItem key={manager.EMPLOYEE_ID} value={manager.EMPLOYEE_ID}>
                  {manager.NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentId}
              onChange={(e) => setDepartmentId(parseInt(e.target.value))}
              label="Department"
              error={!!errors.departmentId}
              variant="outlined"
            >
              <MenuItem value={0}>
                <em>Select Department</em>
              </MenuItem>
              {departments.map((department) => (
                <MenuItem
                  key={department.DEPARTMENT_ID}
                  value={department.DEPARTMENT_ID}
                >
                  {department.DEPARTMENT_NAME}
                </MenuItem>
              ))}
            </Select>
            {errors.departmentId && (
              <Typography color="error" variant="outlined">
                {errors.departmentId}
              </Typography>
            )}
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <FormControl variant="outlined" fullWidth>
            <InputLabel>Department</InputLabel>
            <Select
              multiple={true}
              value={viewableDepartments || []}
              onChange={(e) => {
                const { value } = e.target;
                setViewableDepartments(typeof value === 'string' ? value.split(',').map(Number) : value);
              }}
              label="Department"
              error={!!errors.departmentId}
              variant="outlined"
            >
              <MenuItem value={0}>
                <em>Select Departments</em>
              </MenuItem>
              {departments.map((department) => (
                <MenuItem
                  key={department.DEPARTMENT_ID}
                  value={department.DEPARTMENT_ID}
                >
                  {department.DEPARTMENT_NAME}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          mt: 2,
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
          }
          label="Is This user an admin?"
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          mt: 2,
        }}
      >
        <Button type="submit" variant="contained">
          Register
        </Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "flex-start",
          mt: 2,
        }}
      >
        <Typography>
          Already have an account?{" "}
          <Link underline="hover" component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUpPage;
