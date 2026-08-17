import { useState } from "react";

function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Login failed.");
        return;
      }

      // Save token for authenticated API requests
      localStorage.setItem("access_token", data.session.access_token);

      // Save logged-in user's information
      localStorage.setItem("user", JSON.stringify(data.user));

      console.log("Login successful:", data.user);

      alert(`Welcome ${data.user.name}!`);

    } catch (error) {
      console.error("Login error:", error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

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

        <form onSubmit={handleLogin}>

          {/* Email */}
          <div className="input-group">
            <label>Email or Phone Number</label>

            <div className="input-wrapper">
              <span className="input-icon">✉</span>

              <input
                type="text"
                placeholder="Enter your email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="input-group">
            <label>Password</label>

            <div className="input-wrapper">
              <span className="input-icon">🔒</span>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Error */}
          {error && (
            <p style={{ color: "red", marginBottom: "10px" }}>
              {error}
            </p>
          )}

          {/* Login */}
          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

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

        {/* Customer Site */}
        <button className="customer-button">
          <span>Customer Site</span>
        </button>

      </div>

    </div>
  );
}

export default LoginCard;