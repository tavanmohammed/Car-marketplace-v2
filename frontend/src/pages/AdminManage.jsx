import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchListings, updateListing, deleteListing } from "../utils/api.js";
import { getDirectImageUrl } from "../utils/imageUrl.js";

export default function AdminManage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load listings");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(listing) {
    setEditingId(listing.listing_id || listing.id);
    setEditForm({
      make: listing.make || "",
      model: listing.model || "",
      year: listing.year || "",
      price: listing.price || "",
      mileage: listing.mileage || "",
      body_type: listing.body_type || "",
      description: listing.description || "",
      status: listing.status || "available",
    });
    setError("");
    setSuccess("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
    setError("");
    setSuccess("");
  }

  async function handleUpdate(id) {
    try {
      setError("");
      setSuccess("");
      await updateListing(id, {
        make: editForm.make.trim(),
        model: editForm.model.trim(),
        year: Number(editForm.year),
        price: Number(editForm.price),
        mileage: Number(editForm.mileage),
        body_type: editForm.body_type.trim(),
        description: editForm.description || "",
        status: editForm.status,
      });
      setSuccess("Listing updated successfully!");
      setEditingId(null);
      await loadListings();
    } catch (e) {
      setError(e.message || "Failed to update listing");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }
    try {
      setError("");
      await deleteListing(id);
      setSuccess("Listing deleted successfully!");
      await loadListings();
    } catch (e) {
      setError(e.message || "Failed to delete listing");
    }
  }

  function handleEditChange(e) {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-zinc-600 text-lg">Loading listings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Manage Listings</h1>
          <p className="text-zinc-600">Edit or delete car listings</p>
        </div>

        {success && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {listings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-zinc-600">No listings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => {
              const listingId = listing.listing_id || listing.id;
              const isEditing = editingId === listingId;

              return (
                <div
                  key={listingId}
                  className="bg-white rounded-xl shadow-md overflow-hidden"
                >
                  {isEditing ? (
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                        Edit Listing #{listingId}
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="grid gap-1 text-sm">
                          Make*
                          <input
                            type="text"
                            name="make"
                            value={editForm.make}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Model*
                          <input
                            type="text"
                            name="model"
                            value={editForm.model}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Year*
                          <input
                            type="number"
                            name="year"
                            value={editForm.year}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Price (CAD)*
                          <input
                            type="number"
                            name="price"
                            value={editForm.price}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Mileage (km)*
                          <input
                            type="number"
                            name="mileage"
                            value={editForm.mileage}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          />
                        </label>
                        <label className="grid gap-1 text-sm">
                          Body Type*
                          <input
                            type="text"
                            name="body_type"
                            value={editForm.body_type}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          />
                        </label>
                        <label className="grid gap-1 text-sm col-span-2">
                          Status*
                          <select
                            name="status"
                            value={editForm.status}
                            onChange={handleEditChange}
                            className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                          >
                            <option value="available">Available</option>
                            <option value="sold">Sold</option>
                            <option value="pending">Pending</option>
                          </select>
                        </label>
                        <label className="grid gap-1 text-sm col-span-2">
                          Description
                          <textarea
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                            rows={3}
                            className="rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-yellow-400"
                          />
                        </label>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleUpdate(listingId)}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-200 rounded-md hover:bg-zinc-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h3 className="text-xl font-semibold text-zinc-900">
                              {listing.year} {listing.make} {listing.model}
                            </h3>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              listing.status === "available" ? "bg-green-100 text-green-700" :
                              listing.status === "sold" ? "bg-red-100 text-red-700" :
                              "bg-yellow-100 text-yellow-700"
                            }`}>
                              {listing.status?.toUpperCase() || "N/A"}
                            </span>
                          </div>
                          <p className="text-2xl font-bold text-yellow-600 mb-3">
                            ${listing.price ? listing.price.toLocaleString() : "N/A"}
                          </p>
                          <div className="grid grid-cols-2 gap-2 text-sm text-zinc-600 mb-3">
                            <p>Mileage: {listing.mileage || "N/A"} km</p>
                            <p>Body Type: {listing.body_type || "N/A"}</p>
                            {listing.seller_name && (
                              <p>Seller: {listing.seller_name}</p>
                            )}
                            <p>ID: {listingId}</p>
                          </div>
                          {listing.description && (
                            <p className="text-sm text-zinc-700 mb-3 line-clamp-2">
                              {listing.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <Link
                            to={`/listing/${listingId}`}
                            className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 text-center"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => startEdit(listing)}
                            className="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(listingId)}
                            className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

