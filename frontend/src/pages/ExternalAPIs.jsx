import React, { useState } from "react";
import { fetchVINData } from "../utils/api.js";

export default function ExternalAPIs() {
  const [vin, setVin] = useState("");
  const [vinData, setVinData] = useState(null);
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState("");

  async function handleVINSubmit(e) {
    e.preventDefault();
    if (!vin.trim()) return;

    setVinLoading(true);
    setVinError("");
    setVinData(null);

    try {
      const data = await fetchVINData(vin);
      setVinData(data);
    } catch (err) {
      setVinError(err.message || "Failed to decode VIN");
    } finally {
      setVinLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">External API Integration</h1>
          <p className="text-zinc-600">
            Decode Vehicle Identification Numbers using NHTSA VIN Decoder API
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-zinc-900 mb-4">
            NHTSA VIN Decoder API
          </h2>
          <p className="text-sm text-zinc-600 mb-4">
            Decode Vehicle Identification Numbers to get car specifications. Results are saved to the database.
          </p>

          <form onSubmit={handleVINSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="Enter VIN (17 characters)"
                maxLength={17}
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 outline-none focus:border-yellow-400 font-mono"
              />
              <button
                type="submit"
                disabled={vinLoading || vin.length !== 17}
                className="px-6 py-2 bg-yellow-400 text-zinc-900 rounded-lg font-semibold hover:bg-yellow-500 disabled:opacity-60"
              >
                {vinLoading ? "Loading..." : "Decode"}
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Example: 1HGCM82633A004352
            </p>
          </form>

          {vinError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {vinError}
            </div>
          )}

          {vinData && (
            <div className="space-y-4">
              <div className="border border-zinc-200 rounded-lg p-4">
                <h3 className="font-semibold text-zinc-900 mb-2">Decoded Vehicle Data</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-zinc-600">VIN:</span>{" "}
                    <span className="font-mono font-medium">{vinData.data?.vin}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Make:</span>{" "}
                    <span className="font-medium">{vinData.data?.make || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Model:</span>{" "}
                    <span className="font-medium">{vinData.data?.model || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Year:</span>{" "}
                    <span className="font-medium">{vinData.data?.year || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Body Class:</span>{" "}
                    <span className="font-medium">{vinData.data?.bodyClass || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Engine:</span>{" "}
                    <span className="font-medium">
                      {vinData.data?.engineCylinders || "N/A"} cylinders
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Fuel Type:</span>{" "}
                    <span className="font-medium">{vinData.data?.fuelType || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-zinc-600">Manufacturer:</span>{" "}
                    <span className="font-medium">{vinData.data?.manufacturer || "N/A"}</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  Source: {vinData.source}
                </p>
              </div>

              {vinData.recentLookups && vinData.recentLookups.length > 0 && (
                <div className="border border-zinc-200 rounded-lg p-4">
                  <h3 className="font-semibold text-zinc-900 mb-2">
                    Recent Lookups ({vinData.recentLookups.length})
                  </h3>
                  <div className="space-y-2">
                    {vinData.recentLookups.map((lookup, idx) => (
                      <div
                        key={idx}
                        className="text-xs bg-zinc-50 p-2 rounded border border-zinc-100"
                      >
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {lookup.make} {lookup.model} ({lookup.year})
                          </span>
                          <span className="text-zinc-500">
                            {new Date(lookup.fetched_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Database Integration</h3>
            <p className="text-sm text-blue-800">
              VIN Decoder API automatically saves results to the <code className="bg-blue-100 px-1 rounded">vin_lookups</code> table.
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Each API call includes at least 2 database queries: INSERT (save new data) and SELECT (retrieve history)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
