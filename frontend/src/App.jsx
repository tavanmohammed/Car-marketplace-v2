import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Browse from "./pages/Browse.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
import Sell from "./pages/Sell.jsx";
import CarDetail from "./pages/CarDetail.jsx";
import ExternalAPIs from "./pages/ExternalAPIs.jsx";
import { useAuth } from "./context/AuthContext.jsx";

function NotFound() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-zinc-600">Page not found.</p>
    </div>
  );
}

function ProtectedRoute({ children, requireRole = null }) {
  const { isAuthed, userRole } = useAuth();
  
  if (!isAuthed) {
    return <Navigate to="/signin" replace />;
  }
  
  if (requireRole === "admin" && userRole !== "admin") {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-zinc-600">Admin access required.</p>
      </div>
    );
  }
  
  if (requireRole === "user" && userRole !== "user" && userRole !== "admin") {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-2 text-zinc-600">User account required.</p>
      </div>
    );
  }
  
  return children;
}

function AdminRoute({ children }) {
  return <ProtectedRoute requireRole="admin">{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/listing/:id" element={<CarDetail />} />
          <Route path="/external-apis" element={<ExternalAPIs />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/sell"
            element={
              <ProtectedRoute requireRole="user">
                <Sell />
              </ProtectedRoute>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}
