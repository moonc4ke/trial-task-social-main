export interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export type Platform = 'twitter' | 'instagram' | 'linkedin';

export type Tone = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'urgent';

export interface SocialMediaPost {
  platform: Platform;
  content: string;
}

export interface GenerateRequest {
  product: Product;
  tone?: Tone;
  platforms?: Platform[];
  enableWebResearch?: boolean;
}

export interface WebResearchResult {
  trendingTopics: string[];
  relevantHashtags: string[];
  marketInsights: string;
  competitorMentions: string[];
}

export interface GenerateResponse {
  posts: SocialMediaPost[];
  generated_at: string;
  count: number;
  tone: Tone;
  platforms: Platform[];
}

export interface ApiError {
  error: string;
  message?: string;
  details?: string[];
}