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
  const userDeptId = user?.DEPARTMENT_ID || user?.departmentId || "";
  const userManagerId = user?.MANAGER_ID || user?.managerId || "";

  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [departments, setDepartments] = useState([]);
  const [vouchers, setVouchers] = useState([]);
  const [voucherId, setVoucherId] = useState("");
  const [departemntId, setDepartmentId] = useState(userDeptId);
  const [remarks, setRemarks] = useState("");
  const [errors, setErrors] = useState({});
  const [fileUploadValue, setFileUploadValue] = useState(0);
  const [sendToEmployeeId, setSendToEmployeeId] = useState(userManagerId);
  const [openSelectManager, setOpenSelectManager] = useState(false);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    if (userDeptId && !departemntId) {
      setDepartmentId(userDeptId);
    }
    if (userManagerId && !sendToEmployeeId) {
      setSendToEmployeeId(userManagerId);
    }
  }, [userDeptId, userManagerId]);

  useEffect(() => {
    const getDepartments = async () => {
      try {
        const res = await axios.get(`${baseURL}/departments/alldepartments`);
        const depts = res.data.data || res.data.recordsets?.[0] || res.data || [];
        setDepartments(depts);
        if (!departemntId && depts.length > 0) {
          setDepartmentId(userDeptId || depts[0].DEPARTMENT_ID || depts[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const getVouchers = async () => {
      try {
        const res = await axios.get(`${baseURL}/vouchers/getvouchers`);
        setVouchers(res.data.data || res.data.recordsets?.[0] || res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    const getManagers = async () => {
      try {
        const res = await axios.get(`${baseURL}/users/employeesname`);
        setManagers(res.data.data || res.data.recordsets?.[0] || res.data || []);
      } catch (error) {
        console.error(error);
      }
    };

    getDepartments();
    getVouchers();
    getManagers();
  }, [userDeptId]);

  const validateForm = () => {
    let errs = {};
    if (!file) errs.file = "File is required";
    if (!fileName) errs.fileName = "File name is required";
    if (!departemntId) errs.departmentId = "Department is required";
    if (!voucherId) errs.voucherId = "Voucher is required";
    if (fileUploadValue === 0) errs.fileUploadValue = "Type of upload is required";
    if (fileUploadValue === 3 && !sendToEmployeeId) errs.sendToEmployeeId = "Recipient manager is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
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
    formData.append("fileUploadValue", parseInt(fileUploadValue, 10));
    if (fileUploadValue === 3 && sendToEmployeeId) {
      formData.append("sendFileTo", sendToEmployeeId);
    }

    try {
      const res = await axios.post(`${baseURL}/files/uploadfile`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.status === 200 || res.status === 201) {
        alert("File uploaded successfully");
        setFile(null);
        setFileName("");
        setDepartmentId(userDeptId || "");
        setVoucherId("");
        setRemarks("");
        setFileUploadValue(0);
        setSendToEmployeeId(userManagerId || "");
        setErrors({});
      }
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Failed to upload file";
      alert("Failed to upload file: " + msg);
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
    const value = parseInt(e.target.value, 10);
    setFileUploadValue(value);
    if (value === 3) {
      setOpenSelectManager(true);
    } else {
      setOpenSelectManager(false);
    }
  };

  const handleSelectManagerChange = (e) => {
    setSendToEmployeeId(e.target.value);
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
                error={!!errors.departmentId}
              >
                <InputLabel>Department</InputLabel>
                <Select
                  value={departemntId || ""}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  label="Department"
                >
                  <MenuItem value="" disabled>
                    Select a Department
                  </MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.DEPARTMENT_ID || d.id} value={d.DEPARTMENT_ID || d.id}>
                      {d.DEPARTMENT_NAME || d.name}
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
                  value={voucherId || ""}
                  onChange={(e) => setVoucherId(e.target.value)}
                  label="Voucher Name"
                  required
                >
                  <MenuItem value="" disabled>
                    Select a Voucher
                  </MenuItem>
                  {vouchers.map((v) => (
                    <MenuItem key={v.VOUCHER_ID || v.id} value={v.VOUCHER_ID || v.id}>
                      {v.VOUCHER_NAME || v.name}
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
                  value={sendToEmployeeId || ""}
                  onChange={handleSelectManagerChange}
                  label="Send To"
                >
                  <MenuItem value="" disabled>
                    Select a Recipient
                  </MenuItem>
                  {managers.map((m) => (
                    <MenuItem key={m.EMPLOYEE_ID || m.id} value={m.EMPLOYEE_ID || m.id}>
                      {m.NAME || m.name}
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
