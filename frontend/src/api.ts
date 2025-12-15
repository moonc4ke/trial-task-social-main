export interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

export type Platform = "twitter" | "instagram" | "linkedin";
export type Tone = "professional" | "casual" | "humorous" | "inspirational" | "urgent";

export interface SocialMediaPost {
  platform: Platform;
  content: string;
}

export interface WebResearchResult {
  trendingTopics: string[];
  relevantHashtags: string[];
  marketInsights: string;
  competitorMentions: string[];
}

export interface GeneratePostsRequest {
  product: Product;
  tone?: Tone;
  platforms?: Platform[];
  enableWebResearch?: boolean;
}

export interface GeneratePostsResponse {
  posts: SocialMediaPost[];
  generated_at: string;
  count: number;
  tone: Tone;
  platforms: Platform[];
  webResearchUsed: boolean;
  webResearch: WebResearchResult | null;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: string[];
}

export class ApiException extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string[]
  ) {
    super(message);
    this.name = "ApiException";
  }
}

export async function generatePosts(
  request: GeneratePostsRequest
): Promise<GeneratePostsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const errorData = data as ApiError;
    throw new ApiException(
      errorData.message || errorData.error || "An error occurred",
      response.status,
      errorData.details
    );
  }

  return data as GeneratePostsResponse;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/health`
    );
    return response.ok;
  } catch {
    return false;
  }
}
