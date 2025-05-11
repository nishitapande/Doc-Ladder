import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

import Cookies from "js-cookie";
import { baseURL } from "./baseURL";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated");
  });
  const [token, setToken] = useState(Cookies.get());

  const checkToken = async () => {
    if (token) {
      try {
        const isValid = await axios.get(`${baseURL}/users/`, {
          withCredentials: true,
          credentials: "include",
        });
        // console.log("isvalid: ", isValid);
        if (isValid.status === 200) {
          setUser(isValid.data.recordset[0]);
          setIsAuthenticated(true);
          localStorage.setItem(
            "user",
            JSON.stringify(isValid.data.recordset[0])
          );
          localStorage.setItem("isAuthenticated", true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("user");
          localStorage.removeItem("isAuthenticated");
        }
      } catch (error) {
        console.log("Error in token validation: ", error);
        setIsAuthenticated(false);
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      }
    } else {
      console.log("TOKEN NOT FOUND");
      setIsAuthenticated(false);
      localStorage.removeItem("user");
      // localStorage.removeItem("isAuthenticated");
    }
  };

  useEffect(() => {
    checkToken();
  }, [token]);

  return (
    <div>
      <AuthContext.Provider
        value={{
          user,
          isAuthenticated,
          checkToken,
        }}
      >
        {children}
      </AuthContext.Provider>
    </div>
  );
};

export default AuthContext;
