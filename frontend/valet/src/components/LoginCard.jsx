import { useState } from "react";

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-wrapper">

      {/* Help */}
      <div className="login-top">
        <button className="help">
          <span className="help-icon">?</span>
          <span>Need help?</span>
        </button>
      </div>

      {/* Main Login Card */}
      <div className="login-card">

        {/* Heading */}
        <div className="login-heading">
          <h1>Welcome Back</h1>
          <p>Login to your account to continue</p>
        </div>

        {/* Email */}
        <div className="input-group">
          <label>Email or Phone Number</label>

          <div className="input-wrapper">
            <span className="input-icon">♙</span>

            <input
              type="text"
              placeholder="Enter your email or phone number"
            />
          </div>
        </div>

        {/* Password */}
        <div className="input-group">
          <label>Password</label>

          <div className="input-wrapper">
            <span className="input-icon">♙</span>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "◉" : "◌"}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="password-options">

          <label className="remember">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>

          <a href="#forgot">Forgot Password?</a>

        </div>

        {/* Login */}
        <button className="login-button">
          Login
        </button>

        {/* Divider */}
        <div className="divider">
          <span></span>
          <p>or</p>
          <span></span>
        </div>

        {/* Customer */}
        <div className="signup">
          Are you a customer?
        </div>

        {/* Google */}
        <button className="customer-button">
          <span>Customer Site</span>
        </button>

      </div>
      

    </div>
  );
}

export default LoginCard;