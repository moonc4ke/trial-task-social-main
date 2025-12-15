import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePosts, checkHealth, ApiException } from '../src/api';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set the API URL for tests
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generatePosts', () => {
    const validRequest = {
      product: {
        name: 'Test Product',
        description: 'A great test product',
        price: 29.99,
        category: 'Testing',
      },
      tone: 'professional' as const,
      platforms: ['twitter' as const, 'instagram' as const],
    };

    it('should make a POST request with correct parameters', async () => {
      const mockResponse = {
        posts: [{ platform: 'twitter', content: 'Test tweet' }],
        generated_at: '2024-01-01T00:00:00Z',
        count: 1,
        tone: 'professional',
        platforms: ['twitter'],
        webResearchUsed: false,
        webResearch: null,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await generatePosts(validRequest);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validRequest),
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include enableWebResearch when specified', async () => {
      const requestWithResearch = {
        ...validRequest,
        enableWebResearch: true,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            posts: [],
            generated_at: '2024-01-01T00:00:00Z',
            count: 0,
            tone: 'professional',
            platforms: ['twitter'],
            webResearchUsed: true,
            webResearch: { trendingTopics: [], relevantHashtags: [], marketInsights: '', competitorMentions: [] },
          }),
      });

      await generatePosts(requestWithResearch);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.enableWebResearch).toBe(true);
    });

    it('should throw ApiException for validation errors', async () => {
      const errorResponse = {
        error: 'Validation failed',
        message: 'Product name is required',
        details: ['Product name is required', 'Product description is required'],
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorResponse),
      });

      try {
        await generatePosts(validRequest);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(400);
        expect((error as ApiException).details).toEqual(errorResponse.details);
      }
    });

    it('should throw ApiException for server errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            error: 'Failed to generate posts',
            message: 'An unexpected error occurred',
          }),
      });

      await expect(generatePosts(validRequest)).rejects.toThrow(ApiException);
    });

    it('should throw ApiException for rate limit errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: () =>
          Promise.resolve({
            error: 'Rate limit exceeded',
            message: 'Too many requests',
          }),
      });

      try {
        await generatePosts(validRequest);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiException);
        expect((error as ApiException).status).toBe(429);
      }
    });
  });

  describe('checkHealth', () => {
    it('should return true when server is healthy', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' }),
      });

      const result = await checkHealth();

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/health');
    });

    it('should return false when server is not responding', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      });

      const result = await checkHealth();

      expect(result).toBe(false);
    });

    it('should return false when fetch throws an error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await checkHealth();

      expect(result).toBe(false);
    });
  });
});

describe('ApiException', () => {
  it('should create an exception with message and status', () => {
    const exception = new ApiException('Test error', 400);

    expect(exception.message).toBe('Test error');
    expect(exception.status).toBe(400);
    expect(exception.name).toBe('ApiException');
  });

  it('should create an exception with details', () => {
    const details = ['Error 1', 'Error 2'];
    const exception = new ApiException('Validation failed', 400, details);

    expect(exception.details).toEqual(details);
  });

  it('should be an instance of Error', () => {
    const exception = new ApiException('Test', 500);

    expect(exception).toBeInstanceOf(Error);
  });
});
