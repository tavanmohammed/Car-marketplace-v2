
// src/pages/Buy.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BRANDS, MODELS_BY_BRAND, BODY_STYLES } from "../data/brands.js";

/* Canadian postal code: A1A 1A1 (space optional) */
const CA_POSTAL_RE =
  /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z][ ]?\d[ABCEGHJ-NPRSTV-Z]\d$/i;

function normalizePostal(v = "") {
  const up = v.toUpperCase().replace(/\s+/g, "");
  if (up.length <= 3) return up;
  return `${up.slice(0, 3)} ${up.slice(3, 6)}`;
}

export default function Buy() {
  const navigate = useNavigate();

  const [postal, setPostal] = useState("");
  const [radius, setRadius] = useState("250");

  const [brand, setBrand] = useState(""); // maps to "make" in backend
  const [model, setModel] = useState("");
  const [body, setBody] = useState(""); // maps to body_type
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [touched, setTouched] = useState(false);

  const models = useMemo(
    () => (brand ? MODELS_BY_BRAND[brand] || [] : []),
    [brand]
  );

  const postalValid = CA_POSTAL_RE.test(postal.trim());
  const canSearch = postalValid; // required

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (!canSearch) return;

    // Build query params for /listings page
    const params = new URLSearchParams();

    if (brand) params.set("brand", brand); // Listings/useListings → backend maps to make
    if (model) params.set("model", model);
    if (body) params.set("body", body);
    if (priceMin) params.set("priceMin", priceMin);
    if (priceMax) params.set("priceMax", priceMax);

    // These are optional extras; Listings.jsx ignores them, but you can use later
    params.set("postal", postal.trim().toUpperCase());
    params.set("radius", radius);

    // Go to listings page with filters in the URL
    navigate(`/listings?${params.toString()}`);
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h1 className="text-3xl font-extrabold">Buy a Used Car</h1>
          <p className="text-sm text-zinc-600">
            Enter a valid Canadian postal code and filters to find your next
            car.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Filters */}
        <aside className="lg:col-span-4 xl:col-span-3">
          <form
            onSubmit={handleSubmit}
            className="space-y-4 lg:sticky lg:top-4"
          >
            {/* Location */}
            <section className="rounded-2xl border border-zinc-200 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
                Location
              </h2>

              <label className="block text-sm font-medium">
                Postal Code <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. M4B 1B3"
                value={postal}
                onChange={(e) => setPostal(normalizePostal(e.target.value))}
                onBlur={() => setTouched(true)}
                className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2
                  ${
                    touched && !postalValid
                      ? "border-red-500 ring-red-200"
                      : "border-zinc-300 focus:ring-black/10"
                  }`}
              />
              {touched && !postalValid && (
                <p className="mt-1 text-xs text-red-600">
                  Enter a valid Canadian postal code (e.g., M4B 1B3).
                </p>
              )}

              <label className="mt-4 block text-sm font-medium">Radius</label>
              <select
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="25">25 km</option>
                <option value="50">50 km</option>
                <option value="100">100 km</option>
                <option value="250">250 km</option>
              </select>
            </section>

            {/* Make & Model */}
            <section className="rounded-2xl border border-zinc-200 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
                Make &amp; Model
              </h2>

              <label className="block text-sm font-medium">Make</label>
              <select
                value={brand}
                onChange={(e) => {
                  setBrand(e.target.value);
                  setModel("");
                }}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">All makes</option>
                {BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>

              <label className="mt-4 block text-sm font-medium">Model</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!brand}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
              >
                <option value="">
                  {brand ? "All models" : "Select a make first"}
                </option>
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </section>

            {/* Body Style */}
            <section className="rounded-2xl border border-zinc-200 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
                Body Style
              </h2>
              <select
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
              >
                <option value="">Any</option>
                {BODY_STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </section>

            {/* Price */}
            <section className="rounded-2xl border border-zinc-200 p-4">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-600">
                Price
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Min $</label>
                  <input
                    type="number"
                    min="0"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Max $</label>
                  <input
                    type="number"
                    min="0"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSearch}
              title={!canSearch ? "Postal code is required" : ""}
              className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white
                ${
                  canSearch
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-zinc-300 cursor-not-allowed"
                }`}
            >
              Search cars
            </button>
          </form>
        </aside>

        {/* Right side helper text */}
        <main className="lg:col-span-8 xl:col-span-9">
          <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center">
            <h2 className="text-xl font-bold">
              Set your filters and start a search
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              When you submit the form, we’ll take you to the listings page and
              show cars that match your make, model, body style, and price
              range.
            </p>
            <p className="mt-4 text-xs text-zinc-500">
              Results are powered by your MySQL database via the backend
              <code className="ml-1 rounded bg-zinc-100 px-1 py-0.5">
                /api/listings
              </code>{" "}
              endpoint.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
