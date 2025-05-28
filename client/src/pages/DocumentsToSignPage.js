import axios from "axios";
import React, { useCallback, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../baseURL";
import SearchBar from "../components/SearchBar";
import ReusableTable from "../components/ReusableTable";
import RemarkDialog from "../components/RemarkDialog";
import SelectManager from "../components/SelectManager";
import AuthContext from "../Context";

const columns = [
  { id: "FILE_NAME", label: "File Name" },
  {
    id: "VOUCHER_NAME",
    label: "Voucher Type",
  },
  {
    id: "CREATED_ON",
    label: "Created On",
  },
  {
    id: "REMARKS",
    label: "Remarks",
  },
  {
    id: "NAME",
    label: "Created By",
  },
];

const DocumentsToSignPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [remarkDialogOpen, setRemarkDialogOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [signaturesRequired, setSignaturesRequired] = useState(0);
  const [managerData, setManagerData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || isAuthenticated === false) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const refreshData = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleOpenRemarkDialog = (row) => {
    setSelectedRow(row);
    setRemarkDialogOpen(true);
  };
  const handleCloseRemarkDialog = () => {
    setSelectedRow(null);
    setRemarkDialogOpen(false);
  };

  const handleOpenManagerDialog = (row) => {
    console.log("Row data:", row); // Log the entire row data
    if (row && typeof row === "object") {
      console.log("SIGNATURES_REQUIRED:", row.SIGNATURES_REQUIRED);
      console.log("MANAGER_ID:", row.MANAGER_ID);
      if (
        row.SIGNATURES_REQUIRED !== undefined &&
        row.MANAGER_ID !== undefined
      ) {
        setSelectedRow(row);
        setManagerDialogOpen(true);
        setSignaturesRequired(row.SIGNATURES_REQUIRED);
        setManagerData(row);
      } else {
        console.error("Missing required data in row:", row);
        alert("Unable to open manager dialog due to missing data");
      }
    } else {
      console.error("Invalid row data for manager dialog:", row);
      alert("Unable to open manager dialog due to invalid data");
    }
  };
  const handleCloseManagerDialog = () => {
    setManagerDialogOpen(false);
  };

  const handleSubmitRemarks = async (remarks) => {
    if (selectedRow) {
      try {
        await axios.patch(
          `${baseURL}/files/declinefile/${selectedRow.FILE_ID}`,
          { remarks }
        );
        alert("File has been declined successfully ");
        refreshData();
      } catch (error) {
        console.error("Failed to decline file", error.message);
      }
      handleCloseRemarkDialog();
    }
  };

  const handleMangerSubmit = async (manager) => {
    if (!selectedRow) return;
    try {
      const result = await axios.patch(
        `${baseURL}/files/${selectedRow.FILE_ID}`,
        {
          sendTo: manager,
        }
      );
      if (result.status === 200) {
        alert("File has been sent to manager successfully ");
        refreshData();
      }
    } catch (error) {
      console.error("Failed to send file to manager", error.message);
    }
    handleCloseManagerDialog();
  };

  const actions = [
    {
      label: "Approve",
      handler: async (row) => {
        console.log("signatures done: ", row.SIGNATURES_DONE);

        if (row.SIGNATURES_REQUIRED === row.SIGNATURES_DONE + 1) {
          const result = await axios.patch(`${baseURL}/files/${row.FILE_ID}`);
          if (result.status === 200) {
            alert("File has been approved successfully ");
            refreshData();
          }
        } else {
          handleOpenManagerDialog(row);
        }
      },
      color: "Green",
    },
    {
      label: "Decline",
      handler: (row) => handleOpenRemarkDialog(row),
      color: "Red",
    },
    {
      label: "View",
      handler: (row) => navigate(`/viewpdf/${row.FILE_ID}`),
      color: "Blue",
    },
  ];

  const conditionalActions = (row) => {
    const availableActions = ["View", "Approve", "Decline"];
    return availableActions;
  };

  return (
    <div className="top-margin">
      <SearchBar
        endpoint={`${baseURL}/files/unsignedfiles`}
        setData={setData}
        filterKeys={["FILE_NAME", "VOUCHER_NAME", "NAME"]}
        placeholder="Search files for approval"
        refreshKey={refreshKey}
      />
      <ReusableTable
        columns={columns}
        rows={data}
        actions={actions}
        conditionalActions={conditionalActions}
      />
      <RemarkDialog
        open={remarkDialogOpen}
        handleClose={handleCloseRemarkDialog}
        handleSubmit={handleSubmitRemarks}
      />
      {managerData && (
        <SelectManager
          open={managerDialogOpen}
          handleClose={handleCloseManagerDialog}
          handleSubmit={handleMangerSubmit}
          signaturesRequired={signaturesRequired}
          managerData={managerData}
        />
      )}
    </div>
  );
};

export default DocumentsToSignPage;
