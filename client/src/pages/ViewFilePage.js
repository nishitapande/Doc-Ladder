import React, { useState, useContext, useEffect } from "react";
import SearchBar from "../components/SearchBar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, Box, CardContent, Typography, Grid } from "@mui/material";
import AuthContext from "../Context";
import { baseURL } from "../baseURL";
import CardComp from "../components/CardComp";

const ViewFilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);
  // console.log("data: ", data);
  return (
    <div className="top-margin">
      <Box
        sx={{
          flexGrow: 1,
        }}
        className="margin-x"
      >
        <SearchBar
          setData={setData}
          endpoint={`${baseURL}/security/userdepartments`}
          fileterKeys={["DEPARTMENT_NAME"]}
          placeholder="Search by department name"
        />
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
        >
          {data.length === 0 ? (
            <div> No departments found </div>
          ) : (
            data.map((department) => (
              <Grid item xs={2} sm={4} md={4} key={department.DEPARTMENT_ID}>
                <Link
                  to={`/documentList/${department.DEPARTMENT_ID}`}
                  className="link"
                >
                  <CardComp>{department.DEPARTMENT_NAME}</CardComp>
                </Link>
              </Grid>
            ))
          )}
        </Grid>
      </Box>
    </div>
  );
};

export default ViewFilePage;
