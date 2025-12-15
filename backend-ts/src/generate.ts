import { callOpenAI } from "./openai";
import { Product, SocialMediaPost, Platform, Tone, WebResearchResult } from "./types";
import { config } from "./config";

const TONE_DESCRIPTIONS: Record<Tone, string> = {
  professional: "Use a professional, business-appropriate tone. Focus on value proposition and credibility.",
  casual: "Use a friendly, conversational tone. Be relatable and approachable.",
  humorous: "Use wit and humor appropriately. Be entertaining while still promoting the product.",
  inspirational: "Use motivational language. Focus on aspirations and positive outcomes.",
  urgent: "Create a sense of urgency. Use action-oriented language and limited-time framing.",
};

const PLATFORM_GUIDELINES: Record<Platform, string> = {
  twitter: `Twitter/X post (max ${config.platforms.twitter.maxLength} characters). Be concise, use 1-2 relevant hashtags, and make it shareable.`,
  instagram: `Instagram caption (max ${config.platforms.instagram.maxLength} characters). Be visually descriptive, use emojis, include 3-5 relevant hashtags at the end.`,
  linkedin: `LinkedIn post (max ${config.platforms.linkedin.maxLength} characters). Be professional, provide value, and include a call to action.`,
};

export async function generateSocialMediaPosts(
  product: Product,
  tone: Tone = "professional",
  platforms: Platform[] = ["twitter", "instagram", "linkedin"],
  webResearch?: WebResearchResult
): Promise<SocialMediaPost[]> {
  const prompt = buildPrompt(product, tone, platforms, webResearch);

  const posts = await callOpenAI(prompt);

  // Filter and validate posts
  const validPosts = posts.filter(
    (post) => platforms.includes(post.platform) && post.content.trim().length > 0
  );

  // Ensure we have at least one post per requested platform
  const missingPlatforms = platforms.filter(
    (p) => !validPosts.some((post) => post.platform === p)
  );

  if (missingPlatforms.length > 0) {
    console.warn(`Missing posts for platforms: ${missingPlatforms.join(", ")}`);
  }

  return validPosts;
}

function buildPrompt(
  product: Product,
  tone: Tone,
  platforms: Platform[],
  webResearch?: WebResearchResult
): string {
  const platformInstructions = platforms
    .map((p) => `- ${PLATFORM_GUIDELINES[p]}`)
    .join("\n");

  let webResearchSection = "";
  if (webResearch && (webResearch.trendingTopics.length > 0 || webResearch.relevantHashtags.length > 0)) {
    const parts: string[] = [];

    if (webResearch.trendingTopics.length > 0) {
      parts.push(`Current trending topics: ${webResearch.trendingTopics.join(", ")}`);
    }

    if (webResearch.relevantHashtags.length > 0) {
      parts.push(`Trending hashtags to consider: ${webResearch.relevantHashtags.join(" ")}`);
    }

    if (webResearch.marketInsights) {
      // Truncate market insights to keep prompt reasonable
      const insights = webResearch.marketInsights.slice(0, 300);
      parts.push(`Market insights: ${insights}`);
    }

    webResearchSection = `

WEB RESEARCH INSIGHTS (use these to make posts more relevant and timely):
${parts.join("\n")}`;
  }

  return `You are a social media marketing expert. Generate engaging social media posts for the following product.

PRODUCT INFORMATION:
- Name: ${product.name}
- Description: ${product.description}
- Price: $${product.price.toFixed(2)}
${product.category ? `- Category: ${product.category}` : ""}

TONE: ${tone.charAt(0).toUpperCase() + tone.slice(1)}
${TONE_DESCRIPTIONS[tone]}

PLATFORM REQUIREMENTS:
${platformInstructions}
${webResearchSection}

GUIDELINES:
1. Each post should be unique and tailored to its platform's audience and format
2. Include relevant emojis where appropriate
3. Make the content engaging and shareable
4. Highlight the key benefits of the product
5. Include a subtle call-to-action
6. Ensure all posts stay within character limits
${webResearch ? "7. Incorporate relevant trending topics or hashtags from the web research when appropriate" : ""}

Generate exactly one post for each platform: ${platforms.join(", ")}.

Return your response as a JSON object with this exact structure:
{
  "posts": [
    { "platform": "platform_name", "content": "post content here" }
  ]
}

Only include the JSON object in your response, no additional text.`;
}
