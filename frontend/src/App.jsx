// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Buy from "./pages/Buy.jsx";
import Sell from "./pages/Sell.jsx";
import SignIn from "./pages/SignIn.jsx";
import SignUp from "./pages/SignUp.jsx";
// ⬇️ Renamed: make sure you create src/pages/Ratings.jsx (or rename Reviews.jsx)
import Ratings from "./pages/Ratings.jsx";
import Messages from "./pages/Messages.jsx";
import Listings from "./pages/Listings.jsx"; // <-- NEW
import CarDetail from "./pages/CarDetail.jsx";

/* ---------- Small helper to protect routes ---------- */
function Protected({ children }) {
  const token = localStorage.getItem("usertoken"); // or use your AuthContext
  const location = useLocation();
  return token ? children : <Navigate to="/signin" replace state={{ from: location }} />;
}

function NotFound() {
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="mt-2 text-zinc-600">Page not found.</p>
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/listings" element={<Listings />} />  
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Reviews → Ratings */}
          <Route path="/ratings" element={<Ratings />} />
          <Route path="/listing/:id" element={<CarDetail />} />
          {/* Protected: only signed-in users */}
          <Route
            path="/buy"
            element={
              <Protected>
                <Buy />
              </Protected>
            }
          />
          <Route
            path="/sell"
            element={
              <Protected>
                <Sell />
              </Protected>
            }
          />
          <Route
            path="/messages/:sellerId"
            element={
              <Protected>
                <Messages />
              </Protected>
            }
          />

          {/* 404 */}
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </main>
    </div>
  );
}
