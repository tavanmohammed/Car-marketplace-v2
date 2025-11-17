// src/lib/dataSource.js
// One place that decides WHERE listings come from:
// - JSON file (public/listings.json)
// - or SQL backend API (GET /api/listings)

const MODE = import.meta.env.VITE_API_MODE || "json";       // "json" or "api"
const API  = import.meta.env.VITE_API_URL  || "http://localhost:4000";

/**
 * Main function all pages will use to load listings.
 * Works for both JSON mode and API (SQL) mode.
 */
export async function fetchListings(query = {}) {
  // -------------------------------
  // 🔵 MODE 1: API MODE (SQL backend)
  // -------------------------------
  if (MODE === "api") {
    const sp = new URLSearchParams();

    // attach query params (brand, model, priceMin, etc.)
    Object.entries(query).forEach(([k, v]) => {
      if (v !== "" && v !== undefined && v !== null) {
        sp.set(k, String(v));
      }
    });

    // force used cars
    sp.set("condition", "Used");

    const res = await fetch(`${API}/api/listings?${sp.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return await res.json(); // backend will return { data, total, page, limit }
  }

  // -------------------------------
  // 🟨 MODE 2: JSON MODE (NOW)
  // -------------------------------

  // 1. Load /public/listings.json
  const res = await fetch("/listings.json", {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("Could not load listings.json");

  const raw = await res.json();
  const seed = Array.isArray(raw) ? raw : [];

  // 2. Load user-added listings from localStorage (Sell page)
  const local = JSON.parse(localStorage.getItem("cm_user_listings") || "[]");

  // merge local listings + JSON seed
  let rows = [...local, ...seed];

  // force only used cars
  rows = rows.filter(x => (x.condition || "Used") === "Used");

  const {
    q, brand, model, body,
    priceMin, priceMax,
    yearMin, yearMax,
    kmMax,
    sort = "deal",
    page = 1,
    limit = 12,
  } = query;

  // 3. FILTERING
  if (brand)  rows = rows.filter(x => x.brand?.toLowerCase() === brand.toLowerCase());
  if (model)  rows = rows.filter(x => x.model?.toLowerCase() === model.toLowerCase());
  if (body)   rows = rows.filter(x => x.body?.toLowerCase() === body.toLowerCase());

  if (priceMin) rows = rows.filter(x => Number(x.price) >= Number(priceMin));
  if (priceMax) rows = rows.filter(x => Number(x.price) <= Number(priceMax));
  if (yearMin)  rows = rows.filter(x => Number(x.year)  >= Number(yearMin));
  if (yearMax)  rows = rows.filter(x => Number(x.year)  <= Number(yearMax));
  if (kmMax)    rows = rows.filter(x => Number(x.km)    <= Number(kmMax));

  if (q) {
    const s = q.toLowerCase();
    rows = rows.filter(x =>
      `${x.title} ${x.brand} ${x.model} ${x.body} ${x.city}`
        .toLowerCase()
        .includes(s)
    );
  }

  // 4. SORTING
  const scoreDeal = x =>
    (Number(x.year) - 2010) * 2 -
    Number(x.price) / 1000 -
    Number(x.km) / 10000;

  switch (sort) {
    case "priceAsc":  rows.sort((a, b) => a.price - b.price); break;
    case "priceDesc": rows.sort((a, b) => b.price - a.price); break;
    case "yearDesc":  rows.sort((a, b) => b.year  - a.year);  break;
    case "kmAsc":     rows.sort((a, b) => a.km    - b.km);    break;
    default:          rows.sort((a, b) => scoreDeal(b) - scoreDeal(a));
  }

  // 5. PAGINATION
  const total = rows.length;
  const start = (Number(page) - 1) * Number(limit);
  const data = rows.slice(start, start + Number(limit));

  return { data, total, page: Number(page), limit: Number(limit) };
}
