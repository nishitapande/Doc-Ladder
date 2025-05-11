import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "../baseURL";
import SearchBar from "./SearchBar";
import ReusableTable from "./ReusableTable";

const columns = [
  { id: "FILE_NAME", label: "File Name" },
  { id: "VOUCHER_NAME", label: "Voucher Type" },
  { id: "PERSON_WHO_DECLINED", label: "Declined By" },
  { id: "REMARKS", label: "Remarks" },
];

const DeclinedFiles = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const actions = [
    {
      label: "View",
      color: "Blue",
      handler: (row) => navigate(`/viewpdf/${row.FILE_ID}`),
    },
    {
      label: "Delete",
      color: "Red",
      handler: async (row) => {
        const res = await axios.delete(
          `${baseURL}/files/deletefile/${row.FILE_ID}`
        );
        if (res.status === 200) {
          alert("File deleted successfully");
          setData(data.filter((item) => item.FILE_ID !== row.FILE_ID));
        }
      },
    },
  ];

  const conditionalActions = (row) => {
    const availableActions = [];
    availableActions.push("View");
    availableActions.push("Delete");
    return availableActions;
  };

  return (
    <div>
      <SearchBar
        endpoint={`${baseURL}/files/declinedfiles`}
        setData={setData}
        filterKeys={["FILE_NAME", "VOUCHER_NAME", "PERSON_WHO_DECLINED"]}
        placeholder="Search Departments"
      />
      <ReusableTable
        columns={columns}
        rows={data}
        actions={actions}
        conditionalActions={conditionalActions}
      />
    </div>
  );
};

export default DeclinedFiles;
