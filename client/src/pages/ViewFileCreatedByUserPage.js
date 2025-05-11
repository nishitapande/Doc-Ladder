import React, { useState } from "react";

const ViewFileCreatedByUserPage = () => {
  const [data, setData] = useState([]);
  const [signaturesRequired, setSignaturesRequired] = useState(0);
  const [managerDialogOpen, setManagerDialogOpen] = useState(false);

  const handleManagerDialogOpen = () => {
    setManagerDialogOpen(true);
  };

  const handleManagerDialogClose = () => {
    setManagerDialogOpen(false);
  };

  const handelManagerSubmit = () => {
    handleManagerDialogClose();
  };

  const actions = [];

  return <div>ViewFileCreatedByUserPage</div>;
};

export default ViewFileCreatedByUserPage;
