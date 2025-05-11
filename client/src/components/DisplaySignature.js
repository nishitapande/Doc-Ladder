import axios from "axios";
import React, { useEffect, useState } from "react";
import { baseURL } from "../baseURL";
import { Box, Button } from "@mui/material";
import DigitalSignature from "./DigitalSignature";

const DisplaySignature = () => {
  const [imageSrc, setImageSrc] = useState("");
  const [hasSignature, setHasSignature] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formProp, setFormProp] = useState(0);

  useEffect(() => {
    const fetchSignature = async () => {
      try {
        const response = await axios.get(
          `${baseURL}/digitalsignatures/getSignature`,
          {
            responseType: "arraybuffer",
          }
        );
        if (response.status !== 200) {
          throw new Error("Failed to fetch signature");
        }

        const base64toString = arrayBufferToBase64(response.data);
        setImageSrc(`data:image/png;base64,${base64toString}`);
        setHasSignature(true);
      } catch (error) {
        console.error("Error fetching signature: ", error);
        setImageSrc("");
        setHasSignature(false);
      }
    };
    fetchSignature();
  }, []);

  const arrayBufferToBase64 = (buffer) => {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  const handleEditClick = () => {
    setShowUploadForm(true);
    setFormProp(hasSignature === true ? 1 : 0);
  };

  const handleCancelEdit = () => {
    setShowUploadForm(false);
  };

  return (
    <Box
      sx={{
        margin: "0 auto",
        maxWidth: 600,
        padding: 2,
        mt: 3,
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          boxShadow: 3,
          backgroundColor: "#fff",
          padding: 2,
          borderRadius: 2,
          display: "relative",
        }}
      >
        {" "}
        {showUploadForm ? (
          <DigitalSignature onCancel={handleCancelEdit} formProp={formProp} />
        ) : (
          <>
            {hasSignature === true ? (
              <Box
                sx={{
                  textAlign: "center",
                  position: "relative",
                  border: "2px dashed #ccc",
                  borderRadius: 1,
                  p: 2,
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "auto",
                }}
              >
                <Box>
                  <img
                    src={imageSrc}
                    alt="Digital Signature"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: 1,
                      height: "auto",
                    }}
                  />
                </Box>
              </Box>
            ) : (
              <DigitalSignature formProp={formProp} />
            )}
          </>
        )}{" "}
      </Box>
      {!showUploadForm && hasSignature && (
        <Box
          sx={{
            textAlign: "center",
            mt: 2,
          }}
        >
          <Button onClick={handleEditClick} variant="outlined" color="primary">
            Edit Signature
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DisplaySignature;
