import axios from "axios";
import React, { useContext, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { baseURL } from "../baseURL";
import AuthContext from "../Context";
import "../assets/css/LoginPage.css";
import logo from "../assets/images/doc-ladder-logo.png";

const LoginPage = () => {
  const { checkToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    if (!email || !password) {
      setError("All fields are required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await axios.post(
        `${baseURL}/users/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      checkToken();
      setSuccess(true);
      setError(null);
      navigate("/");
    } catch (error) {
      console.log("error: ", error.response.data.error);
      if (error.response.data.error) {
        setError(
          error.response.data.error ||
            "An error occurred. Please try again later"
        );
      } else if (error.request) {
        setError("Network Error. Please try again later");
      } else {
        setError("An error occurred. Please try again later");
      }

      setSuccess(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form">
          <div className="login-form-logo">
            <img src={logo} alt="Doc Ladder Logo" className="logo-image" />
          </div>
          <div className="login-form-inputs">
            {success && (
              <div className="success-message">
                Login successful. Redirecting...
              </div>
            )}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-container">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="forgot-password">
                <RouterLink to="/forgot-password">Forgot password?</RouterLink>
              </div>

              <button type="submit" className="login-button">
                Login
              </button>
            </form>
          </div>
        </div>
        <div className="login-image-panel">
          <div className="login-gradient-bg"></div>
          <div className="login-gradient-overlay"></div>
          <div className="login-welcome-content">
            <span className="welcome-small">WELCOME TO</span>
            <h1 className="welcome-title">Doc Ladder</h1>
            <div className="welcome-divider"></div>
            <span className="welcome-desc">Login to Access Dashboard</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
