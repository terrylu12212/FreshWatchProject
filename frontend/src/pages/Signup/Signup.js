import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

const Signup = () => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await fetch('http://localhost:4000/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password})
      });
      const data = await res.json();
      if (!res.ok) {
        setEmailError(data.error || "Signup failed");
      } else {
        // Redirect to login page after successful signup
        navigate('/login');
      }
    } catch (err) {
      setEmailError("Network error");
    }
  };
  // Redirect to main page if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="account-container">
      <div className="left-container">
        <div className="logo">
          <img src="/mdi_leaf.png" alt="FreshWatch Logo" className="icon" />
          <h1>FreshWatch</h1>
        </div>

        <h2>Account Creation</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <div className="input-wrapper">
              <img src="/email-logo.png" alt="Email Logo" className="email-icon" />
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                required
              />
            </div>
            {emailError && <p className="error">{emailError}</p>}
          </div>

          <div className="input-group">
            <div className="input-wrapper">
              <img src="/password-logo.png" alt="Password Logo" className="icon" />
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
              />
            </div>
            {passwordError && <p className="error">{passwordError}</p>}
          </div>

          <button type="submit">Create Account</button>
        </form>
      </div>
      <div className="right-container">
        <h2>Already a member?</h2>
        <h3>Log in to track your grocery usage with FreshWatch</h3>
        <button className="login-button" onClick={() => window.location.href = '/login'}>
          Login
        </button>
      </div>
    </div>
  );
};

export default Signup;
