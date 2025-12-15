import { Tone } from "./types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateProduct(product: unknown): ValidationResult {
  const errors: string[] = [];

  if (!product || typeof product !== "object") {
    return { valid: false, errors: ["Product data is required"] };
  }

  const p = product as Record<string, unknown>;

  if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
    errors.push("Product name is required");
  } else if (p.name.length > 200) {
    errors.push("Product name must be less than 200 characters");
  }

  if (!p.description || typeof p.description !== "string" || p.description.trim().length === 0) {
    errors.push("Product description is required");
  } else if (p.description.length > 5000) {
    errors.push("Product description must be less than 5000 characters");
  }

  if (p.price === undefined || p.price === null) {
    errors.push("Product price is required");
  } else if (typeof p.price !== "number" || isNaN(p.price)) {
    errors.push("Product price must be a valid number");
  } else if (p.price < 0) {
    errors.push("Product price cannot be negative");
  } else if (p.price > 1000000000) {
    errors.push("Product price seems unrealistic");
  }

  if (p.category !== undefined && p.category !== null && p.category !== "") {
    if (typeof p.category !== "string") {
      errors.push("Product category must be a string");
    } else if (p.category.length > 100) {
      errors.push("Product category must be less than 100 characters");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateTone(tone: unknown): tone is Tone {
  const validTones: Tone[] = ["professional", "casual", "humorous", "inspirational", "urgent"];
  return typeof tone === "string" && validTones.includes(tone as Tone);
}

export function validatePlatforms(platforms: unknown): string[] {
  const validPlatforms = ["twitter", "instagram", "linkedin"] as const;

  if (!Array.isArray(platforms)) {
    return [];
  }

  return platforms.filter((p): p is typeof validPlatforms[number] =>
    typeof p === "string" && validPlatforms.includes(p as typeof validPlatforms[number])
  );
}
