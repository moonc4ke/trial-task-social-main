import { describe, it, expect } from 'vitest';
import { validateProduct, validateTone, validatePlatforms } from '../../src/validation';

describe('validateProduct', () => {
  describe('valid products', () => {
    it('should accept a valid product with all fields', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: 29.99,
        category: 'Electronics',
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a valid product without optional category', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a product with price of 0', () => {
      const product = {
        name: 'Free Product',
        description: 'A free product description',
        price: 0,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept a product with empty string category', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: 29.99,
        category: '',
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('invalid products - missing fields', () => {
    it('should reject null product', () => {
      const result = validateProduct(null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product data is required');
    });

    it('should reject undefined product', () => {
      const result = validateProduct(undefined);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product data is required');
    });

    it('should reject empty object', () => {
      const result = validateProduct({});

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
      expect(result.errors).toContain('Product description is required');
      expect(result.errors).toContain('Product price is required');
    });

    it('should reject product with missing name', () => {
      const product = {
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should reject product with missing description', () => {
      const product = {
        name: 'Test Product',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product description is required');
    });

    it('should reject product with missing price', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price is required');
    });
  });

  describe('invalid products - empty/whitespace values', () => {
    it('should reject product with empty name', () => {
      const product = {
        name: '',
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should reject product with whitespace-only name', () => {
      const product = {
        name: '   ',
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should reject product with empty description', () => {
      const product = {
        name: 'Test Product',
        description: '',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product description is required');
    });
  });

  describe('invalid products - length limits', () => {
    it('should reject product with name over 200 characters', () => {
      const product = {
        name: 'A'.repeat(201),
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name must be less than 200 characters');
    });

    it('should accept product with name exactly 200 characters', () => {
      const product = {
        name: 'A'.repeat(200),
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(true);
    });

    it('should reject product with description over 5000 characters', () => {
      const product = {
        name: 'Test Product',
        description: 'A'.repeat(5001),
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product description must be less than 5000 characters');
    });

    it('should reject product with category over 100 characters', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: 29.99,
        category: 'A'.repeat(101),
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product category must be less than 100 characters');
    });
  });

  describe('invalid products - price validation', () => {
    it('should reject negative price', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: -10,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price cannot be negative');
    });

    it('should reject unrealistically high price', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: 1000000001,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price seems unrealistic');
    });

    it('should reject string price', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: '29.99',
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price must be a valid number');
    });

    it('should reject NaN price', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: NaN,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product price must be a valid number');
    });
  });

  describe('invalid products - type validation', () => {
    it('should reject non-string name', () => {
      const product = {
        name: 123,
        description: 'A great product description',
        price: 29.99,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product name is required');
    });

    it('should reject non-string category', () => {
      const product = {
        name: 'Test Product',
        description: 'A great product description',
        price: 29.99,
        category: 123,
      };

      const result = validateProduct(product);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Product category must be a string');
    });
  });
});

describe('validateTone', () => {
  it('should accept valid tones', () => {
    expect(validateTone('professional')).toBe(true);
    expect(validateTone('casual')).toBe(true);
    expect(validateTone('humorous')).toBe(true);
    expect(validateTone('inspirational')).toBe(true);
    expect(validateTone('urgent')).toBe(true);
  });

  it('should reject invalid tones', () => {
    expect(validateTone('angry')).toBe(false);
    expect(validateTone('formal')).toBe(false);
    expect(validateTone('')).toBe(false);
    expect(validateTone(null)).toBe(false);
    expect(validateTone(undefined)).toBe(false);
    expect(validateTone(123)).toBe(false);
    expect(validateTone({})).toBe(false);
  });
});

describe('validatePlatforms', () => {
  it('should accept valid platforms', () => {
    expect(validatePlatforms(['twitter'])).toEqual(['twitter']);
    expect(validatePlatforms(['instagram'])).toEqual(['instagram']);
    expect(validatePlatforms(['linkedin'])).toEqual(['linkedin']);
    expect(validatePlatforms(['twitter', 'instagram', 'linkedin'])).toEqual([
      'twitter',
      'instagram',
      'linkedin',
    ]);
  });

  it('should filter out invalid platforms', () => {
    expect(validatePlatforms(['twitter', 'facebook', 'tiktok'])).toEqual(['twitter']);
    expect(validatePlatforms(['facebook', 'tiktok'])).toEqual([]);
  });

  it('should return empty array for non-array input', () => {
    expect(validatePlatforms(null)).toEqual([]);
    expect(validatePlatforms(undefined)).toEqual([]);
    expect(validatePlatforms('twitter')).toEqual([]);
    expect(validatePlatforms({})).toEqual([]);
  });

  it('should handle empty array', () => {
    expect(validatePlatforms([])).toEqual([]);
  });

  it('should handle mixed valid and invalid values', () => {
    expect(validatePlatforms(['twitter', 123, null, 'instagram', {}, 'facebook'])).toEqual([
      'twitter',
      'instagram',
    ]);
  });
});
