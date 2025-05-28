import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { baseURL } from "../baseURL";
import ReusableTable from "./ReusableTable";

const columns = [
  { id: "FILE_NAME", label: "File Name" },
  {
    id: "EMPLOYEE_NAME",
    label: "Sent To",
  },
  {
    id: "NextUserStatusText",
    label: "Status",
  },
];

const ViewFileSentByUser = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  const actions = [
    {
      label: "View",
      color: "blue",
      handler: (row) => navigate(`/viewpdf/${row.FILE_ID}`),
    },
  ];

  const conditionalActions = (row) => {
    const availableActions = [];

    availableActions.push("View");
    return availableActions;
  };

  return (
    <div>
      <SearchBar
        endpoint={`${baseURL}/files/getSentFiles`}
        setData={setData}
        filterKeys={["FILE_NAME", "EMPLOYEE_NAME"]}
        placeholder="Search department"
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

export default ViewFileSentByUser;
