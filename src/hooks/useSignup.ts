import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useSignup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [username,        setUsername]        = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass,        setShowPass]        = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [error,           setError]           = useState("");
  const [loading,         setLoading]         = useState(false);
  const [loadingMsg,      setLoadingMsg]      = useState("Creating account…");
  const [success,         setSuccess]         = useState("");

  const toggleShowPass    = () => setShowPass(v => !v);
  const toggleShowConfirm = () => setShowConfirm(v => !v);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Client-side validation
    if (!username.trim())                          { setError("Username is required."); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError("Please enter a valid email address."); return; }
    if (password.length < 6)                       { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword)              { setError("Passwords do not match."); return; }

    setLoading(true);
    setLoadingMsg("Creating account…");

    const slowTimer = setTimeout(() => {
      setLoadingMsg("Almost there… server is starting up, please don't refresh.");
    }, 8000);

    try {
      await signup({ username, email, password, status: "TEACHER" });
      clearTimeout(slowTimer);
      navigate("/login?registered=1");
    } catch (err: any) {
      clearTimeout(slowTimer);
      const msg = err?.message || "";
      if (msg.toLowerCase().includes("already taken") || msg.toLowerCase().includes("already exists")) {
        setError("An account with that username or email already exists. Try signing in instead.");
      } else {
        setError(msg || "Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
      setLoadingMsg("Creating account…");
    }
  };

  return {
    username, setUsername,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    showPass, toggleShowPass,
    showConfirm, toggleShowConfirm,
    error, loading, loadingMsg, success, onSubmit,
  };
};
