import React, { useEffect, useState } from "react";
import { Box, Stack, TextField, Typography, Button } from "@mui/material";
import axios from "axios";
import { baseURL } from "../baseURL";
import { CloudUploadOutlined } from "@mui/icons-material";
const DigitalSignature = ({ onCancel, formProp }) => {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    return () => {
      if (imageURL) {
        URL.revokeObjectURL(imageURL);
      }
    };
  }, [imageURL]);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
      const url = URL.createObjectURL(selectedFile);
      setImageURL(url);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      return alert("Please select a file");
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    try {
      if (formProp === 0) {
        await axios.post(
          `${baseURL}/digitalsignatures/addsignature`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("File uploaded successfully!!");
        onCancel();
      } else {
        await axios.patch(
          `${baseURL}/digitalsignatures/editsignature`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("File edit updated successfully!!");
        onCancel();
      }
    } catch (error) {
      console.error("Error in uploading file: ", error);
      alert("Failed to upload file");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <TextField
          id="file-name"
          label="file-name"
          variant="outlined"
          fullWidth
          value={fileName}
          disabled
        />
        <Box
          className="file-upload"
          sx={{
            textAlign: "center",
            position: "relative",
            border: "2px dashed #ccc",
            borderRadius: 1,
            padding: 2,
            cursor: "pointer",
            "&:hover": {
              borderColor: "#000",
            },
            mb: 2,
          }}
        >
          <input
            accept="image/*"
            type="file"
            id="file"
            onChange={handleFileChange}
            hidden
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "pointer",
            }}
          />
          {file ? (
            <>
              <Typography variant="subtitle2">
                Selected File: {fileName}
              </Typography>
              {imageURL && (
                <Box
                  sx={{
                    mt: 2,
                    maxWidth: "100%",
                    maxHeight: "300px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={imageURL}
                    alt="Digital Sognature"
                    style={{
                      width: "100%",
                      height: "auto",
                    }}
                  />
                </Box>
              )}
            </>
          ) : (
            <>
              <CloudUploadOutlined sx={{ fontSize: 40 }} />
              <Typography variant="h6" mt={1}>
                Click box to upload
              </Typography>
            </>
          )}
        </Box>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Upload
        </Button>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="secondary"
          sx={{ mt: 2 }}
        >
          Cancel
        </Button>
      </Stack>
    </form>
  );
};

export default DigitalSignature;
