import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignUp() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  });
  const [msg, setMsg] = useState("");

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");

    // Validation
    if (
      !form.username ||
      !form.email ||
      !form.password ||
      !form.first_name ||
      !form.last_name ||
      !form.phone_number
    ) {
      return setMsg("Please fill all required fields.");
    }

    if (form.password.length < 6) {
      return setMsg("Password must be at least 6 characters.");
    }

    if (form.password !== form.confirm) {
      return setMsg("Passwords do not match.");
    }

    try {
      await signup({
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
      });
      nav("/", { replace: true });
    } catch (err) {
      setMsg(err.message || "Failed to sign up.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Join to list, save, and compare cars.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <Field label="Username">
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.username}
            onChange={(e) => set("username", e.target.value)}
            required
          />
        </Field>

        <Field label="Email">
          <input
            type="email"
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            required
          />
        </Field>

        <Field label="First Name">
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.first_name}
            onChange={(e) => set("first_name", e.target.value)}
            required
          />
        </Field>

        <Field label="Last Name">
          <input
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.last_name}
            onChange={(e) => set("last_name", e.target.value)}
            required
          />
        </Field>

        <Field label="Phone Number">
          <input
            type="tel"
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.phone_number}
            onChange={(e) => set("phone_number", e.target.value)}
            placeholder="e.g. 123-456-7890"
            required
          />
        </Field>

        <Field label="Password">
          <input
            type="password"
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            required
          />
        </Field>

        <Field label="Confirm Password">
          <input
            type="password"
            className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none focus:border-yellow-400"
            value={form.confirm}
            onChange={(e) => set("confirm", e.target.value)}
            required
          />
        </Field>

        {msg && (
          <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {msg}
          </div>
        )}

        <button
          type="submit"
          className="mt-2 h-11 rounded-xl bg-yellow-400 px-5 text-sm font-semibold text-zinc-900 hover:bg-yellow-500"
        >
          Create account
        </button>

        <p className="text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            to="/signin"
            className="font-semibold text-yellow-600 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm text-zinc-600">{label}</span>
      {children}
    </label>
  );
}
