import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CarDetail() {
  const { id } = useParams();          // 👈 MUST be "id"
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    async function loadCar() {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/listings/${id}`);
        if (!res.ok) throw new Error("Failed to load listing");
        const data = await res.json();
        setCar(data);
      } catch (e) {
        setErr(e.message || "Unable to load listing");
      } finally {
        setLoading(false);
      }
    }
    if (id !== undefined) {
      loadCar();
    }
  }, [id]);

  // ...rest of the component





  async function handleSendMessage(e) {
    e.preventDefault();
    setSentMsg("");
    if (!message.trim()) return;

    // TODO: hook to real backend later (e.g. POST /api/messages)
    try {
      // Placeholder: simulate success
      // const res = await fetch("http://localhost:4000/api/messages", { ... });
      // if (!res.ok) throw new Error("Failed to send message");
      setSentMsg("Your message has been sent to the seller.");
      setMessage("");
    } catch (e) {
      setSentMsg(e.message || "Could not send message.");
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p>Loading car details...</p>
      </div>
    );
  }

  if (err || !car) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-600">{err || "Listing not found."}</p>
      </div>
    );
  }

  const {
    year,
    make,
    model,
    trim,
    price,
    city,
    province,
    mileage_km,
    fuel_type,
    transmission,
    body_style,
    exterior_color,
    interior_color,
    doors,
    seller_name,
  } = car;

  const title = `${year} ${make} ${model}${trim ? " " + trim : ""}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-[2fr,1fr]">
      {/* LEFT: photos + overview */}
      <div>
        {/* Main photo */}
        <div className="aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100">
          <img
            src={car.main_photo_url}
            alt={title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Title + price */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-sm text-zinc-600">
              {city}, {province}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold">
              ${price?.toLocaleString()}
            </div>
            {/* You can add "Great deal" logic later */}
          </div>
        </div>

        {/* Overview section */}
        <section className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
            {mileage_km != null && (
              <Spec label="Mileage" value={`${mileage_km.toLocaleString()} km`} />
            )}
            {fuel_type && <Spec label="Fuel" value={fuel_type} />}
            {transmission && <Spec label="Transmission" value={transmission} />}
            {body_style && <Spec label="Body style" value={body_style} />}
            {exterior_color && (
              <Spec label="Exterior" value={exterior_color} />
            )}
            {interior_color && (
              <Spec label="Interior" value={interior_color} />
            )}
            {doors && <Spec label="Doors" value={`${doors} doors`} />}
          </div>
        </section>

        {/* Description */}
        {car.description && (
          <section className="mt-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-sm text-zinc-700 whitespace-pre-line">
              {car.description}
            </p>
          </section>
        )}
      </div>

      {/* RIGHT: contact seller */}
      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">Request information</h2>
          <p className="text-xs text-zinc-600 mb-3">
            Message the seller about this {make} {model}.
          </p>

          {!isAuthed && (
            <p className="mb-3 text-xs text-red-600">
              Please sign in to contact the seller.
            </p>
          )}

          <form onSubmit={handleSendMessage} className="space-y-3">
            <div>
              <label className="block text-xs text-zinc-600 mb-1">
                Your name
              </label>
              <input
                disabled
                value={user?.username || user?.name || ""}
                className="h-9 w-full rounded-md border border-zinc-200 px-2 text-sm bg-zinc-50"
                placeholder="Sign in to auto-fill"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-600 mb-1">
                Your message
              </label>
              <textarea
                className="w-full min-h-[80px] rounded-md border border-zinc-200 px-2 py-1 text-sm outline-none"
                placeholder="Hi, I'm interested in this vehicle. Is it still available?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!isAuthed}
              />
            </div>
            {sentMsg && (
              <p className="text-xs text-green-700">{sentMsg}</p>
            )}
            <button
              type="submit"
              disabled={!isAuthed}
              className="w-full h-9 rounded-md bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-zinc-300"
            >
              Message seller
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4 text-sm text-zinc-700">
          <p>
            Seller:{" "}
            <span className="font-semibold">
              {seller_name || "Private seller"}
            </span>
          </p>
          {/* later: add seller rating, number of reviews, etc. */}
        </div>
      </aside>
    </div>
  );
}

function Spec({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="text-sm font-medium text-zinc-900">{value}</div>
    </div>
  );
}
