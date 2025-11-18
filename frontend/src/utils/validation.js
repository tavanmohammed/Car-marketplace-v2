export function validateYear(year) {
  const yearNum = Number(year);
  const currentYear = new Date().getFullYear();
  return !isNaN(yearNum) && yearNum >= 1950 && yearNum <= currentYear + 1;
}

export function validatePrice(price) {
  const priceNum = Number(price);
  return !isNaN(priceNum) && priceNum > 0;
}

export function validateMileage(mileage) {
  const mileageNum = Number(mileage);
  return !isNaN(mileageNum) && mileageNum >= 0;
}

export function validateImageUrl(url) {
  if (!url || url.trim() === "") return true;
  return url.startsWith("http://") || url.startsWith("https://");
}

export function validateRequiredFields(form, requiredFields) {
  const missing = requiredFields.filter(field => !form[field]);
  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
}
