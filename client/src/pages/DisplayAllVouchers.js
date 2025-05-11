import React, { useCallback, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../baseURL";
import { Box, Button } from "@mui/material";
import axios from "axios";
import AuthContext from "../Context";
import SearchBar from "../components/SearchBar";
import ReusableTable from "../components/ReusableTable";

const columns = [
  { id: "VOUCHER_NAME", label: "Voucher Name" },
  {
    id: "SIGNATURES_REQUIRED",
    label: "Signatures Required",
  },
];

const DisplayAllVouchers = () => {
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
      handler: (row) => navigate(`/edit-voucher/${row.VOUCHER_ID}`),
    },
    {
      label: "Delete",
      color: "Red",
      handler: async (row) => {
        const confirmDelete = window.confirm(
          "Are you sure you want to delete this voucher ?"
        );

        if (confirmDelete) {
          try {
            await axios.delete(
              `${baseURL}/vouchers/deletevoucher/${row.VOUCHER_ID}`
            );
            alert("Voucher deleted successfully");
            refreshData();
          } catch (error) {
            console.error("Error in deleting voucher: ", error);
            alert("Error in deleting the voucher. Please try again later");
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
            endpoint={`${baseURL}/vouchers/getvouchers`}
            setData={setData}
            refreshKey={refreshKey}
            filterKeys={["VOUCHER_NAME"]}
            placeholder="Search Voucher"
          />
        </Box>
        <Button
          style={{ marginRight: "15px" }}
          variant="contained"
          color="primary"
          onClick={() => navigate("/add-voucher")}
        >
          Create new voucher
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

export default DisplayAllVouchers;
