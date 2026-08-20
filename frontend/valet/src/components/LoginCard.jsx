import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginCard() {
  const navigate = useNavigate();

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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
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

      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Help Link */}
      <div className="login-top">
        <button className="help" type="button">
          <span className="help-icon">?</span>
          <span>Need help?</span>
        </button>
      </div>

      {/* Main Login Card Container */}
      <div className="login-card-container">
        <div className="login-card">
          {/* Heading */}
          <div className="login-heading">
            <h1>Welcome Back</h1>
            <p>Login to your account to continue</p>
          </div>

          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email">Email or Phone Number</label>

              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 6.5 L10 11.25 L17.5 6.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="2.5"
                    y="4.5"
                    width="15"
                    height="11"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                </svg>

                <input
                  id="email"
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password">Password</label>

              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect
                    x="4"
                    y="9"
                    width="12"
                    height="8"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.6"
                  />
                  <path
                    d="M7 9V6.5a3 3 0 0 1 6 0V9"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 10s2.5-5 7.5-5 7.5 5 7.5 5-2.5 5-7.5 5-7.5-5-7.5-5Z"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      />
                      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path
                        d="M3 3l14 14M7.5 7.8A4.2 4.2 0 0 0 10 14.5c2.5 0 4.5-2 4.5-4.5a4.2 4.2 0 0 0-.7-2.3"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5.2 5.5C3.4 6.8 2.2 8.4 1.5 10c0 0 2.5 5 8.5 5 1.6 0 3-.5 4.1-1.2"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="password-options">
              <label className="remember">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <a href="#forgot">Forgot Password?</a>
            </div>

            {/* Error Message */}
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Divider */}
          <div className="divider">
            <span></span>
            <p>or</p>
            <span></span>
          </div>

          {/* Customer Action */}
          <div className="signup">Are you a customer?</div>

          <button type="button" className="customer-button">
            <span>Customer Site</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginCard;