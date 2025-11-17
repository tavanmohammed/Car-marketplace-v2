
// src/pages/Ratings.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

/* ---------------- STAR COMPONENT ---------------- */
function Star({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
    >
      <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.785 1.401 8.164L12 18.896l-7.335 3.863 1.401-8.164L.132 9.21l8.2-1.192L12 .587z" />
    </svg>
  );
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className="text-yellow-500">
          <Star filled={value >= n} />
        </span>
      ))}
      <span className="ml-2 text-sm text-zinc-600">{value.toFixed(1)}</span>
    </div>
  );
}

/* --------------------- MAIN PAGE ---------------------- */
export default function Ratings() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [prov, setProv] = useState("ALL");
  const [sort, setSort] = useState("rating");

  /* -------- fetch REST / JSON data -------- */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API}/api/sellers/top`); // your REST endpoint
        const data = await res.json();
        setSellers(data);
      } catch (err) {
        console.error("Failed to fetch:", err);
      }
      setLoading(false);
    }
    load();
  }, []);

  /* -------- province dropdown -------- */
  const provinces = useMemo(() => {
    const set = new Set(sellers.map((s) => s.province));
    return ["ALL", ...Array.from(set)];
  }, [sellers]);

  /* -------- filtering + sorting -------- */
  const filtered = useMemo(() => {
    let rows = [...sellers];

    if (q) {
      const t = q.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(t) ||
          r.address.toLowerCase().includes(t) ||
          r.city.toLowerCase().includes(t)
      );
    }

    if (prov !== "ALL") rows = rows.filter((r) => r.province === prov);

    rows.sort((a, b) => {
      if (sort === "sales") return b.salesCount - a.salesCount;
      return b.rating - a.rating; // default sort: highest rating
    });

    return rows;
  }, [sellers, q, prov, sort]);

  if (loading) {
    return (
      <div className="text-center py-20 text-lg text-zinc-600">
        Loading top sellers…
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Highest-Rated Sellers</h1>
      <p className="text-zinc-600 mt-1 mb-6">
        Sorted by rating from real user reviews. Data loaded via REST JSON.
      </p>

      {/* ------ Filters ------ */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name, city, address…"
          className="w-full md:w-72 px-3 py-2 rounded-md border border-zinc-300"
        />

        <select
          value={prov}
          onChange={(e) => setProv(e.target.value)}
          className="px-3 py-2 rounded-md border border-zinc-300 bg-white"
        >
          {provinces.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-md border border-zinc-300 bg-white"
        >
          <option value="rating">Sort by Rating</option>
          <option value="sales">Sort by Sales</option>
        </select>
      </div>

      {/* ------ Seller Grid ------ */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((s) => (
          <div
            key={s.id}
            className="rounded-2xl border p-5 shadow-sm hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold">{s.name}</h2>
            <p className="text-sm text-zinc-600">{s.address}</p>
            <p className="text-sm text-zinc-600">
              {s.city}, {s.province}
            </p>

            <div className="mt-4">
              <StarRating value={s.rating} />
              <p className="text-sm text-zinc-600 mt-1">
                {s.salesCount} total sales
              </p>
            </div>

            <div className="mt-5 flex gap-2">
              <Link
                to={`/messages/${s.id}`}
                className="px-3 py-2 rounded-md bg-black text-white text-sm"
              >
                Message Seller
              </Link>
              <Link
                to={`/buy?seller=${s.id}`}
                className="px-3 py-2 rounded-md border border-zinc-300 text-sm"
              >
                View Listings
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* empty */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-zinc-600">
          No sellers match your search.
        </div>
      )}
    </div>
  );
}
