import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchListings } from "../utils/api.js";
import { getDirectImageUrl } from "../utils/imageUrl.js";

export default function Browse() {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const bodyTypeFromUrl = searchParams.get("body") || "";
    if (bodyTypeFromUrl !== selectedBodyType) {
      setSelectedBodyType(bodyTypeFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    loadListings();
  }, [selectedBodyType, sortBy]);

  async function loadListings() {
    setLoading(true);
    setMsg("");
    try {
      const params = {};
      if (selectedBodyType) params.body = selectedBodyType;
      if (sortBy) params.sortBy = sortBy;

      const data = await fetchListings(params);
      setListings(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
        setMsg("Cannot connect to server. Please make sure the backend is running on port 4000.");
      } else {
        setMsg(err.message || "Error loading listings");
      }
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  const bodyTypes = [
    { label: "All", value: "" },
    { label: "Sedan", value: "Sedan" },
    { label: "SUV", value: "SUV" },
    { label: "Truck", value: "Truck" },
    { label: "Coupe", value: "Coupe" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">Browse Cars</h1>

        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Filter by Body Type
            </label>
            <div className="flex flex-wrap gap-3">
              {bodyTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedBodyType(type.value)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedBodyType === type.value
                      ? "bg-yellow-400 text-zinc-900 shadow-md"
                      : "bg-white text-zinc-700 hover:bg-zinc-100 shadow-sm"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">
              Sort by Price
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 shadow-sm hover:border-zinc-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            >
              <option value="newest">Newest First</option>
              <option value="price_high">Highest Price</option>
              <option value="price_low">Lowest Price</option>
            </select>
          </div>
        </div>

        {msg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {msg}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-zinc-600">Loading...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-600">
              {msg ? msg : "No listings found. Try adding a listing from the Sell page."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const listingId = listing.listing_id || listing.id;
              return (
                <Link
                  key={listingId}
                  to={`/listing/${listingId}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
                >
                  <div className="aspect-video bg-zinc-200">
                    {listing.main_photo_url ? (
                      <img
                        src={getDirectImageUrl(listing.main_photo_url) || listing.main_photo_url}
                        alt={`${listing.make || ""} ${listing.model || ""}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="w-full h-full flex items-center justify-center text-zinc-400" style={{ display: listing.main_photo_url ? 'none' : 'flex' }}>
                      No Image
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-zinc-900">
                      {listing.year ? `${listing.year} ` : ""}{listing.make || ""} {listing.model || ""}
                    </h3>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                      ${listing.price ? listing.price.toLocaleString() : "N/A"}
                    </p>
                    <div className="mt-4 text-sm text-zinc-600 space-y-1">
                      <p>Mileage: {listing.mileage || listing.mileage_km || "N/A"} km</p>
                      <p>Body Type: {listing.body_type || listing.body_style || "N/A"}</p>
                      {listing.city && <p>Location: {listing.city}</p>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

