export const CONDITIONS = ["Used", "New", "Certified Pre-Owned"];

export const BRANDS = [
  "Acura", "Audi", "BMW", "Chevrolet", "Ford",
  "Honda", "Hyundai", "Kia", "Nissan", "Toyota", "Volkswagen"
];

export const ALL_BRANDS = ["All Brands", ...BRANDS];

export const MODELS_BY_BRAND = {
  Acura: ["ILX", "TLX", "RDX", "MDX", "Integra", "RLX"],
  Audi: ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
  BMW: ["2 Series", "3 Series", "5 Series", "X1", "X3", "X5"],
  Chevrolet: ["Spark", "Malibu", "Camaro", "Equinox", "Silverado 1500"],
  Ford: ["Fiesta", "Focus", "Fusion", "Escape", "F-150", "Explorer"],
  Honda: ["Civic", "Accord", "Fit", "CR-V", "HR-V", "Pilot"],
  Hyundai: ["Elantra", "Sonata", "Kona", "Tucson", "Santa Fe"],
  Kia: ["Rio", "Forte", "Soul", "Sportage", "Sorento"],
  Nissan: ["Sentra", "Altima", "Maxima", "Rogue", "Pathfinder"],
  Toyota: ["Corolla", "Camry", "Prius", "RAV4", "Highlander", "Tacoma"],
  Volkswagen: ["Golf", "Jetta", "Passat", "Tiguan", "Atlas"]
};

export const BODY_STYLES = [
  "Sedan", "SUV / Crossover", "Hatchback", "Convertible",
  "Minivan", "Pickup Truck", "Coupe", "Wagon"
];

export const CAR_BRANDS = BRANDS;
export const CAR_MODELS = MODELS_BY_BRAND;
