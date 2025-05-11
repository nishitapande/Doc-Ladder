import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import React from "react";
import { Link as RouterLink } from "react-router-dom";

const TableComp = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>S.No</TableCell>
            <TableCell>File Name</TableCell>
            <TableCell>Created Date</TableCell>
            <TableCell>Created By</TableCell>
            <TableCell>Remarks</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((item, index) => (
            <TableRow
              key={item.FILE_ID}
              sx={{ "&: last=child td, &: last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {index + 1}
              </TableCell>
              <TableCell align="left"> {item.FILE_NAME} </TableCell>
              <TableCell align="left"> {item.CREATED_ON} </TableCell>
              <TableCell align="left"> {item.NAME} </TableCell>
              <TableCell align="left"> {item.REAMRKS} </TableCell>
              <TableCell align="left">
                <Button component={RouterLink} to={`/viewpdf/${item.FILE_ID}`}>
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableComp;
