import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function SignIn() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const redirectTo = new URLSearchParams(loc.search).get("next") || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setMsg("");
    try {
      await login({ email: form.email, password: form.password });
      nav(redirectTo, { replace: true });
    } catch (err) {
      setMsg(err.message || "Login failed.");
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600">Welcome back! Access your saved cars and listings.</p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-4">
        <Field label="Email">
          <input type="email" className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none" value={form.email} onChange={e=>set("email", e.target.value)} />
        </Field>
        <Field label="Password">
          <input type="password" className="h-11 w-full rounded-xl border border-zinc-200 px-3 outline-none" value={form.password} onChange={e=>set("password", e.target.value)} />
        </Field>

        {msg && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</div>}

        <button className="mt-2 h-11 rounded-xl bg-yellow-400 px-5 text-sm font-semibold text-zinc-900 hover:bg-yellow-500">
          Sign in
        </button>

        <p className="text-sm text-zinc-600">
          No account yet?{" "}
          <Link to="/signup" className="font-semibold text-yellow-600 hover:underline">Create one</Link>
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
