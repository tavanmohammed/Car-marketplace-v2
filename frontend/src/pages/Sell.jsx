import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { validateYear, validatePrice, validateMileage, validateImageUrl, validateRequiredFields } from "../utils/validation.js";
import { createListing, uploadImage } from "../utils/api.js";
import FormSection from "../components/FormSection.jsx";

export default function Sell() {
  const { user, userRole, isAdmin, isUser } = useAuth();

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    body_type: "",
    price: "",
    description: "",
    main_photo_url: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      const result = await uploadImage(file);
      const imageUrl = `http://localhost:4000${result.imageUrl}`;
      setForm((f) => ({ ...f, main_photo_url: result.imageUrl }));
      setPreviewUrl(imageUrl);
      setSuccess("Image uploaded successfully!");
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  function buildPayload() {
    const payload = {
      make: form.brand.trim(),
      model: form.model.trim(),
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      body_type: form.body_type.trim(),
      description: form.description || "",
      status: "available",
    };
    
    if (form.main_photo_url && form.main_photo_url.trim() !== "") {
      payload.main_photo_url = form.main_photo_url.trim();
    }
    
    return payload;
  }

  function validateForm() {
    const requiredFields = ["brand", "model", "year", "mileage", "body_type", "price"];
    const { isValid } = validateRequiredFields(form, requiredFields);
    
    if (!isValid) {
      return "Please fill in all required fields (marked with *).";
    }

    if (!validateYear(form.year)) {
      return "Please enter a valid year (1950 to current year).";
    }

    if (!validatePrice(form.price)) {
      return "Price must be a valid positive number.";
    }

    if (!validateMileage(form.mileage)) {
      return "Mileage must be a valid non-negative number.";
    }

    if (form.main_photo_url && !validateImageUrl(form.main_photo_url)) {
      return "Please enter a valid image URL.";
    }

    if (!user) {
      return "You must be logged in to create a listing.";
    }

    if (userRole !== "user" && !isAdmin) {
      return "Only registered users can create listings.";
    }

    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccess("");
    setError("");

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      const payload = buildPayload();
      await createListing(payload);
      
      setSuccess("Listing created successfully! Redirecting to browse...");
      setTimeout(() => {
        window.location.href = "/browse";
      }, 1500);
    } catch (err) {
      setError(err.message || "Something went wrong while creating the listing.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 pb-20">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center mb-10">
          <img
            src="https://cdn-icons-png.flaticon.com/512/744/744465.png"
            alt="iWantCar logo"
            className="mx-auto h-12 w-12 mb-2"
          />
          <h1 className="text-3xl font-extrabold tracking-tight">
            List Your Car
          </h1>
          <p className="mt-2 text-zinc-600 text-sm">
            Fill in the details below to create your listing.
          </p>

          {!user && (
            <p className="mt-3 text-xs text-red-600">
              You must be logged in to create a listing.
            </p>
          )}
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

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-md ring-1 ring-zinc-100 p-6 space-y-6"
        >
          <FormSection title="Car Details" required>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                Make*
                <input
                  type="text"
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  placeholder="e.g. Toyota, Honda, Audi"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Model*
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  placeholder="e.g. Camry, Civic, Q5"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Year*
                <input
                  type="number"
                  name="year"
                  value={form.year}
                  onChange={handleChange}
                  placeholder="e.g. 2020"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Body Type*
                <input
                  type="text"
                  name="body_type"
                  value={form.body_type}
                  onChange={handleChange}
                  placeholder="e.g. Sedan, SUV, Hatchback, Truck"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Mileage (km)*
                <input
                  type="number"
                  name="mileage"
                  value={form.mileage}
                  onChange={handleChange}
                  placeholder="e.g. 100000"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>

              <label className="grid gap-1 text-sm">
                Price (CAD)*
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 18999"
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                />
              </label>
            </div>
          </FormSection>

          <FormSection title="Description" optional>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Tell buyers about your car (condition, features, recent work, etc.)"
              rows={4}
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
          </FormSection>

          <FormSection title="Car Image" optional>
            <div className="mt-2 space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700 mb-2 block">
                  Upload Image File
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-zinc-900 hover:file:bg-yellow-500 file:cursor-pointer disabled:opacity-50"
                />
              </label>
              
              {previewUrl && (
                <div className="mt-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full h-48 object-cover rounded-lg border border-zinc-200"
                  />
                </div>
              )}

              <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-200">
                <p className="mb-2">Or enter an image URL:</p>
                <input
                  name="main_photo_url"
                  value={form.main_photo_url}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </FormSection>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || uploading}
              className="w-full rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-zinc-900 hover:bg-yellow-500 disabled:opacity-60 transition-colors"
            >
              {submitting ? "Creating Listing..." : uploading ? "Uploading Image..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
