import React, { useState } from "react";
import "./Login.css";

const Login = () => {
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    let valid = true;

    if (e.target.email.value === "duplicate@email.com") {
      setEmailError("Duplicate Email");
      valid = false;
    } else {
      setEmailError("");
    }

    if (e.target.password.value.length < 6) {
      setPasswordError("Invalid Password");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (valid) {
      alert("Successful Login!");
    }
  };

  return (
    <div className="account-container">
      <div className="left-container">
        <div className="logo">
          <img src="/mdi_leaf.png" alt="FreshWatch Logo" className="icon" />
          <h1>FreshWatch</h1>
        </div>

        <h2>Login</h2>

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

          <button type="submit">Login</button>
        </form>
      </div>
      <div className="right-container">
        <h2>Not a member yet?</h2>
        <h3>Sign up to track your grocery usage with FreshWatch</h3>
        <button className="signup-button" onClick={() => window.location.href = '/signup'}>
          Signup
        </button>
      </div>
    </div>
  );
};

export default Login;
