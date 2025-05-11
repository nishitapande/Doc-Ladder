import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { baseURL } from "../baseURL";
import AuthContext from "../Context";

const ViewPdf = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  let { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPdf = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/files/getasignedfile/${id}`,
          {
            responseType: "arraybuffer",
          }
        );

        const blob = new Blob([response.data], { type: "application/pdf" });
        const fileURL = URL.createObjectURL(blob);
        setPdfUrl(fileURL);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    getPdf();
  }, []);

  if (!isAuthenticated) {
    navigate("/login", { replace: true });
    return null;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error in loading pdf: {error.message}</div>;
  }
  return (
    <Box
      sx={{
        mt: "80px",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "auto",
        backgroundColor: "#f5f5f5",
        padding: { xs: 1, sm: 2, md: 4 },
      }}
    >
      {pdfUrl ? (
        <object
          data={pdfUrl}
          type="application/pdf"
          style={{
            width: "100%",
            height: "100%",
            maxWidth: "1200px",
            maxHeight: "90vh",
          }}
        />
      ) : (
        <div>No PDF found</div>
      )}
    </Box>
  );
};

export default ViewPdf;
