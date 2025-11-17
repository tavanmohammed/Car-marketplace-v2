// src/pages/Listings.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useListings } from "../hooks/useListings.js";
import ListingCard from "../components/ListingCard.jsx";


/* ---------- helpers ---------- */
const cad = (n) =>
  Number(n).toLocaleString(undefined, {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });

// id will come from backend as listing_id AS id, but fall back just in case
const idOf = (car) => car.listing_id;

// Title based on your real DB fields
const titleOf = (car) =>
  car.title || `${car.year ?? ""} ${car.make ?? ""} ${car.model ?? ""}`.trim();

// No images in DB → placeholder is fine
const imgOf = (car) => car.imageUrl || car.image || "/images/placeholder.jpg";

export default function Listings() {
  const [sp, setSp] = useSearchParams();

  // URL → query object
  const query = useMemo(
    () => ({
      q: sp.get("q") || "",
      brand: sp.get("brand") || "",
      model: sp.get("model") || "",
      body: sp.get("body") || "",
      priceMin: sp.get("priceMin") || "",
      priceMax: sp.get("priceMax") || "",
      yearMin: sp.get("yearMin") || "",
      yearMax: sp.get("yearMax") || "",
      kmMax: sp.get("kmMax") || "",
      sort: sp.get("sort") || "deal",
      page: Number(sp.get("page") || 1),
      limit: Number(sp.get("limit") || 12),
    }),
    [sp]
  );

  // controlled inputs for the toolbar
  const [q, setQ] = useState(query.q);
  const [brand, setBrand] = useState(query.brand); // brand will map to make on backend
  const [model, setModel] = useState(query.model);
  const [body, setBody] = useState(query.body); // body will map to body_type
  const [priceMin, setPriceMin] = useState(query.priceMin);
  const [priceMax, setPriceMax] = useState(query.priceMax);
  const [sort, setSort] = useState(query.sort);

  // keep inputs synced when URL changes elsewhere
  useEffect(() => {
    setQ(query.q);
    setBrand(query.brand);
    setModel(query.model);
    setBody(query.body);
    setPriceMin(query.priceMin);
    setPriceMax(query.priceMax);
    setSort(query.sort);
  }, [query]);

  const { rows, total, loading, err } = useListings(query);
  const totalPages = Math.max(1, Math.ceil(total / query.limit));

  function updateParams(next) {
    const nextSp = new URLSearchParams(sp);
    Object.entries(next).forEach(([k, v]) => {
      if (v === "" || v === undefined || v === null) nextSp.delete(k);
      else nextSp.set(k, String(v));
    });
    setSp(nextSp, { replace: false });
  }

  function applyFilters(e) {
    e?.preventDefault?.();
    updateParams({ q, brand, model, body, priceMin, priceMax, sort, page: 1 });
  }

  function clearFilters() {
    setQ("");
    setBrand("");
    setModel("");
    setBody("");
    setPriceMin("");
    setPriceMax("");
    updateParams({
      q: "",
      brand: "",
      model: "",
      body: "",
      priceMin: "",
      priceMax: "",
      page: 1,
    });
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900 pt-20">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header + sort */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Used Cars for Sale</h1>
            <div className="text-sm text-zinc-600">
              {loading ? "Loading…" : `${total} results`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-zinc-600">Sort:</label>
            <select
              className="h-10 rounded-lg border border-zinc-200 px-3 outline-none"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                updateParams({ sort: e.target.value, page: 1 });
              }}
            >
              <option value="deal">Best deals first</option>
              <option value="priceAsc">Lowest price</option>
              <option value="priceDesc">Highest price</option>
              <option value="yearDesc">Newest year</option>
              <option value="kmAsc">Lowest kilometres</option>
            </select>
          </div>
        </div>

        {/* Filters toolbar */}
        <form
          onSubmit={applyFilters}
          className="mt-5 grid gap-3 rounded-2xl border border-zinc-200 p-3"
        >
          <div className="grid gap-3 md:grid-cols-6">
            <Input
              placeholder="Search make, model…"
              value={q}
              onChange={setQ}
            />
            {/* brand input actually filters by make in backend */}
            <Input
              placeholder="Make (e.g., Honda)"
              value={brand}
              onChange={setBrand}
            />
            <Input
              placeholder="Model (e.g., Civic)"
              value={model}
              onChange={setModel}
            />
            <Select
              value={body}
              onChange={setBody}
              options={[
                ["", "All body types"],
                ["Sedan", "Sedan"],
                ["SUV", "SUV"],
                ["Hatchback", "Hatchback"],
                ["Coupe", "Coupe"],
                ["Convertible", "Convertible"],
                ["Wagon", "Wagon"],
                ["Pickup Truck", "Pickup Truck"],
                ["Minivan", "Minivan"],
                ["Van", "Van"],
                ["Crossover", "Crossover"],
                ["Sports Car", "Sports Car"],
                ["Luxury Car", "Luxury Car"],
              ]}
            />
            <Input
              type="number"
              placeholder="Min $"
              value={priceMin}
              onChange={setPriceMin}
            />
            <Input
              type="number"
              placeholder="Max $"
              value={priceMax}
              onChange={setPriceMax}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-lg border px-4 text-sm"
            >
              Clear
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </div>
        </form>

        {/* Error */}
        {err && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        )}

        {/* Loading */}
        {loading && <GridSkeleton />}

        {/* Empty */}
        {!loading && rows.length === 0 && (
          <div className="mt-8 rounded-3xl border border-dashed border-zinc-200 p-10 text-center">
            <h3 className="text-lg font-semibold">No results found</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Try different filters or adjust the price range.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 h-10 rounded-lg bg-black px-4 text-sm font-semibold text-white"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && rows.length > 0 && (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((car) => (
  <Link
     key={idOf(car)}
          to={`/listing/${idOf(car)}`}        
          className="group overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md"
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-zinc-100">
            <img
              src={imgOf(car)}
              alt={titleOf(car)}
              className="h-full w-full object-cover transition group-hover:scale-[1.02]"
            />
          </div>
          <div className="space-y-1.5 p-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold leading-snug">
                {titleOf(car)}
              </h3>
              <div className="whitespace-nowrap text-base font-extrabold">
                {cad(car.price)}
              </div>
            </div>
            <div className="text-sm text-zinc-600">
              {car.year} ·{" "}
              {Number(car.mileage ?? 0).toLocaleString()} km ·{" "}
              {car.body_type}
            </div>
            <div className="text-sm text-zinc-500">
              {car.city || car.location || ""}
      </div>
    </div>
  </Link>
))}

            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:opacity-50"
                onClick={() =>
                  updateParams({ page: Math.max(1, query.page - 1) })
                }
                disabled={query.page <= 1}
              >
                Prev
              </button>
              <div className="text-sm text-zinc-600">
                Page <span className="font-semibold">{query.page}</span> of{" "}
                {totalPages}
              </div>
              <button
                className="rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:opacity-50"
                onClick={() =>
                  updateParams({ page: Math.min(totalPages, query.page + 1) })
                }
                disabled={query.page >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

/* ---------- tiny UI components ---------- */
function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      className="h-10 w-full rounded-lg border border-zinc-200 px-3 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      className="h-10 w-full rounded-lg border border-zinc-200 px-3 outline-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map(([v, label]) => (
        <option key={label} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-3xl border border-zinc-200"
        >
          <div className="aspect-[4/3] w-full bg-zinc-100" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-2/3 rounded bg-zinc-100" />
            <div className="h-4 w-1/3 rounded bg-zinc-100" />
            <div className="h-4 w-1/2 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
