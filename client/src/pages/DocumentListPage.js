import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AuthContext from "../Context";
import axios from "axios";
import { baseURL } from "../baseURL";
import {
  Box,
  InputLabel,
  Select,
  Pagination,
  Button,
  FormControl,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import TableComp from "../components/TableComp";

const DocumentListPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [createdBy, setCreatedBy] = useState(0);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || isAuthenticated === false) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated]);

  useEffect(() => {
    getAllEmployees();
    handleSearch();
  }, [currentPage]);

  const getAllEmployees = async () => {
    try {
      const result = await axios.get(`${baseURL}/users/employeesname`);
      setEmployees(result.data.recordsets[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`${baseURL}/files/getFiles`, {
        params: {
          department_id: parseInt(id),
          start_date: startDate || null,
          end_date: endDate || null,
          created_by: createdBy || null,
          page: parseInt(currentPage),
          page_size: parseInt(pageSize),
        },
      });

      setData(response.data.data);
      setTotalCount(response.data.totalCount);
      setStartDate("");
      setEndDate("");
      setCreatedBy(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePageChange = (value) => {
    setCurrentPage(value);
  };

  return (
    <div className="top-margin">
      <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
        <TextField
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          label="Start Date"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            marginRight: 2,
            cursor: "pointer",
          }}
          variant="outlined"
        />
        <TextField
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          label="End Date"
          InputLabelProps={{
            shrink: true,
          }}
          sx={{
            marginLeft: 2,
            cursor: "pointer",
          }}
          variant="outlined"
        />
        <FormControl
          variant="outlined"
          sx={{
            marginRight: 2,
            width: "200px",
          }}
        >
          <InputLabel>Created By</InputLabel>
          <Select
            value={createdBy}
            onChange={(e) => setCreatedBy(parseInt(e.target.value))}
            label="Created By"
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {employees.map((employee) => (
              <MenuItem key={employee.EMPLOYEE_ID} value={employee.EMPLOYEE_ID}>
                {employee.NAME}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch}>
          Search
        </Button>
      </Box>
      <Typography textAlign="center" variant="h5">
        Total Files: {totalCount}
      </Typography>
      <TableComp data={data} />

      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(totalCount / pageSize)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
          nextButtonProps={{
            disabled: currentPage >= Math.ceil(totalCount / pageSize),
          }}
        />
      </Box>
    </div>
  );
};

export default DocumentListPage;
