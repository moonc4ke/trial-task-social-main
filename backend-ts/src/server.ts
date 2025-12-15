import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { generateSocialMediaPosts } from "./generate";
import { Product, GenerateRequest, Tone, WebResearchResult } from "./types";
import { performWebResearch } from "./webResearch";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Validation helper
function validateProduct(product: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!product || typeof product !== "object") {
    return { valid: false, errors: ["Product data is required"] };
  }

  const p = product as Record<string, unknown>;

  if (!p.name || typeof p.name !== "string" || p.name.trim().length === 0) {
    errors.push("Product name is required");
  } else if (p.name.length > 200) {
    errors.push("Product name must be less than 200 characters");
  }

  if (!p.description || typeof p.description !== "string" || p.description.trim().length === 0) {
    errors.push("Product description is required");
  } else if (p.description.length > 5000) {
    errors.push("Product description must be less than 5000 characters");
  }

  if (p.price === undefined || p.price === null) {
    errors.push("Product price is required");
  } else if (typeof p.price !== "number" || isNaN(p.price)) {
    errors.push("Product price must be a valid number");
  } else if (p.price < 0) {
    errors.push("Product price cannot be negative");
  } else if (p.price > 1000000000) {
    errors.push("Product price seems unrealistic");
  }

  if (p.category !== undefined && p.category !== null && p.category !== "") {
    if (typeof p.category !== "string") {
      errors.push("Product category must be a string");
    } else if (p.category.length > 100) {
      errors.push("Product category must be less than 100 characters");
    }
  }

  return { valid: errors.length === 0, errors };
}

// Validate tone
function validateTone(tone: unknown): tone is Tone {
  const validTones: Tone[] = ["professional", "casual", "humorous", "inspirational", "urgent"];
  return typeof tone === "string" && validTones.includes(tone as Tone);
}

app.get("/", (req: Request, res: Response) => {
  res.json({ hello: "world", timestamp: new Date().toISOString() });
});

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Generate social media posts
app.post("/api/generate", async (req: Request, res: Response) => {
  try {
    const { product, tone, platforms, enableWebResearch }: GenerateRequest = req.body;

    // Validate product
    const validation = validateProduct(product);
    if (!validation.valid) {
      res.status(400).json({
        error: "Validation failed",
        details: validation.errors,
      });
      return;
    }

    // Validate tone if provided
    const selectedTone: Tone = tone && validateTone(tone) ? tone : "professional";

    // Validate platforms if provided
    const validPlatforms = ["twitter", "instagram", "linkedin"] as const;
    const selectedPlatforms = platforms?.filter((p): p is typeof validPlatforms[number] =>
      validPlatforms.includes(p as typeof validPlatforms[number])
    ) || [...validPlatforms];

    if (selectedPlatforms.length === 0) {
      res.status(400).json({
        error: "Validation failed",
        details: ["At least one valid platform must be selected"],
      });
      return;
    }

    // Perform web research if enabled
    let webResearch: WebResearchResult | undefined;
    if (enableWebResearch) {
      console.log("Performing web research for:", product.name);
      try {
        webResearch = await performWebResearch(product.name, product.category);
        console.log("Web research completed:", {
          topics: webResearch.trendingTopics.length,
          hashtags: webResearch.relevantHashtags.length,
        });
      } catch (researchError) {
        console.warn("Web research failed, continuing without it:", researchError);
        // Continue without web research - it's optional
      }
    }

    const posts = await generateSocialMediaPosts(
      product as Product,
      selectedTone,
      selectedPlatforms,
      webResearch
    );

    res.json({
      posts,
      generated_at: new Date().toISOString(),
      count: posts.length,
      tone: selectedTone,
      platforms: selectedPlatforms,
      webResearchUsed: !!webResearch,
      webResearch: webResearch || null,
    });
  } catch (error) {
    console.error("Error generating posts:", error);

    // Handle specific OpenAI errors
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        res.status(500).json({
          error: "API configuration error",
          message: "The server is not properly configured. Please contact support.",
        });
        return;
      }
      if (error.message.includes("rate limit")) {
        res.status(429).json({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again in a few moments.",
        });
        return;
      }
    }

    res.status(500).json({
      error: "Failed to generate posts",
      message: "An unexpected error occurred. Please try again.",
    });
  }
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: "An unexpected error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
