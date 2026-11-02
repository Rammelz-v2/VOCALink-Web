import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthBranding from "../../components/layout/AuthBranding";
import AuthFooter from "../../components/layout/AuthFooter";

const API = "https://vocalink-fastapi-7gxl.onrender.com/api/auth";
const RESEND_COOLDOWN = 60;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") || "";

  const [code, setCode]               = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass]       = useState(false);
  const [loading, setLoading]         = useState(false);
  const [resending, setResending]     = useState(false);
  const [error, setError]             = useState("");
  const [resendMsg, setResendMsg]     = useState("");
  const [cooldown, setCooldown]       = useState(0);

  const startCooldown = useCallback(() => setCooldown(RESEND_COOLDOWN), []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Reset failed. Please try again.");
      navigate("/login?reset=1");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResendMsg("");
    setError("");
    setResending(true);
    try {
      const res = await fetch(`${API}/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Could not resend. Try again.");
      setResendMsg("A new code has been sent to your email.");
      startCooldown();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      left={<AuthBranding description="Empowering teachers to connect with nonverbal students through seamless communication." />}
      right={
        <div className="form-card">
          <h2 className="form-title">Reset Password</h2>
          <p className="form-desc">
            We sent a 6-digit code to <strong style={{ wordBreak: "break-all" }}>{email || "your email"}</strong>.
            Enter it below along with your new password.
          </p>

          {error     && <div className="alert">{error}</div>}
          {resendMsg && <div className="alert alert-success">{resendMsg}</div>}

          <form onSubmit={onSubmit} className="form">
            <label className="label">Reset Code</label>
            <input
              className="input"
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit code"
              inputMode="numeric"
              maxLength={6}
              autoFocus
              style={{ fontSize: 22, fontWeight: 700, textAlign: "center", letterSpacing: 8 }}
              required
            />

            <label className="label">New Password</label>
            <div className="input-wrap">
              <input
                className="input"
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
              />
              <button type="button" className="eye" onClick={() => setShowPass(v => !v)} aria-label="Toggle password">
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

            <button
              className="primary-btn"
              type="submit"
              disabled={loading || code.length < 6}
              style={{ marginTop: 20 }}
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              {cooldown > 0 ? (
                <span style={{ fontSize: 13, color: "#94A3B8" }}>
                  Resend available in {cooldown}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onResend}
                  disabled={resending}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: "#0E8DB8", fontWeight: 600, textDecoration: "underline",
                  }}
                >
                  {resending ? "Sending…" : "Didn't receive a code? Resend"}
                </button>
              )}
            </div>

            <p className="bottom-text">
              <Link to="/forgot-password">← Use a different email</Link>
            </p>
            <AuthFooter />
          </form>
        </div>
      }
    />
  );
}
