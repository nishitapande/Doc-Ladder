import React, { useCallback, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import ReusableTable from "../components/ReusableTable";
import { baseURL } from "../baseURL";
import AuthContext from "../Context";
import { Box, Button } from "@mui/material";
import axios from "axios";

const columns = [
  { id: "NAME", label: "Name" },
  {
    id: "DEPARTMENT_NAME",
    label: "Department",
  },
  {
    id: "MANAGER_NAME",
    label: "Manager",
  },
];

const DisplayAllUsers = () => {
  const [data, setData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const actions = [
    {
      label: "Edit",
      color: "Green",
      handler: (row) => navigate("/"),
    },
    {
      label: "Delete",
      color: "Red",
      handler: async (row) => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this user ?"
        );

        if (confirmDelete) {
          try {
            await axios.delete(
              `${baseURL}/users/deleteemployee/${row.EMPLOYEE_ID}`
            );
            alert("User deleted successfully!!");
            refreshData();
          } catch (error) {
            console.error("Error deleting user: ", error);
            alert("Error in deleting the user. [;ease try again");
          }
        }
      },
    },
  ];

  const refreshData = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const conditionalActions = (row) => {
    const availableActions = [];

    availableActions.push("Edit");
    availableActions.push("Delete");

    return availableActions;
  };

  useEffect(() => {
    if (isAuthenticated === false || !user || user.IS_ADMIN !== true) {
      navigate("/login");
      return;
    }
  }, [user, navigate, isAuthenticated]);
  return (
    <div className="top-margin">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-start"
        mb={2}
        width="100%"
      >
        <Box flexGrow={1} display="flex" justifyContent="center">
          <SearchBar
            endpoint={`${baseURL}/users/getallemployees`}
            setData={setData}
            refreshKey={refreshKey}
            filterKeys={["NAME", "DEPARTMENT_NAME"]}
            placeholder="Search Employees or Department"
          />
        </Box>
        <Button
          style={{ marginRight: "15px" }}
          variant="contained"
          color="primary"
          onClick={() => navigate("/signup")}
        >
          Create New User
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

export default DisplayAllUsers;
