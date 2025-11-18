import React, { useState, useMemo } from "react";
import { BRANDS, MODELS_BY_BRAND, BODY_STYLES } from "../data/brands.js";
import { useAuth } from "../context/AuthContext.jsx";
import { validateYear, validatePrice, validateMileage, validateImageUrl, validateRequiredFields } from "../utils/validation.js";
import { createListing } from "../utils/api.js";
import FormSection from "../components/FormSection.jsx";

export default function Sell() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    mileage: "",
    vin: "",
    body_type: "",
    price: "",
    description: "",
    main_photo_url: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const models = useMemo(
    () => (form.brand ? MODELS_BY_BRAND[form.brand] || [] : []),
    [form.brand]
  );

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function buildPayload() {
    const payload = {
      make: form.brand,
      model: form.model,
      year: Number(form.year),
      price: Number(form.price),
      mileage: Number(form.mileage),
      body_type: form.body_type,
      vin: form.vin || "",
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
      }, 2000);
    } catch (err) {
      console.error(err);
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
                <select
                  name="brand"
                  value={form.brand}
                  onChange={handleChange}
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                >
                  <option value="">Select</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm">
                Model*
                <select
                  name="model"
                  value={form.model}
                  onChange={handleChange}
                  disabled={!form.brand}
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400 disabled:bg-zinc-100"
                >
                  <option value="">Select</option>
                  {models.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
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
                <select
                  name="body_type"
                  value={form.body_type}
                  onChange={handleChange}
                  className="h-10 rounded-md border border-zinc-300 px-2 outline-none focus:border-yellow-400"
                >
                  <option value="">Select</option>
                  {BODY_STYLES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
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

              <label className="grid gap-1 text-sm">
                VIN (Optional)
                <input
                  name="vin"
                  value={form.vin}
                  onChange={handleChange}
                  placeholder="1HGCM82633A004352"
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
            <input
              name="main_photo_url"
              value={form.main_photo_url}
              onChange={handleChange}
              placeholder="https://example.com/car-image.jpg"
              className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Enter a URL to an image of your car. Supports:
              <br />• Imgur (gallery or direct URLs)
              <br />• Google Drive (share links will be converted automatically)
              <br />• Any other image hosting service
            </p>
          </FormSection>

          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-yellow-400 px-6 py-3 font-semibold text-zinc-900 hover:bg-yellow-500 disabled:opacity-60 transition-colors"
            >
              {submitting ? "Creating Listing..." : "Create Listing"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
