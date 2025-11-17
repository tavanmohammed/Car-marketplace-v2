// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthed, logout } = useAuth();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Listings", path: "/listings" }, // 👈 go to Listings page
    { name: "Buy", path: "/buy" },           // 👈 separate Buy page (protected)
    { name: "Sell", path: "/sell" },
    { name: "Ratings", path: "/ratings" },
  ];

  const displayName =
    user?.username || user?.name || user?.email || "User";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight">
          Car<span className="text-yellow-500">Hub</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive ? "text-yellow-600" : "text-zinc-700"
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}

          {/* Auth area */}
          {!isAuthed ? (
            <div className="flex items-center gap-3">
              <NavLink
                to="/signin"
                className="text-sm font-medium text-zinc-700 hover:text-yellow-600"
              >
                Sign in
              </NavLink>
              <NavLink
                to="/signup"
                className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-yellow-500"
              >
                Sign up
              </NavLink>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-600">
                Signed in as{" "}
                <span className="font-semibold text-zinc-900">
                  {displayName}
                </span>
              </span>
              <button
                onClick={logout}
                className="rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-800 hover:bg-zinc-100"
              >
                Sign out
              </button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md border border-zinc-300 px-2 py-1"
          onClick={() => setOpen((v) => !v)}
        >
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <nav className="mx-auto max-w-6xl px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block text-sm py-1 ${
                    isActive ? "text-yellow-600" : "text-zinc-700"
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}

            {!isAuthed ? (
              <div className="mt-3 flex flex-col gap-2">
                <NavLink
                  to="/signin"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-zinc-700"
                >
                  Sign in
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-zinc-900 text-center"
                >
                  Sign up
                </NavLink>
              </div>
            ) : (
              <div className="mt-3 flex flex-col gap-2">
                <span className="text-sm text-zinc-600">
                  Signed in as{" "}
                  <span className="font-semibold text-zinc-900">
                    {displayName}
                  </span>
                </span>
                <button
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-800 text-center"
                >
                  Sign out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
