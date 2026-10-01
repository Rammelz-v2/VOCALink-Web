import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthBranding from "../../components/layout/AuthBranding";
import AuthFooter from "../../components/layout/AuthFooter";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://vocalink-fastapi-7gxl.onrender.com/api/auth/forgot-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Could not send reset email. Please try again.");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      left={
        <AuthBranding description="Empowering teachers to connect with nonverbal students through seamless communication." />
      }
      right={
        <div className="form-card">
          <h2 className="form-title">Forgot Password</h2>
          <p className="form-desc">Enter your email and we'll send you a reset link</p>

          {error && <div className="alert">{error}</div>}
          {sent ? (
            <div className="alert alert-success">
              Check your email for a password reset link.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="form">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
              />

              <button className="primary-btn" type="submit" disabled={loading}>
                {loading ? "Sending…" : "Send Reset Link"}
              </button>

              <p className="bottom-text">
                Remember your password? <Link to="/login">Sign In</Link>
              </p>

              <AuthFooter />
            </form>
          )}
        </div>
      }
    />
  );
}
