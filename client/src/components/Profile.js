import React from "react";
import { Box, Avatar, Grid, TextField } from "@mui/material";
import { deepOrange } from "@mui/material/colors";

const Profile = ({ data }) => {
  console.log("dsta from profile: ", data);
  console.log("dd", data[0]);
  const firstLetter = data.FIRST_NAME
    ? data.FIRST_NAME.charAt(0).toUpperCase()
    : "";

  console.log("letter: ", firstLetter);

  return (
    <Box
      sx={{
        boxShadow: 3,
        margin: "0 auto",
        padding: 2,
        maxWidth: 1400,
        borderRadius: 2,
        backgroundColor: "#fff",
        mt: 3,
      }}
    >
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={4} container justifyContent="center">
          <Avatar
            sx={{
              bgcolor: deepOrange[500],
              width: 150,
              height: 150,
              fontSize: 60,
            }}
          >
            {" "}
            {firstLetter}{" "}
          </Avatar>
        </Grid>
        <Grid item xs={12} md={8}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                variant="outlined"
                fullWidth
                disabled
                value={data.FIRST_NAME}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Last Name"
                variant="outlined"
                fullWidth
                disabled
                value={data.LAST_NAME}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                disabled
                value={data.EMAIL}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Password"
                variant="outlined"
                fullWidth
                disabled
                value="******"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Gender"
                variant="outlined"
                fullWidth
                disabled
                value={data.GENDER}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Address"
                variant="outlined"
                fullWidth
                disabled
                value={data.ADDRESS}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Designation"
                variant="outlined"
                fullWidth
                disabled
                value={data.DESIGNATION_ID}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department"
                variant="outlined"
                fullWidth
                disabled
                value={data.DEPARTMENT_NAME}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {data.MANAER_FULL_NAME !== " " && (
                <TextField
                  label="Manager"
                  variant="outlined"
                  fullWidth
                  disabled
                  value={data.MANAER_FULL_NAME}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
