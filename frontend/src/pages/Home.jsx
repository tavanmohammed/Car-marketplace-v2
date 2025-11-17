 // src/pages/Home.jsx
// React + Tailwind (JavaScript). Mobile-first homepage (USED CARS ONLY)

import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CONDITIONS, ALL_BRANDS, CAR_MODELS } from "../data/brands.js";

/* ---------- LOCAL IMAGES (must exist under src/assets/) ---------- */
import heroImg from "../assets/hero.jpg";
import suvImg from "../assets/suv.jpg";
import sedanImg from "../assets/sedan.png";
import pickupImg from "../assets/pickup.jpg";
import coupeImg from "../assets/coupes.webp";
import WagonImg from "../assets/wagon.jpg";
import HatchbackImg from "../assets/hatchback.jpg";
/* Brand images for Explore section */
import acuraLogo from "../assets/acura.jpg";
import bmwLogo from "../assets/bmw.jpg";
import chevyLogo from "../assets/chevrolet.avif";
import fordLogo from "../assets/ford.avif";

/* --------------------------- Small utilities --------------------------- */
const cx = (...a) => a.filter(Boolean).join(" ");
const ONLY_USED = "Used"; // enforce everywhere

function Section({ className = "", children }) {
  return <section className={cx("py-12", className)}>{children}</section>;
}
function SectionTitle({ className = "", children }) {
  return <h2 className={cx("text-2xl md:text-3xl font-extrabold tracking-tight", className)}>{children}</h2>;
}

/* --------------------------------- HERO --------------------------------- */
function Hero() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("buy");
  const [brand, setBrand] = useState(ALL_BRANDS?.[0] || "All Brands");
  const [model, setModel] = useState("");
  const [postal, setPostal] = useState("");

  const modelsForBrand = useMemo(
    () => (brand !== "All Brands" ? CAR_MODELS?.[brand] || [] : []),
    [brand]
  );

  function onSearch(e) {
    e.preventDefault();
    const q = new URLSearchParams();
    q.set("mode", mode);
    q.set("condition", ONLY_USED);                 // force Used
    if (brand && brand !== "All Brands") q.set("brand", brand);
    if (model) q.set("model", model);
    if (postal.trim()) q.set("postal", postal.trim());
    navigate(`/buy?${q.toString()}`);
  }

  return (
    <div className="relative overflow-hidden min-h-[560px]">
      {/* bg */}
      <img src={heroImg} alt="Cars showroom" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/40" />

      {/* content */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-20 pb-16 text-white">
        <p className="inline-block rounded-full bg-yellow-400/90 px-3 py-1 text-xs font-bold text-zinc-900">
          We sell only USED cars
        </p>
        <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold leading-tight">
          Canada’s trusted marketplace for <span className="text-yellow-300">used</span> cars
        </h1>
        <p className="mt-3 max-w-2xl text-white/90">
          Verified listings, transparent details, no login needed to browse.
        </p>

     

        {/* Search card */}
        <form onSubmit={onSearch} className="mt-8 rounded-2xl bg-white p-4 text-zinc-900 shadow-lg">
          <div className="grid items-center gap-3 sm:grid-cols-5">
            {/* Condition locked to Used */}
            <label className="flex h-12 items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3">
              <span className="text-sm text-zinc-500">Condition</span>
              <span className="rounded-md bg-yellow-100 px-2 py-1 text-sm font-semibold text-zinc-900">{ONLY_USED}</span>
              <Chevron />
            </label>

            <Select
              label="Brand"
              value={brand}
              onChange={(v) => {
                setBrand(v);
                setModel("");
              }}
            >
              {ALL_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </Select>

            <Select label="Model" value={model} onChange={setModel} disabled={brand === "All Brands"}>
              <option value="">{brand === "All Brands" ? "Choose brand first" : "All Models"}</option>
              {brand !== "All Brands" &&
                modelsForBrand.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </Select>

            <Field label="Postal code">
              <input
                className="h-11 w-full bg-transparent outline-none"
                placeholder="e.g. M4B 1B3"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
              />
            </Field>

            <button type="submit" className="h-12 rounded-xl bg-yellow-400 font-semibold text-zinc-900 hover:bg-yellow-500">
              Search
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <QuickLink to={`/buy?condition=${encodeURIComponent(ONLY_USED)}`}>Browse all used</QuickLink>
            <QuickLink to={`/buy?condition=${encodeURIComponent(ONLY_USED)}&deals=true`}>Used deals</QuickLink>
            <QuickLink to="/sell">Sell your car</QuickLink>
          </div>
        </form>
      </div>
    </div>
  );
}

/* --------------------------- Discover / Chips --------------------------- */
function DiscoverChips() {
  const chips = [
    "Fuel Efficient",
    "AWD Cars",
    "4x4 Trucks",
    "Small & Sporty",
    "Electric",
    "Reliable",
    "Under $15k",
    "Family SUVs",
  ];
  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle className="text-center">Discover your perfect used car</SectionTitle>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {chips.map((c) => (
            <Link
              key={c}
              to={`/buy?condition=${encodeURIComponent(ONLY_USED)}&tag=${encodeURIComponent(c)}`}
              className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:shadow"
            >
              {c}
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Body Type Grid --------------------------- */
/* Full set of common body types. We reuse existing images as safe fallbacks. */
function BodyTypeGrid() {
  const fallback = {
    SUV: suvImg,
    Sedan: sedanImg,
    Hatchback: HatchbackImg,
    Coupe: coupeImg,
    Wagon: WagonImg,
    "Pickup Truck": pickupImg,
   
  
  };

  const items = [
    "SUV",
    "Sedan",
    "Hatchback",
    "Coupe",
    "Wagon",
    "Pickup Truck",
   
  ].map((label) => ({ label, img: fallback[label] }));

  return (
    <Section className="bg-zinc-50">
      <div className="mx-auto max-w-6xl px-4">
        <h3 className="mb-6 text-center text-xl font-bold tracking-tight text-zinc-800">Browse used cars by body type</h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <Link
              to={`/buy?condition=${encodeURIComponent(ONLY_USED)}&body=${encodeURIComponent(it.label)}`}
              key={it.label}
              className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md"
            >
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <img src={it.img} alt={it.label} className="h-full w-full object-cover" />
              </div>
              <div className="mt-3 text-center text-base font-semibold">{it.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* --------------------------- Budget Estimator --------------------------- */
function BudgetEstimator() {
  const [down, setDown] = useState(2000);
  const [term, setTerm] = useState(60);
  const [monthly, setMonthly] = useState(400);
  const apr = 7.99;

  const estPrice = useMemo(() => Math.max(0, Math.round(down + monthly * term)), [down, monthly, term]);

  return (
    <Section className="bg-white">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-4 md:grid-cols-2 md:items-start">
        <div>
          <SectionTitle>Estimate your budget</SectionTitle>
          <p className="mt-3 max-w-md text-sm text-zinc-600">
            Enter your monthly budget and loan terms to estimate your buying power.
          </p>
          <Link
            to={`/buy?condition=${encodeURIComponent(ONLY_USED)}&budget=true`}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-yellow-400 px-5 text-sm font-semibold text-zinc-900 hover:bg-yellow-500"
          >
            Shop by budget
          </Link>
        </div>

        <div className="grid gap-4">
          <Input label="Est. down payment" value={down} onChange={(v) => setDown(+v)} prefix="$" type="number" />
          <SelectSimple
            label="Loan term"
            value={term}
            onChange={(v) => setTerm(+v)}
            options={[24, 36, 48, 60, 72].map((m) => ({ label: `${m} months`, value: m }))}
          />
          <Input label="Est. monthly payment" value={monthly} onChange={(v) => setMonthly(+v)} prefix="$" type="number" />
          <div className="mt-4 text-4xl font-extrabold tracking-tight">${estPrice.toLocaleString()}</div>
          <div className="text-sm text-zinc-500">with {apr}% APR</div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------ Popular Explore --------------------------- */
function PopularExplore() {
  const brands = [
    { name: "Acura", img: acuraLogo },
    { name: "BMW", img: bmwLogo },
    { name: "Chevrolet", img: chevyLogo },
    { name: "Ford", img: fordLogo },
  ];

  const tabs = {
    Toronto: ["Honda Civic", "Toyota RAV4", "Ford Mustang", "Hyundai Elantra"],
    Calgary: ["Ford F-150", "Jeep Wrangler", "Toyota Corolla", "Honda Accord"],
    Vancouver: ["BMW 3 Series", "Mercedes C-Class", "Toyota Camry", "Mazda CX-5"],
    Montreal: ["Mazda3", "Chevrolet Corvette", "Lexus RX", "Hyundai Tucson"],
  };
  const cities = Object.keys(tabs);
  const [city, setCity] = useState(cities[0]);

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle>Explore popular cars</SectionTitle>

        {/* Brand tiles with images */}
        <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
          {brands.map((b) => (
            <Link
              key={b.name}
              to={`/buy?condition=${encodeURIComponent(ONLY_USED)}&brand=${encodeURIComponent(b.name)}`}
              className="rounded-3xl bg-white p-4 text-center shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md"
            >
              <div className="mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl bg-zinc-50">
                <img src={b.img} alt={b.name} className="h-full w-full object-cover" />
              </div>
              <div className="mt-3 font-semibold">{b.name}</div>
            </Link>
          ))}
        </div>

        {/* By city */}
        <div className="mt-12">
          <h4 className="text-lg font-bold">By city</h4>
          <div className="mt-4 flex flex-wrap gap-4 border-b border-zinc-200 pb-2">
            {cities.map((c) => (
              <button
                key={c}
                onClick={() => setCity(c)}
                className={cx(
                  "-mb-[1px] border-b-2 pb-2 text-sm font-semibold",
                  city === c ? "border-yellow-400 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <ul className="mt-6 grid grid-cols-2 gap-y-2 sm:grid-cols-4">
            {tabs[city].map((t) => (
              <li key={t} className="text-sm font-medium text-zinc-700">
                <Link to={`/buy?condition=${encodeURIComponent(ONLY_USED)}&q=${encodeURIComponent(t)}`} className="hover:underline">
                  {t}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

/* ---------------------------------- Footer -------------------------------- */
function FooterLite() {
  return (
    <footer className="bg-zinc-900 py-10 text-zinc-200">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
        <div className="font-semibold">© {new Date().getFullYear()} CarMarket</div>
        <div className="flex items-center gap-4">
          <Link to="/privacy" className="hover:underline">Privacy</Link>
          <Link to="/terms" className="hover:underline">Terms</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
        </div>
      </div>
    </footer>
  );
}

/* ----------------------------- UI Controls ----------------------------- */
function Field({ label, children }) {
  return (
    <label className="flex h-12 items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <div className="flex-1">{children}</div>
      <Chevron />
    </label>
  );
}
function Select({ label, value, onChange, disabled, children }) {
  return (
    <label className="flex h-12 items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3">
      <span className="text-sm text-zinc-500">{label}</span>
      <select
        className="w-full appearance-none bg-transparent text-zinc-900 outline-none disabled:text-zinc-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {children}
      </select>
      <Chevron />
    </label>
  );
}
function Input({ label, value, onChange, type = "text", prefix }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-600">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3">
        {prefix ? <span className="text-zinc-400">{prefix}</span> : null}
        <input
          className="h-11 w-full bg-transparent outline-none"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type={type}
        />
      </div>
    </label>
  );
}
function SelectSimple({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm text-zinc-600">{label}</span>
      <select
        className="h-11 rounded-xl border border-zinc-200 bg-white px-3 outline-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
function QuickLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 rounded-md bg-zinc-50 px-2 py-1 text-zinc-700 hover:bg-zinc-100">
      <span>{children}</span>
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
        <path d="M7.5 5.5l5 4.5-5 4.5V5.5z" />
      </svg>
    </Link>
  );
}
function Chevron() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-zinc-400">
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.25 8.29a.75.75 0 01-.02-1.08z" />
    </svg>
  );
}

/* ---------------------------------- PAGE ---------------------------------- */
export default function Home() {
  return (
    <main className="min-h-dvh bg-white text-zinc-900">
      <Hero />
      <DiscoverChips />
      <BodyTypeGrid />
      <BudgetEstimator />
      <PopularExplore />
      <FooterLite />
    </main>
  );
}
