import React, { useContext, useState, useCallback } from "react";
import axios from "axios";
import AuthContext from "../Context";
import { baseURL } from "../baseURL";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ReusableTable from "../components/ReusableTable";

const columns = [
  {
    id: "DEPARTMENT_NAME",
    label: "Department Name",
  },
  {
    id: "TOTAL_EMPLOYEES",
    label: "Total Employees",
  },
  {
    id: "HOD_NAME",
    label: "HOD ",
  },
];
const ViewDepartments = () => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();
  const refreshData = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const actions = [
    {
      label: "Edit",
      color: "Green",
      handler: (row) => navigate(`/edit-department/${row.DEPARTMENT_ID}`),
    },
    {
      label: "Delete",
      color: "Red",
      handler: async (row) => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this department?"
        );
        if (confirmDelete) {
          try {
            await axios.delete(`${baseURL}/departments/${row.DEPARTMENT_ID}`);
            alert("Department deleted successfully");
            refreshData();
          } catch (error) {
            console.error("Error deleting department:", error);
            alert("Failed to delete department");
          }
        }
      },
    },
  ];
  const conditionalActions = (row) => {
    const availableActions = [];
    availableActions.push("Edit");
    availableActions.push("Delete");
    return availableActions;
  };
  if (
    !isAuthenticated ||
    isAuthenticated === false ||
    !user ||
    user.IS_ADMIN !== true
  ) {
    navigate("/login");
  }

  console.log("data from here: ", data);
  return (
    <div className="top-margin">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}
        width="100%"
      >
        <Box
          flexGrow={1}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <SearchBar
            setData={setData}
            endpoint={`${baseURL}/departments/alldepartments`}
            refreshKey={refreshKey}
            fileterKeys={["DEPARTMENT_NAME", "HOD_NAME"]}
            placeholder="Search by department name or HOD name"
            style={{ width: "60%" }}
          />
        </Box>
        <Button
          style={{ marginRight: "15px" }}
          variant="contained"
          color="primary"
          onClick={() => navigate("/add-department")}
        >
          Add Department
        </Button>
      </Box>
      <ReusableTable
        columns={columns}
        rows={data}
        actions={actions}
        conditionalActions={conditionalActions}
      />
    </div>
  );
};

export default ViewDepartments;
