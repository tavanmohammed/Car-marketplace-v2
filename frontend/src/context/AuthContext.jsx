// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("usertoken"));

  useEffect(() => {
    if (token && !user) {
      // Optionally fetch profile with token; here we just mock it
      setUser({ username: "User" });
    }
  }, [token, user]);

  // 🔹 LOGIN: used after successful login API call
  const login = async (userObj, tok) => {
    setUser(userObj);
    setToken(tok);
    localStorage.setItem("usertoken", tok);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("usertoken");
  };

  // 🔹 NEW: SIGNUP function used by your SignUp page
  const signup = async ({ name, email, password }) => {
    // call your backend register route
    const res = await fetch("http://localhost:4000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
      credentials: "include", // only if you use cookies/sessions
    });

    if (!res.ok) {
      // try to read error message from backend if it sends one
      let msg = "Failed to sign up.";
      try {
        const data = await res.json();
        if (data?.message) msg = data.message;
      } catch (_) {}
      throw new Error(msg);
    }

    const data = await res.json();

    // If your backend returns { user, token }, use them:
    if (data.user && data.token) {
      await login(data.user, data.token);
    } else if (data.user) {
      setUser(data.user);
    } else {
      // fallback if backend only returns message
      setUser({ username: name, email });
    }
  };

  const value = useMemo(
  () => ({
    user,
    isAuthed: !!user,  // 👈 use user, not token
    token,
    login,
    logout,
    signup,
  }),
  [user, token]
);


  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
