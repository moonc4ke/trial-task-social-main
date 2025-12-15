import { Product } from './api';

export interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
}

export function validateProduct(product: Product): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!product.name.trim()) {
    errors.name = 'Product name is required';
  } else if (product.name.length > 200) {
    errors.name = 'Product name must be less than 200 characters';
  }

  if (!product.description.trim()) {
    errors.description = 'Product description is required';
  } else if (product.description.length > 5000) {
    errors.description = 'Description must be less than 5000 characters';
  }

  if (product.price < 0) {
    errors.price = 'Price cannot be negative';
  }

  return errors;
}

export function isFormValid(product: Product, selectedPlatformsCount: number): boolean {
  return (
    product.name.trim().length > 0 &&
    product.description.trim().length > 0 &&
    product.price >= 0 &&
    selectedPlatformsCount > 0
  );
}

export function formatPrice(value: string): number {
  if (value === '') {
    return 0;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}
