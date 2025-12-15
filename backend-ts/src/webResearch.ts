import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }
    client = new OpenAI({ apiKey });
  }
  return client;
}

export interface WebResearchResult {
  trendingTopics: string[];
  relevantHashtags: string[];
  marketInsights: string;
  competitorMentions: string[];
}

export async function performWebResearch(
  productName: string,
  category?: string
): Promise<WebResearchResult> {
  const openaiClient = getClient();

  const searchQuery = category
    ? `trending ${category} products social media marketing ${productName} 2024`
    : `trending products social media marketing ${productName} 2024`;

  try {
    // Use the Responses API with web_search tool
    const response = await openaiClient.responses.create({
      model: "gpt-4o",
      input: `Research current social media trends for marketing a product called "${productName}"${category ? ` in the ${category} category` : ""}.

Find:
1. Current trending topics related to this product category
2. Popular hashtags being used for similar products
3. Key market insights or consumer trends
4. Any competitor products or brands being discussed

Focus on recent, relevant information that would help create engaging social media posts.`,
      tools: [{ type: "web_search" }],
    });

    // Parse the response to extract insights
    let messageContent = "";

    // Handle different response structures
    if (response.output && Array.isArray(response.output)) {
      for (const item of response.output) {
        if (item.type === "message" && item.content) {
          for (const content of item.content) {
            if (content.type === "output_text") {
              messageContent += content.text;
            }
          }
        }
      }
    }

    // Extract structured data from the response
    return parseResearchResponse(messageContent);
  } catch (error) {
    console.error("Web research error:", error);
    // Return empty results if research fails - don't block the main flow
    return {
      trendingTopics: [],
      relevantHashtags: [],
      marketInsights: "",
      competitorMentions: [],
    };
  }
}

function parseResearchResponse(content: string): WebResearchResult {
  // Extract hashtags (words starting with #)
  const hashtagMatches = content.match(/#\w+/g) || [];
  const relevantHashtags = [...new Set(hashtagMatches)].slice(0, 10);

  // Try to extract trending topics - look for numbered lists or bullet points
  const trendingTopics: string[] = [];
  const topicPatterns = [
    /trending[:\s]+([^\n]+)/gi,
    /popular[:\s]+([^\n]+)/gi,
    /\d+\.\s+([^\n]+)/g,
  ];

  for (const pattern of topicPatterns) {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length < 100) {
        trendingTopics.push(match[1].trim());
      }
    }
  }

  // Extract competitor mentions - look for brand names or product names
  const competitorMentions: string[] = [];
  const brandPattern = /(?:brand|competitor|company|product)s?[:\s]+([^\n.,]+)/gi;
  const brandMatches = content.matchAll(brandPattern);
  for (const match of brandMatches) {
    if (match[1]) {
      competitorMentions.push(match[1].trim());
    }
  }

  return {
    trendingTopics: [...new Set(trendingTopics)].slice(0, 5),
    relevantHashtags,
    marketInsights: content.slice(0, 500), // First 500 chars as summary
    competitorMentions: [...new Set(competitorMentions)].slice(0, 5),
  };
}

export function formatResearchForPrompt(research: WebResearchResult): string {
  const parts: string[] = [];

  if (research.trendingTopics.length > 0) {
    parts.push(`Current trending topics: ${research.trendingTopics.join(", ")}`);
  }

  if (research.relevantHashtags.length > 0) {
    parts.push(`Suggested hashtags: ${research.relevantHashtags.join(" ")}`);
  }

  if (research.marketInsights) {
    parts.push(`Market insights: ${research.marketInsights.slice(0, 200)}...`);
  }

  return parts.length > 0
    ? `\n\nWEB RESEARCH INSIGHTS:\n${parts.join("\n")}`
    : "";
}
