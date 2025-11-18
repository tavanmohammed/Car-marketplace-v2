const API_BASE = "http://localhost:4000";

export async function createListing(listingData) {
  const res = await fetch(`${API_BASE}/api/listings`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(listingData),
  });

  if (!res.ok) {
    let errorMessage = `Failed to create listing (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) errorMessage = data.message;
      if (data?.details) errorMessage = data.details.join(", ");
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return await res.json();
}

export async function fetchListing(id) {
  const res = await fetch(`${API_BASE}/api/listings/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Listing not found");
    }
    throw new Error("Failed to load listing");
  }

  return await res.json();
}

export async function fetchListings(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/listings?${queryString}`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to load listings");
  }

  return await res.json();
}
