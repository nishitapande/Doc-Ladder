import React from "react";

const Tabs = ({ setActiveComponent, activeComponent }) => {
  return (
    <div className="tabs-container">
      <div className="tabs-wrapper">
        <ul className="tabs-list">
          <li
            className={`tabs-item ${
              activeComponent === "Profile" ? "active" : ""
            }`}
            onClick={() => setActiveComponent("Profile")}
          >
            Profile
          </li>
          <li
            className={`tabs-item ${
              activeComponent === " DigitalSignature" ? "active" : ""
            }`}
            onClick={() => setActiveComponent("DigitalSignature")}
          >
            Digital Signature
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Tabs;
