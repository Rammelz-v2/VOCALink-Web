import { createContext, useContext, useState, type ReactNode } from 'react';
import type { User } from '../types/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: any) => Promise<void>;
  signup: (credentials: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 1. Check if the user already logged in previously
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token')
  );
  
  // 2. If we have a token, we pretend the user is logged in for now
  const [user, setUser] = useState<User | null>(
    token ? { identifier: 'Teacher' } as any : null 
  );

  const signup = async (credentials: any) => {
    try {
      const response = await fetch('https://vocalink-fastapi-7gxl.onrender.com/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          email: credentials.email,
          status: credentials.status,
          password: credentials.password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const detail = data.detail || "";
        if (detail.includes("already taken") || detail.includes("already exists")) {
          throw new Error("Username or email is already taken. Please choose another.");
        }
        if (detail.includes("email") && detail.includes("valid")) {
          throw new Error("Please enter a valid email address.");
        }
        throw new Error(detail || "Registration failed. Please try again.");
      }

      // Return auto_verified flag so the signup page can skip email verification
      return data;
    } catch (error: any) {
      if (error.message === "Failed to fetch" || error.name === "TypeError") {
        throw new Error("Cannot reach the server. Please check your internet connection and try again.");
      }
      throw error;
    }
  };

  const login = async ({ identifier, password, remember }: any) => {
    try {
  
      const response = await fetch('https://vocalink-fastapi-7gxl.onrender.com/api/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: identifier, // Changed this to identifier!
          password: password,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const detail = errData.detail || "";
        if (response.status === 401) throw new Error("Invalid email or password. Please try again.");
        throw new Error(detail || "Login failed. Please try again.");
      }

      const data = await response.json();

      // 2. The React Bouncer!
      if (data.status !== 'TEACHER') {
        throw new Error('Access Denied: This web portal is for Teachers only. Please use the mobile app.');
      }

      const token = data.access_token;

      // Clear BOTH storages first to remove any stale tokens
      localStorage.removeItem('access_token');
      sessionStorage.removeItem('access_token');

      // Save fresh token to the correct storage
      if (remember) {
        localStorage.setItem('access_token', token);
      } else {
        sessionStorage.setItem('access_token', token);
      }

      setToken(token);
      setUser({ identifier } as any); 

    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Passes the error to the UI
    }
  };

  const logout = () => {
    // Clear everything when logging out
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('access_token');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};