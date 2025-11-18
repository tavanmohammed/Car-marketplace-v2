import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthed, userRole, isAdmin, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    if (role === "admin") return "bg-purple-100 text-purple-700";
    if (role === "user") return "bg-blue-100 text-blue-700";
    return "bg-zinc-100 text-zinc-700";
  };

  const getRoleLabel = (role) => {
    if (role === "admin") return "Admin";
    if (role === "user") return "User";
    return "Guest";
  };

  return (
    <nav className="bg-white border-b border-zinc-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-zinc-900">
              iWantCar
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/browse"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
            >
              Browse
            </Link>
            {(isAuthed && (isAdmin || userRole === "user")) && (
              <Link
                to="/sell"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                Sell
              </Link>
            )}
            {isAuthed ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-zinc-900">
                  {user?.username || user?.email}
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(
                    userRole
                  )}`}
                >
                  {getRoleLabel(userRole)}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${getRoleBadgeColor(
                    "guest"
                  )}`}
                >
                  Guest
                </span>
                <Link
                  to="/signin"
                  className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-yellow-500"
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
