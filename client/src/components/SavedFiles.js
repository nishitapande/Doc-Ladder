import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { baseURL } from "../baseURL";
import ReusableTable from "./ReusableTable";
import SearchBar from "./SearchBar";
import SelectManager from "./SelectManager";

const columns = [
  {
    id: "FILE_NAME",
    label: "File Name",
  },
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
];

const SavedFiles = () => {
  const [data, setData] = useState([]);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);
  const [signaturesRequired, setSignaturesRequired] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const navigate = useNavigate();
  const refreshData = useCallback(() => {
    setRefreshKey((prevKey) => prevKey + 1);
  }, []);

  const handleOpenManagerDialog = (row) => {
    setSelectedRow(row);
    setManagerDialogOpen(true);
    setSignaturesRequired(row.SIGNATURES_REQUIRED);
  };

  const handleCloseManagerDialog = () => {
    setManagerDialogOpen(false);
  };

  const handleManagerSubmit = async (manager) => {
    if (!selectedRow) return;

    try {
      const result = await axios.post(
        `${baseURL}/files/sendfile/${selectedRow.FILE_ID}`,
        {
          sendTo: manager,
        },
        {
          withCredentials: true,
        }
      );

      if (result.status === 200) {
        alert("File sent successfully!!");
        refreshData();
      }
    } catch (error) {
      console.log("Error in sending file to manager: ", error);
      alert("Error in sending file. Please try again later");
    }

    handleCloseManagerDialog();
  };
  const actions = [
    {
      label: "View",
      color: "Blue",
      handler: (row) => navigate(`/viewpdf/${row.FILE_ID}`),
    },
    {
      label: "Sign",
      color: "Blue",
      disabled: (row) => row.SIGNED_BY_UPLOADER === true,
      handler: async (row) => {
        const result = await axios.patch(`${baseURL}/files/${row.FILE_ID}`);
        if (result.status === 200) {
          alert("File signed successfully!!");
          refreshData();
        }
      },
    },
    {
      label: "Send",
      color: "Blue",
      disabled: (row) => row.SIGNED_BY_UPLOADER === false,
      handler: (row) => handleOpenManagerDialog(row),
    },
    {
      label: "Delete",
      color: "Red",
      handler: async (row) => {
        await axios.delete(`${baseURL}/files/deletefile/${row.FILE_ID}`);
        alert("File deleted!!");
        refreshData();
      },
    },
  ];

  const conditionalActions = (row) => {
    const availableActions = [];
    availableActions.push("View");
    availableActions.push("Sign");
    availableActions.push("Send");
    availableActions.push("Delete");

    return availableActions;
  };
  return (
    <div>
      <SearchBar
        endpoint={`${baseURL}/files/savedfiles`}
        setData={setData}
        filterKeys={["FILE_NAME", "VOUCHER_NAME"]}
        placeholder="Search File name or voucher"
        refreshKey={refreshKey}
      />
      <ReusableTable
        columns={columns}
        rows={data}
        actions={actions}
        conditionalActions={conditionalActions}
      />
      <SelectManager
        open={managerDialogOpen}
        handleClose={handleCloseManagerDialog}
        handleSubmit={handleManagerSubmit}
        signaturesRequired={signaturesRequired}
      />
    </div>
  );
};

export default SavedFiles;
