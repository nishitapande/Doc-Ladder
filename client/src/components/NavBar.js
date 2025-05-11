import React, { useContext, useState } from "react";
import AuthContext from "../Context";
import { Link } from "react-router-dom";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import LogOut from "./LogOut";

const NavBar = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <div style={styles.navbar}>
      <div style={styles.container}>
        {/* LOGO CONTAINER */}
        <div style={styles.logo}>
          <Link to="/" style={styles.mainLink}>
            DMS
          </Link>
        </div>
        {/* MENU CONTAINER */}
        <div style={styles.linksContainer}>
          {isAuthenticated && (
            <ul style={styles.linksList}>
              <li style={styles.linkItem}>
                <Link to="/allfiles" style={styles.mainLink}>
                  View departmental file
                </Link>
              </li>
              <li style={styles.linkItem}>
                <Link to="/upload" style={styles.mainLink}>
                  Upload
                </Link>
              </li>
              <li style={styles.linkItem}>
                <Link to="/files" style={styles.mainLink}>
                  View Files
                </Link>
              </li>
              <li style={styles.linkItem}>
                <Link to="/signfiles" style={styles.mainLink}>
                  Approve files
                </Link>
              </li>
            </ul>
          )}
        </div>
        {/* USER MENU CONTAINER */}
        <div>
          {isAuthenticated === true ? (
            <>
              <IconButton onClick={handleMenuClick} color="inherit">
                <Avatar>
                  <AccountCircle />
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem>
                  <Link to="/profile" style={styles.link}>
                    Profile
                  </Link>
                </MenuItem>
                {user?.IS_ADMIN && (
                  <>
                    <MenuItem>
                      <Link to="/allemployees" style={styles.link}>
                        All Employees
                      </Link>
                    </MenuItem>
                    <MenuItem>
                      <Link to="/departments" style={styles.link}>
                        Departments
                      </Link>
                    </MenuItem>{" "}
                    <MenuItem>
                      <Link to="/vouchers" style={styles.link}>
                        Vouchers
                      </Link>
                    </MenuItem>
                  </>
                )}
                <MenuItem>
                  <LogOut />
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Link to="/login" style={styles.mainLink}>
              Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    backgroundColor: "#2498bf",
    padding: "10px",
    zIndex: 1000,
  },
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
  },
  logo: {
    marginLeft: "25px",
    fontSize: "36px",
  },
  linksContainer: {
    display: "flex",

    justifyContent: "center",
    flexGrow: 1,
  },
  linksList: {
    display: "flex",
    listStyleType: "none",
    padding: 0,
    margin: 0,
    justifyContent: "space-around",
    flexWrap: "wrap",
  },
  linkItem: {
    margin: "0 10px",
    fontSize: "18px",
  },
  mainLink: {
    textDecoration: "none",
    color: "#fff",
  },
  link: {
    textDecoration: "none",
    color: "#000",
  },
};
