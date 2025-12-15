import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/server';

// Mock the generate and webResearch modules
vi.mock('../src/generate', () => ({
  generateSocialMediaPosts: vi.fn(),
}));

vi.mock('../src/webResearch', () => ({
  performWebResearch: vi.fn(),
}));

import { generateSocialMediaPosts } from '../src/generate';
import { performWebResearch } from '../src/webResearch';

const mockGeneratePosts = generateSocialMediaPosts as ReturnType<typeof vi.fn>;
const mockWebResearch = performWebResearch as ReturnType<typeof vi.fn>;

describe('API Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return hello world response', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hello', 'world');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('POST /api/generate', () => {
    const validProduct = {
      name: 'Test Product',
      description: 'A great product for testing',
      price: 29.99,
      category: 'Testing',
    };

    describe('validation errors', () => {
      it('should return 400 for missing product', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({});

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Product data is required');
      });

      it('should return 400 for missing required fields', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({ product: {} });

        expect(response.status).toBe(400);
        expect(response.body.error).toBe('Validation failed');
        expect(response.body.details).toContain('Product name is required');
        expect(response.body.details).toContain('Product description is required');
        expect(response.body.details).toContain('Product price is required');
      });

      it('should return 400 for empty product name', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            product: {
              name: '',
              description: 'Test description',
              price: 10,
            },
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContain('Product name is required');
      });

      it('should return 400 for negative price', async () => {
        const response = await request(app)
          .post('/api/generate')
          .send({
            product: {
              name: 'Test',
              description: 'Test description',
              price: -5,
            },
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContain('Product price cannot be negative');
      });

      it('should return 400 for invalid platforms', async () => {
        mockGeneratePosts.mockResolvedValue([]);

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            platforms: ['facebook', 'tiktok'],
          });

        expect(response.status).toBe(400);
        expect(response.body.details).toContain('At least one valid platform must be selected');
      });
    });

    describe('successful generation', () => {
      it('should generate posts with default tone and platforms', async () => {
        const mockPosts = [
          { platform: 'twitter', content: 'Test tweet' },
          { platform: 'instagram', content: 'Test instagram post' },
          { platform: 'linkedin', content: 'Test linkedin post' },
        ];
        mockGeneratePosts.mockResolvedValue(mockPosts);

        const response = await request(app)
          .post('/api/generate')
          .send({ product: validProduct });

        expect(response.status).toBe(200);
        expect(response.body.posts).toEqual(mockPosts);
        expect(response.body.tone).toBe('professional');
        expect(response.body.platforms).toEqual(['twitter', 'instagram', 'linkedin']);
        expect(response.body.count).toBe(3);
        expect(response.body).toHaveProperty('generated_at');
        expect(mockGeneratePosts).toHaveBeenCalledWith(
          validProduct,
          'professional',
          ['twitter', 'instagram', 'linkedin'],
          undefined
        );
      });

      it('should generate posts with specified tone', async () => {
        const mockPosts = [{ platform: 'twitter', content: 'Funny tweet!' }];
        mockGeneratePosts.mockResolvedValue(mockPosts);

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            tone: 'humorous',
            platforms: ['twitter'],
          });

        expect(response.status).toBe(200);
        expect(response.body.tone).toBe('humorous');
        expect(mockGeneratePosts).toHaveBeenCalledWith(
          validProduct,
          'humorous',
          ['twitter'],
          undefined
        );
      });

      it('should use default tone for invalid tone value', async () => {
        const mockPosts = [{ platform: 'twitter', content: 'Test tweet' }];
        mockGeneratePosts.mockResolvedValue(mockPosts);

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            tone: 'invalid_tone',
            platforms: ['twitter'],
          });

        expect(response.status).toBe(200);
        expect(response.body.tone).toBe('professional');
      });

      it('should generate posts for specific platforms', async () => {
        const mockPosts = [
          { platform: 'twitter', content: 'Tweet' },
          { platform: 'linkedin', content: 'LinkedIn post' },
        ];
        mockGeneratePosts.mockResolvedValue(mockPosts);

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            platforms: ['twitter', 'linkedin'],
          });

        expect(response.status).toBe(200);
        expect(response.body.platforms).toEqual(['twitter', 'linkedin']);
      });
    });

    describe('web research integration', () => {
      it('should include web research when enabled', async () => {
        const mockPosts = [{ platform: 'twitter', content: 'Trending tweet!' }];
        const mockResearch = {
          trendingTopics: ['sustainability', 'eco-friendly'],
          relevantHashtags: ['#green', '#eco'],
          marketInsights: 'Growing market',
          competitorMentions: ['Brand A'],
        };
        mockGeneratePosts.mockResolvedValue(mockPosts);
        mockWebResearch.mockResolvedValue(mockResearch);

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            enableWebResearch: true,
            platforms: ['twitter'],
          });

        expect(response.status).toBe(200);
        expect(response.body.webResearchUsed).toBe(true);
        expect(response.body.webResearch).toEqual(mockResearch);
        expect(mockWebResearch).toHaveBeenCalledWith(validProduct.name, validProduct.category);
        expect(mockGeneratePosts).toHaveBeenCalledWith(
          validProduct,
          'professional',
          ['twitter'],
          mockResearch
        );
      });

      it('should not include web research when disabled', async () => {
        const mockPosts = [{ platform: 'twitter', content: 'Regular tweet' }];
        mockGeneratePosts.mockResolvedValue(mockPosts);

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            enableWebResearch: false,
            platforms: ['twitter'],
          });

        expect(response.status).toBe(200);
        expect(response.body.webResearchUsed).toBe(false);
        expect(response.body.webResearch).toBeNull();
        expect(mockWebResearch).not.toHaveBeenCalled();
      });

      it('should continue without research if web research fails', async () => {
        const mockPosts = [{ platform: 'twitter', content: 'Tweet without research' }];
        mockGeneratePosts.mockResolvedValue(mockPosts);
        mockWebResearch.mockRejectedValue(new Error('Research API failed'));

        const response = await request(app)
          .post('/api/generate')
          .send({
            product: validProduct,
            enableWebResearch: true,
            platforms: ['twitter'],
          });

        expect(response.status).toBe(200);
        expect(response.body.webResearchUsed).toBe(false);
        expect(response.body.posts).toEqual(mockPosts);
      });
    });

    describe('error handling', () => {
      it('should return 500 for OpenAI API errors', async () => {
        mockGeneratePosts.mockRejectedValue(new Error('OpenAI API error'));

        const response = await request(app)
          .post('/api/generate')
          .send({ product: validProduct });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Failed to generate posts');
      });

      it('should return 500 for API key errors', async () => {
        mockGeneratePosts.mockRejectedValue(new Error('Invalid API key'));

        const response = await request(app)
          .post('/api/generate')
          .send({ product: validProduct });

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('API configuration error');
      });

      it('should return 429 for rate limit errors', async () => {
        mockGeneratePosts.mockRejectedValue(new Error('rate limit exceeded'));

        const response = await request(app)
          .post('/api/generate')
          .send({ product: validProduct });

        expect(response.status).toBe(429);
        expect(response.body.error).toBe('Rate limit exceeded');
      });
    });
  });
});
