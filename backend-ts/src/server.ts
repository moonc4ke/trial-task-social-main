import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { generateSocialMediaPosts } from "./generate";
import { Product, GenerateRequest, Tone, WebResearchResult } from "./types";
import { performWebResearch } from "./webResearch";
import { validateProduct, validateTone, validatePlatforms } from "./validation";

export const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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
    const selectedPlatforms = platforms
      ? validatePlatforms(platforms)
      : ["twitter", "instagram", "linkedin"];

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

// Only start server if this file is run directly (not imported for testing)
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

export default app;
