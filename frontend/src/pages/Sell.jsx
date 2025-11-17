// src/pages/Sell.jsx
import React, { useState, useMemo } from "react";
import { BRANDS, MODELS_BY_BRAND, BODY_STYLES } from "../data/brands.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Sell() {
  const { user } = useAuth(); // to show a small note if not logged in

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    vin: "",
    body_type: "",
    price: "",
    color: "",
    description: "",
    damage: "",
    replacement: "",
    payments: "",
    sellTime: "",
    status: "available",
  });

  const [step, setStep] = useState(2); // mimic “Step 2 of 4” UI
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const models = useMemo(
    () => (form.brand ? MODELS_BY_BRAND[form.brand] || [] : []),
    [form.brand]
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess("");
    setError("");

    // Simple required field check (frontend)
    if (!form.brand || !form.model || !form.year || !form.mileage || !form.body_type || !form.price) {
      setError("Please fill in all required fields (marked with *).");
      return;
    }

    if (!user) {
      setError("You must be logged in to create a listing.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        // backend expects: make, model, year, price, mileage, body_type, vin, description, status
        make: form.brand,
        model: form.model,
        year: Number(form.year),
        price: Number(form.price),
        mileage: Number(form.mileage),
        body_type: form.body_type,
        vin: form.vin || "",
        description:
          form.description ||
          `Colour: ${form.color || "N/A"}. Damage: ${form.damage || "N/A"}. Replacement interest: ${
            form.replacement || "N/A"
          }. Payments: ${form.payments || "N/A"}. Sell timeframe: ${form.sellTime || "N/A"}.`,
        status: form.status || "available",
      };

      const res = await fetch("http://localhost:4000/api/listings", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || `Failed to create listing (${res.status})`);
      }

      const data = await res.json();
      setSuccess(`Listing created successfully (ID: ${data.id})`);
      setError("");

      // Optional: reset the form a bit
      setForm((f) => ({
        ...f,
        model: "",
        year: "",
        mileage: "",
        vin: "",
        body_type: "",
        price: "",
        description: "",
      }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong while creating the listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-12">
        {/* ----- Header ----- */}
        <div className="text-center mb-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
            alt="CarMarket logo"
            className="mx-auto h-12 w-12 mb-2 animate-bounce"
          />
          <h1 className="text-3xl font-extrabold tracking-tight">
            Tell us about the car
          </h1>
          <p className="mt-2 text-zinc-600 text-sm">
            We’ll use your answers to create a listing and help match you with local buyers.
          </p>
          <div className="mt-4">
            <div className="h-2 w-full bg-zinc-200 rounded-full">
              <div
                className="h-2 bg-yellow-400 rounded-full transition-all duration-500"
                style={{ width: `${(step / 4) * 100}%` }}
              ></div>
            </div>
            <p className="text-xs text-zinc-500 mt-1">Step {step} of 4</p>
          </div>

          {!user && (
            <p className="mt-3 text-xs text-red-600">
              You are not logged in. Please log in before submitting your car for sale.
            </p>
          )}
        </div>

        {/* Status messages */}
        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ----- Card ----- */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md ring-1 ring-zinc-100 p-6 space-y-8"
        >
          {/* Essential details */}
          <section>
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Essential details
              <span className="text-xs text-red-500 font-medium">Required</span>
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Make*
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                >
                  <option value="">Select</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                Model*
                <select
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  disabled={!form.brand}
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400 disabled:bg-zinc-100"
                >
                  <option value="">Select</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                Year*
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Mileage (km)*
                <input
                  name="mileage"
                  value={form.mileage}
                  onChange={handleChange}
                  placeholder="e.g. 100000"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Price (CAD)*
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 18999"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                VIN*
                <input
                  name="vin"
                  value={form.vin}
                  onChange={handleChange}
                  placeholder="1HGCM82633A004352"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>
            </div>
          </section>

          {/* Body type & colour */}
          <section>
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Body & Exterior
              <span className="text-xs text-red-500 font-medium">Required</span>
            </h2>

            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Body Style*
                <select
                  name="body_type"
                  value={form.body_type}
                  onChange={handleChange}
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                >
                  <option value="">Select</option>
                  {BODY_STYLES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                Exterior colour
                <input
                  name="color"
                  value={form.color}
                  onChange={handleChange}
                  placeholder="e.g. Blue Metallic"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>
            </div>
          </section>

          {/* Description */}
          <section>
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Description
              <span className="text-xs text-zinc-500 font-medium">Optional</span>
            </h2>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell buyers what makes your car special (condition, recent work, reasons for selling)…"
              rows={4}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
          </section>

          {/* Additional questions */}
          <section>
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Additional Questions
              <span className="text-xs text-red-500 font-medium">Required</span>
            </h2>

            <div className="mt-4 space-y-6">
              {[
                {
                  key: "damage",
                  q: "Any major vehicle or damage issues?",
                },
                {
                  key: "replacement",
                  q: "Are you interested in buying a replacement?",
                },
                {
                  key: "payments",
                  q: "Are you still making payments?",
                },
              ].map(({ key, q }) => (
                <YesNo
                  key={key}
                  name={key}
                  label={q}
                  form={form}
                  setForm={setForm}
                />
              ))}

              <WhenToSell form={form} setForm={setForm} />
            </div>
          </section>

          {/* Status (for backend) */}
          <section>
            <h2 className="font-semibold text-lg flex items-center justify-between">
              Listing Status
              <span className="text-xs text-zinc-500 font-medium">For backend</span>
            </h2>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-2 w-full rounded-md border border-zinc-300 px-2 py-2 text-sm outline-none focus:border-yellow-400"
            >
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
            </select>
          </section>

          {/* Car photo upload (frontend only) */}
          <section>
            <h2 className="font-semibold text-lg">Upload Photos</h2>
            <p className="text-sm text-zinc-600 mb-3">
              Add up to 5 photos to attract more buyers. (Demo only – not sent to backend.)
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              className="block w-full text-sm text-zinc-700 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-yellow-400 file:text-zinc-900 hover:file:bg-yellow-500"
            />
          </section>

          {/* Submit button */}
          <div className="pt-6 text-right">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-2 font-semibold text-zinc-900 hover:bg-yellow-500 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Create listing →"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

/* ---------------------------- Small helpers ---------------------------- */
function YesNo({ name, label, form, setForm }) {
  return (
    <div>
      <p className="font-medium text-sm mb-2">{label}</p>
      <div className="flex gap-3">
        {["Yes", "No"].map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setForm({ ...form, [name]: v })}
            className={`flex-1 h-10 rounded-md border text-sm font-semibold transition ${
              form[name] === v
                ? "bg-yellow-400 border-yellow-400 text-zinc-900"
                : "border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

function WhenToSell({ form, setForm }) {
  const options = ["Ready now", "1–6 months", "6+ months"];
  return (
    <div>
      <p className="font-medium text-sm mb-2">
        When do you plan to sell your vehicle?
      </p>
      <div className="flex gap-3 flex-wrap">
        {options.map((o) => (
          <button
            key={o}
            type="button"
            onClick={() => setForm({ ...form, sellTime: o })}
            className={`flex-1 min-w-[120px] h-10 rounded-md border text-sm font-semibold transition ${
              form.sellTime === o
                ? "bg-yellow-400 border-yellow-400 text-zinc-900"
                : "border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
