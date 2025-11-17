// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { isAuthed } = useAuth();
  const location = useLocation();
  return isAuthed ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
