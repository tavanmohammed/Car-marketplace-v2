import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, isAuthed, logout } = useAuth();

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
            {isAuthed && (
              <Link
                to="/sell"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-900"
              >
                Sell
              </Link>
            )}
            {isAuthed ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-600">
                  {user?.username || user?.email}
                </span>
                <button
                  onClick={logout}
                  className="rounded-md bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-300"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/signin"
                className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-yellow-500"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
