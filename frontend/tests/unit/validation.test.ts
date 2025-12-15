import { describe, it, expect } from 'vitest';
import { validateProduct, isFormValid, formatPrice, ValidationErrors } from '../../src/validation';
import { Product } from '../../src/api';

describe('validateProduct', () => {
  const validProduct: Product = {
    name: 'Test Product',
    description: 'A great product description',
    price: 29.99,
    category: 'Testing',
  };

  describe('valid products', () => {
    it('should return no errors for valid product', () => {
      const errors = validateProduct(validProduct);

      expect(errors).toEqual({});
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should accept product with price of 0', () => {
      const product = { ...validProduct, price: 0 };
      const errors = validateProduct(product);

      expect(errors).toEqual({});
    });

    it('should accept product without category', () => {
      const product = { ...validProduct, category: undefined };
      const errors = validateProduct(product);

      expect(errors).toEqual({});
    });
  });

  describe('name validation', () => {
    it('should return error for empty name', () => {
      const product = { ...validProduct, name: '' };
      const errors = validateProduct(product);

      expect(errors.name).toBe('Product name is required');
    });

    it('should return error for whitespace-only name', () => {
      const product = { ...validProduct, name: '   ' };
      const errors = validateProduct(product);

      expect(errors.name).toBe('Product name is required');
    });

    it('should return error for name over 200 characters', () => {
      const product = { ...validProduct, name: 'A'.repeat(201) };
      const errors = validateProduct(product);

      expect(errors.name).toBe('Product name must be less than 200 characters');
    });

    it('should accept name with exactly 200 characters', () => {
      const product = { ...validProduct, name: 'A'.repeat(200) };
      const errors = validateProduct(product);

      expect(errors.name).toBeUndefined();
    });
  });

  describe('description validation', () => {
    it('should return error for empty description', () => {
      const product = { ...validProduct, description: '' };
      const errors = validateProduct(product);

      expect(errors.description).toBe('Product description is required');
    });

    it('should return error for whitespace-only description', () => {
      const product = { ...validProduct, description: '   ' };
      const errors = validateProduct(product);

      expect(errors.description).toBe('Product description is required');
    });

    it('should return error for description over 5000 characters', () => {
      const product = { ...validProduct, description: 'A'.repeat(5001) };
      const errors = validateProduct(product);

      expect(errors.description).toBe('Description must be less than 5000 characters');
    });
  });

  describe('price validation', () => {
    it('should return error for negative price', () => {
      const product = { ...validProduct, price: -10 };
      const errors = validateProduct(product);

      expect(errors.price).toBe('Price cannot be negative');
    });

    it('should accept zero price', () => {
      const product = { ...validProduct, price: 0 };
      const errors = validateProduct(product);

      expect(errors.price).toBeUndefined();
    });

    it('should accept high price', () => {
      const product = { ...validProduct, price: 999999 };
      const errors = validateProduct(product);

      expect(errors.price).toBeUndefined();
    });
  });

  describe('multiple errors', () => {
    it('should return multiple errors when multiple fields are invalid', () => {
      const product: Product = {
        name: '',
        description: '',
        price: -5,
      };
      const errors = validateProduct(product);

      expect(errors.name).toBe('Product name is required');
      expect(errors.description).toBe('Product description is required');
      expect(errors.price).toBe('Price cannot be negative');
    });
  });
});

describe('isFormValid', () => {
  const validProduct: Product = {
    name: 'Test Product',
    description: 'A great product description',
    price: 29.99,
  };

  it('should return true for valid product with platforms', () => {
    expect(isFormValid(validProduct, 3)).toBe(true);
    expect(isFormValid(validProduct, 1)).toBe(true);
  });

  it('should return false for empty name', () => {
    const product = { ...validProduct, name: '' };
    expect(isFormValid(product, 3)).toBe(false);
  });

  it('should return false for whitespace name', () => {
    const product = { ...validProduct, name: '   ' };
    expect(isFormValid(product, 3)).toBe(false);
  });

  it('should return false for empty description', () => {
    const product = { ...validProduct, description: '' };
    expect(isFormValid(product, 3)).toBe(false);
  });

  it('should return false for negative price', () => {
    const product = { ...validProduct, price: -1 };
    expect(isFormValid(product, 3)).toBe(false);
  });

  it('should return false for zero platforms', () => {
    expect(isFormValid(validProduct, 0)).toBe(false);
  });

  it('should return true for price of 0', () => {
    const product = { ...validProduct, price: 0 };
    expect(isFormValid(product, 1)).toBe(true);
  });
});

describe('formatPrice', () => {
  it('should return 0 for empty string', () => {
    expect(formatPrice('')).toBe(0);
  });

  it('should parse valid number string', () => {
    expect(formatPrice('29.99')).toBe(29.99);
    expect(formatPrice('100')).toBe(100);
    expect(formatPrice('0')).toBe(0);
  });

  it('should parse integer string', () => {
    expect(formatPrice('42')).toBe(42);
  });

  it('should parse decimal string', () => {
    expect(formatPrice('3.14159')).toBeCloseTo(3.14159);
  });

  it('should return 0 for invalid number string', () => {
    expect(formatPrice('abc')).toBe(0);
    expect(formatPrice('not a number')).toBe(0);
  });

  it('should handle leading/trailing spaces', () => {
    expect(formatPrice('  29.99  ')).toBe(29.99);
  });

  it('should handle negative numbers', () => {
    expect(formatPrice('-10')).toBe(-10);
  });
});
