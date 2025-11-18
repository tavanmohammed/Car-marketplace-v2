const API_BASE = "http://localhost:4000";

async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  
  const config = {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);

    if (!res.ok) {
      let errorMessage = `Request failed (${res.status})`;
      try {
        const data = await res.json();
        if (data?.error) errorMessage = data.error;
        else if (data?.message) errorMessage = data.message;
        else if (data?.details) errorMessage = Array.isArray(data.details) ? data.details.join(", ") : data.details;
      } catch (_) {}
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
      throw new Error("Cannot connect to server. Please make sure the backend is running on port 4000.");
    }
    throw err;
  }
}

export async function createListing(listingData) {
  return apiRequest("/api/listings", {
    method: "POST",
    body: listingData,
  });
}

export async function fetchListing(id) {
  try {
    return await apiRequest(`/api/listings/${id}`);
  } catch (err) {
    if (err.message.includes("404") || err.message.includes("not found")) {
      throw new Error("Listing not found");
    }
    throw err;
  }
}

export async function fetchListings(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/api/listings?${queryString}` : "/api/listings";
  return apiRequest(endpoint);
}

export async function fetchPriceRanges() {
  return apiRequest("/api/stats/price-ranges");
}

export async function fetchListingsByBrand() {
  return apiRequest("/api/stats/listings-by-brand");
}

export async function fetchVINData(vin) {
  return apiRequest(`/api/external/car-data/${encodeURIComponent(vin)}`);
}
