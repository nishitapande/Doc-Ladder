import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Button,
  Paper,
} from "@mui/material";

const ReusableTable = ({ columns, rows, actions, conditionalActions }) => {
  console.log("rows: ", rows);
  const getButtonColor = (actionLabel, disabled) => {
    if (disabled) return "lightgrey";
    const action = actions.find((a) => a.label === actionLabel);
    return action ? action.color : "default";
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>S.No</TableCell>
            {columns.map((column) => (
              <TableCell key={column.id}>
                <TableSortLabel> {column.label} </TableSortLabel>
              </TableCell>
            ))}
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell> {index + 1} </TableCell>
              {columns.map((column) => (
                <TableCell key={column.id}>{row[column.id]}</TableCell>
              ))}

              <TableCell>
                {conditionalActions(row).map((actionLabel, i) => {
                  const action = actions.find((a) => a.label === actionLabel);
                  const isDisabled = action?.disabled
                    ? action.disabled(row)
                    : false;
                  return (
                    <Button
                      key={i}
                      onClick={() => !isDisabled && action?.handler(row)}
                      variant="contained"
                      disabled={isDisabled}
                      style={{
                        marginRight: "5px",
                        backgroundColor: getButtonColor(
                          actionLabel,
                          isDisabled
                        ),
                        color: isDisabled ? "darkgrey" : "white",
                      }}
                    >
                      {actionLabel}
                    </Button>
                  );
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReusableTable;
