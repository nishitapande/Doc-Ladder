import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  FormControl,
  Stack,
  InputLabel,
  Typography,
  FormHelperText,
  Radio,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  TextField,
  Button,
  Select,
  MenuItem,
} from "@mui/material";

import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";

import axios from "axios";

import { baseURL } from "../baseURL";

import AuthContext from "../Context";

const UploadFile = () => {
  const { user } = useContext(AuthContext);
  const departemntID = user.DEPARTMENT_ID;
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherId, setVoucherId] = useState(0);
  const [departemntId, setDepartmentId] = useState(departemntID);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState("");
  const [fileUploadValue, setFileUploadValue] = useState(0);
  const [sendToEmployeeId, setSendToEmployeeId] = useState(user.MANAGER_ID);
  const [openSelectManager, setOpenSelectManager] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const res = await axios.get(`${baseURL}/departments/alldepartments`);
        setDepartments(res.data.recordsets[0]);
      } catch (error) {
        console.error(error);
      }
    };

    const getVouchers = async () => {
      try {
        const res = await axios.get(`${baseURL}/vouchers/getvouchers`);
        setVouchers(res.data.recordsets[0]);
      } catch (error) {
        console.error(error);
      }
    };

    const getManagers = async () => {
      try {
        const res = await axios.get(`${baseURL}/users/employeesname`);
        console.log("res from managers: ", res);
        setManagers(res.data.recordsets[0]);
      } catch (error) {
        console.error(error);
      }
    };

    getDepartments();
    getVouchers();
    getManagers();
  }, []);

  const validateForm = () => {
    let errors = {};
    if (!file) errors.file = "File is required";
    if (!fileName) errors.fileName = "File name is required";
    if (!departments.find((d) => d.DEPARTMENT_ID === departemntId))
      errors.departmentId = "Invalid department";
    if (!voucherId) errors.voucherId = "voucher is required";
    if (fileUploadValue === 0) errors.fileUploadValue = "File is required";
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const uploadFileHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", fileName);
    formData.append("departmentId", departemntId);
    formData.append("voucherId", voucherId);
    formData.append("remarks", remarks);
    formData.append("fileUploadValue", parseInt(fileUploadValue));
    if (fileUploadValue === 3) {
      formData.append("sendFileTo", sendToEmployeeId);
    }

    try {
      const res = await axios.post(`${baseURL}/files/uploadfile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200) {
        alert("File uploaded successfully");
        setFile(null);
        setFileName("");
        setDepartmentId(departemntID);
        setVoucherId(0);
        setRemarks("");
        setFileUploadValue(0);
        setSendToEmployeeId(user.MANAGER_ID);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to upload file");
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleRadioChange = (e) => {
    const value = parseInt(e.target.value);
    setFileUploadValue(value);
    if (value === 3) {
      setOpenSelectManager(true);
    } else {
      setOpenSelectManager(false);
    }
  };

  const handleSelectManagerChange = (e) => {
    setSendToEmployeeId(parseInt(e.target.value));
  };
  return (
    <div>
      <form onSubmit={uploadFileHandler}>
        <Box
          sx={{
            "& > :not(style)": {
              m: 1,
              width: { xs: "100%", sm: "82ch" },
            },
          }}
        >
          <Box
            sx={{
              "& > :not(style)": {
                m: 1,
                width: { xs: "100%", sm: "82ch" },
              },
            }}
          >
            <Box
              className="file-upload"
              sx={{
                textAlign: { xs: "center", sm: "center" },
                "& > :not(style)": {
                  m: 1,
                  width: { xs: "100%", sm: "auto" },
                },
                p: { xs: 1, sm: 2 },
              }}
              style={{
                marginTop: "30px",
              }}
            >
              {file ? (
                <Typography variant="subtitle2">
                  Selected file: {fileName}
                </Typography>
              ) : (
                <>
                  <CloudUploadOutlinedIcon />
                  <h3>Click box to upload</h3>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                name="file"
                required
                onChange={handleFileChange}
              />
              {errors.file && (
                <FormHelperText error> {errors.file} </FormHelperText>
              )}
            </Box>
          </Box>
          <Box
            sx={{
              "& > :not(style)": {
                m: 1,
                width: { xs: "100%", sm: "82ch" },
              },
            }}
            noValidate
            autoComplete="off"
          >
            <TextField
              variant="outlined"
              name="fileName"
              label="File Name"
              value={fileName}
              diables
              error={!!errors.fileName}
              helperText={errors.fileName}
            />
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }}>
            <Box
              sx={{
                "& > :not(style)": {
                  m: 1,
                  width: { xs: "100%", sm: "40ch" },
                },
              }}
            >
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.departemntID}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={departemntId}
                  //   onChange={(e) => setDepartmentId(parseInt(e.target.value))}
                  label="Department"
                  disabled
                >
                  {departments.map((d) => (
                    <MenuItem key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>
                      {d.DEPARTMENT_NAME}
                    </MenuItem>
                  ))}
                </Select>
                {errors.departmentId && (
                  <FormHelperText error> {errors.departmentId} </FormHelperText>
                )}
              </FormControl>
            </Box>
            <Box
              sx={{
                "& > :not(style)": {
                  m: 1,
                  width: { xs: "100%", sm: "40ch" },
                },
              }}
            >
              <FormControl
                variant="outlined"
                fullWidth
                error={!!errors.voucherId}
              >
                <InputLabel>Voucher Name</InputLabel>
                <Select
                  value={voucherId}
                  onChange={(e) => setVoucherId(parseInt(e.target.value))}
                  label="Voucher"
                  required
                >
                  <MenuItem value="" disabled>
                    Select a Voucher
                  </MenuItem>
                  {vouchers.map((v) => (
                    <MenuItem key={v.VOUCHER_ID} value={v.VOUCHER_ID}>
                      {v.VOUCHER_NAME}
                    </MenuItem>
                  ))}
                </Select>
                {errors.voucherId && (
                  <FormHelperText error> {errors.voucherId} </FormHelperText>
                )}
              </FormControl>
            </Box>
          </Stack>
          <Box
            sx={{
              "& > :not(style)": {
                m: 1,
                width: { xs: "100%", sm: "82ch" },
              },
            }}
          >
            <TextField
              label="Remarks"
              multiline
              maxRow={10}
              fullWidth
              onChange={(e) => setRemarks(e.target.value)}
            />
          </Box>
          <Box
            sx={{
              "& > :not(style)": {
                m: 1,
                width: { xs: "100%", sm: "82ch" },
              },
            }}
          >
            <FormControl error={!!errors.fileUploadValue} fullWidth>
              <FormLabel>Type of upload</FormLabel>
              <RadioGroup
                row
                value={fileUploadValue}
                name="file-upload-type"
                required
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value={1}
                  control={<Radio />}
                  label="Upload and Save Document"
                />
                <FormControlLabel
                  value={2}
                  control={<Radio />}
                  label="Digitally Sign and Save Document"
                />
                <FormControlLabel
                  value={3}
                  control={<Radio />}
                  label="Sign and Forward and save document"
                />
              </RadioGroup>
            </FormControl>
          </Box>
          {openSelectManager && (
            <Box
              sx={{
                "& > :not(style)": {
                  m: 1,
                  width: { xs: "100%", sm: "82ch" },
                },
              }}
            >
              <FormControl
                sx={{
                  m: 1,
                  minWidth: 120,
                }}
              >
                <InputLabel>Send To</InputLabel>
                <Select
                  value={sendToEmployeeId}
                  onChange={handleSelectManagerChange}
                  label="Send To"
                >
                  {managers.map((m) => (
                    <MenuItem key={m.EMPLOYEE_ID} value={m.EMPLOYEE_ID}>
                      {m.NAME}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}
          <Box
            sx={{
              "& > :not(style)": {
                m: 1,
                width: { xs: "100%", sm: "82ch" },
              },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Button
              variant="contained"
              type="submit"
              disabled={
                !file ||
                !voucherId ||
                !departemntId ||
                !fileName ||
                fileUploadValue === 0
              }
            >
              Upload
            </Button>
          </Box>
        </Box>
      </form>
    </div>
  );
};

export default UploadFile;
