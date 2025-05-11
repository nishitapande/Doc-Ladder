import React, { useEffect, useState, useContext } from "react";

import AuthContext from "../Context";

import Profile from "../components/Profile";

import DisplaySignature from "../components/DisplaySignature";

import { useNavigate } from "react-router-dom";

import { baseURL } from "../baseURL";
import Tabs from "../components/Tabs";
import axios from "axios";

const UserProfilePage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeComponent, setActiveComponent] = useState("Profile");
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      return navigate("/login");
    } else {
      const fetchUserProfile = async () => {
        try {
          const response = await axios.get(`${baseURL}/users/getuserprofile`);
          console.log("res: ", response);
          setData(response.data.recordset[0]);
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };

      fetchUserProfile();
    }
  }, [isAuthenticated, navigate]);

  const renderComponent = () => {
    switch (activeComponent) {
      case "Profile":
        return <Profile data={data} />;
      case "DigitalSignature":
        return <DisplaySignature />;
    }
  };

  return (
    <div className="top-margin">
      <div>
        <Tabs
          setActiveComponent={setActiveComponent}
          activeComponent={activeComponent}
        />
      </div>
      <div>{renderComponent()}</div>
    </div>
  );
};

export default UserProfilePage;
