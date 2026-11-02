import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const useLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleShowPass = () => setShowPass((v) => !v);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ identifier, password, remember });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return { 
    identifier, setIdentifier, 
    password, setPassword, 
    remember, setRemember, 
    showPass, toggleShowPass,
    error, loading, onSubmit
  };
};