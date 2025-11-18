import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchListing } from "../utils/api.js";
import { getDirectImageUrl } from "../utils/imageUrl.js";

export default function CarDetail() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCar() {
      if (!id) return;
      
      try {
        setLoading(true);
        setError("");
        const data = await fetchListing(id);
        setCar(data);
      } catch (e) {
        setError(e.message || "Unable to load listing");
      } finally {
        setLoading(false);
      }
    }
    
    loadCar();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-zinc-600 text-lg">Loading car details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-600 text-lg mb-4">{error || "Listing not found."}</p>
            <Link
              to="/browse"
              className="text-yellow-600 hover:text-yellow-700 font-medium"
            >
              ← Back to Browse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = `${car.year || ""} ${car.make || ""} ${car.model || ""}`.trim();
  const price = car.price ? parseFloat(car.price) : 0;
  const mileage = car.mileage || 0;

  return (
    <div className="h-screen bg-zinc-50 flex flex-col overflow-hidden">
      <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 flex-1 flex flex-col py-4">
        <Link
          to="/browse"
          className="inline-flex items-center text-xs text-zinc-600 hover:text-zinc-900 mb-3"
        >
          <span className="mr-1">←</span> Back
        </Link>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex-1 flex">
          <div className="grid md:grid-cols-2 gap-6 p-6 w-full">
            <div className="flex items-center justify-center">
              <div className="w-full h-full max-h-[calc(100vh-8rem)] aspect-[4/3] bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg overflow-hidden flex items-center justify-center">
                {car.main_photo_url ? (
                  <img
                    src={getDirectImageUrl(car.main_photo_url) || car.main_photo_url}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="text-center text-zinc-400" style={{ display: car.main_photo_url ? 'none' : 'flex', flexDirection: 'column' }}>
                  <svg
                    className="w-16 h-16 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm font-medium">No Image</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center overflow-y-auto">
              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 mb-2">
                  {title}
                </h1>
                <p className="text-2xl font-extrabold text-yellow-600">
                  ${price.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <SpecCard label="Body Type" value={car.body_type || "N/A"} />
                <SpecCard label="Mileage" value={`${mileage.toLocaleString()} km`} />
                <SpecCard label="Year" value={car.year || "N/A"} />
                {car.vin && <SpecCard label="VIN" value={car.vin} />}
              </div>

              {car.description && (
                <div className="mb-4 flex-1 min-h-0">
                  <h2 className="text-lg font-bold text-zinc-900 mb-2">Description</h2>
                  <div className="overflow-y-auto max-h-32">
                    <p className="text-sm text-zinc-700 whitespace-pre-line leading-relaxed">
                      {car.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-zinc-200 pt-3">
                <div className="text-xs text-zinc-600 space-y-1">
                  <p>
                    <span className="font-semibold">ID:</span> {car.id || car.listing_id}
                  </p>
                  {car.created_at && (
                    <p>
                      <span className="font-semibold">Listed:</span>{" "}
                      {new Date(car.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecCard({ label, value }) {
  return (
    <div className="bg-zinc-50 rounded-lg p-3 border border-zinc-200">
      <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1 font-semibold">
        {label}
      </div>
      <div className="text-base font-bold text-zinc-900">{value}</div>
    </div>
  );
}

