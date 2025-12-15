import OpenAI from "openai";
import { SocialMediaPost, Platform } from "./types";
import { config } from "./config";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set");
    }

    client = new OpenAI({
      apiKey,
      timeout: config.api.timeout,
      maxRetries: config.api.retries,
    });
  }

  return client;
}

export async function callOpenAI(prompt: string): Promise<SocialMediaPost[]> {
  const openaiClient = getClient();

  try {
    const response = await openaiClient.chat.completions.create({
      model: config.generation.model,
      messages: [
        {
          role: "system",
          content: "You are a social media marketing expert. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: config.generation.temperature,
      max_tokens: config.generation.maxTokens,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      console.error("OpenAI returned empty content");
      throw new Error("No content received from AI");
    }

    let parsed: { posts?: SocialMediaPost[] };
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Invalid response format from AI");
    }

    if (!parsed.posts || !Array.isArray(parsed.posts)) {
      console.error("Invalid posts structure:", parsed);
      throw new Error("Invalid posts structure in AI response");
    }

    // Validate each post
    const validPlatforms: Platform[] = ["twitter", "instagram", "linkedin"];
    const validatedPosts = parsed.posts.filter((post): post is SocialMediaPost => {
      return (
        post &&
        typeof post === "object" &&
        typeof post.platform === "string" &&
        validPlatforms.includes(post.platform as Platform) &&
        typeof post.content === "string" &&
        post.content.trim().length > 0
      );
    });

    return validatedPosts;
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      console.error(`OpenAI API Error: ${error.status} - ${error.message}`);

      if (error.status === 401) {
        throw new Error("Invalid API key. Please check your OpenAI API key configuration.");
      }
      if (error.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (error.status === 500) {
        throw new Error("OpenAI service is temporarily unavailable. Please try again.");
      }
    }

    throw error;
  }
}
