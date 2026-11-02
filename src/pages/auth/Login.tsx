import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthBranding from "../../components/layout/AuthBranding";
import AuthFooter from "../../components/layout/AuthFooter";
import { useLogin } from "../../hooks/useLogin";

export default function Login() {
  const {
    identifier, setIdentifier,
    password, setPassword,
    remember, setRemember,
    showPass, toggleShowPass,
    error, loading, onSubmit,
  } = useLogin();

  const location = useLocation();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (location.search.includes("registered=1")) {
      setSuccessMsg("Account created! Please sign in.");
    } else if (location.search.includes("reset=1")) {
      setSuccessMsg("Password reset successfully! You can now sign in.");
    }
  }, [location.search]);

  return (
    <AuthLayout
      left={
        <AuthBranding description="Empowering teachers to connect with nonverbal students through seamless communication." />
      }
      right={
        <div className="form-card">
          <h2 className="form-title">Welcome Back</h2>
          <p className="form-desc">Sign in to access your dashboard</p>

          {successMsg && <div className="alert alert-success">{successMsg}</div>}
          {error && <div className="alert">{error}</div>}

          <form onSubmit={onSubmit} className="form">
            <label className="label">Email or Username</label>
            <input
              className="input"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or username"
              autoComplete="username"
              required
            />

            <label className="label">Password</label>
            <div className="input-wrap">
              <input
                className="input"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
              <button type="button" className="eye" onClick={toggleShowPass} aria-label="Toggle password">
                {showPass ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="row">
              <label className="checkbox">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="link-btn">
                Forgot Password?
              </Link>
            </div>

            <button className="primary-btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign In"}
            </button>

            <p className="bottom-text">
              Don&apos;t have an account? <Link to="/signup">Sign Up</Link>
            </p>

            <AuthFooter />
          </form>
        </div>
      }
    />
  );
}