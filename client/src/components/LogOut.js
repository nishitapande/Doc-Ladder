import React from "react";
import Cookies from "js-cookie";

const LogOut = () => {
  const handleLogout = async () => {
    Cookies.remove("token");
    window.location.href = "/";
  };
  return (
    <div style={styles.container}>
      <span
        style={styles.text}
        onClick={handleLogout}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        LogOut
      </span>
    </div>
  );
};

const styles = {
  container: {
    cursor: "pointer",
  },
  text: {
    color: "#333",
    fontSize: "16px",
    textDecoration: "none",
    lineHeight: "24px",
    transition: "color 0.3s ease",
  },
};

const handleMouseEnter = (e) => {
  e.currentTarget.style.color = "#007bff";
};
const handleMouseLeave = (e) => {
  e.currentTarget.style.color = "#333";
};

export default LogOut;
