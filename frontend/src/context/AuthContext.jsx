import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("usertoken"));

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("http://localhost:4000/api/auth/me", {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
            setToken(data.user.id?.toString() || "token");
            localStorage.setItem("usertoken", data.user.id?.toString() || "token");
          }
        }
      } catch (err) {
      }
    }
    checkSession();
  }, []);

  const login = async (credentials, tok) => {
    if (credentials && credentials.email && credentials.password) {
      try {
        const res = await fetch("http://localhost:4000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include",
        });

        if (!res.ok) {
          let msg = "Login failed.";
          try {
            const data = await res.json();
            if (data?.message) msg = data.message;
          } catch (_) {}
          throw new Error(msg);
        }

        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setToken(data.user.id?.toString() || "token");
          localStorage.setItem("usertoken", data.user.id?.toString() || "token");
          return;
        }
      } catch (err) {
        if (err.message.includes("fetch")) {
          throw new Error("Cannot connect to server. Please make sure the backend is running on port 4000.");
        }
        throw err;
      }
    }

    if (credentials && !credentials.email && tok) {
      setUser(credentials);
      setToken(tok);
      localStorage.setItem("usertoken", tok);
    }
  };

  const logout = async () => {
    try {
      await fetch("http://localhost:4000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("usertoken");
    }
  };

  const signup = async ({ username, email, password, first_name, last_name, phone_number }) => {
    try {
      const res = await fetch("http://localhost:4000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, first_name, last_name, phone_number }),
        credentials: "include",
      });

      if (!res.ok) {
        let msg = "Failed to sign up.";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
          if (data?.details) msg = data.details.join(", ");
        } catch (_) {}
        throw new Error(msg);
      }

      const data = await res.json();

      if (data.user && data.token) {
        await login(data.user, data.token);
      } else if (data.user) {
        setUser(data.user);
        setToken(data.user.id?.toString() || "token");
        localStorage.setItem("usertoken", data.user.id?.toString() || "token");
      } else {
        setUser({ username, email });
      }
    } catch (err) {
      if (err.message.includes("fetch")) {
        throw new Error("Cannot connect to server. Please make sure the backend is running on port 4000.");
      }
      throw err;
    }
  };

  const userRole = user?.role || "guest";
  const isAdmin = userRole === "admin";
  const isUser = userRole === "user";
  const isGuest = userRole === "guest";

  const value = useMemo(
    () => ({
      user,
      isAuthed: !!user,
      token,
      login,
      logout,
      signup,
      userRole,
      isAdmin,
      isUser,
      isGuest,
    }),
    [user, token, userRole, isAdmin, isUser, isGuest]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
