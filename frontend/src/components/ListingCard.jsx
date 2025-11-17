// src/components/ListingCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function ListingCard({ listing }) {
  const {
    listing_id,
    id,
    _id,
    year,
    make,
    model,
    price,
    city,
    province,
    mileage_km,
    mileage,
    main_photo_url,
    imageUrl,
    image,
    photo_url,
  } = listing;

  // Use whichever image field exists, with a safe fallback
  const imageSrc =
    main_photo_url ||
    imageUrl ||
    image ||
    photo_url ||
    "/images/placeholder.jpg";

  // Fallback id if listing_id is missing
  const cardId = listing_id || id || _id;

  return (
    <Link
      to={`/listing/${cardId}`}
      className="block rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition"
    >
      <div className="aspect-[4/3] overflow-hidden bg-zinc-100">
        <img
          src={imageSrc}
          alt={`${year ?? ""} ${make ?? ""} ${model ?? ""}`}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold">
          {year} {make} {model}
        </h3>
        <p className="mt-1 text-lg font-bold">
          {price != null ? `$${Number(price).toLocaleString()}` : "Price on request"}
        </p>
        <p className="mt-1 text-xs text-zinc-600">
          {Number(mileage_km ?? mileage ?? 0).toLocaleString()} km
          {city || province ? ` • ${city ?? ""}${city && province ? ", " : ""}${province ?? ""}` : ""}
        </p>
      </div>
    </Link>
  );
}

