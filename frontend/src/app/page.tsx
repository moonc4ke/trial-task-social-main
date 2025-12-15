"use client";

import { useState, useCallback } from "react";
import {
  generatePosts,
  ApiException,
  Product,
  SocialMediaPost,
  Platform,
  Tone,
} from "../api";

const PLATFORM_CONFIG = {
  twitter: {
    icon: "𝕏",
    name: "Twitter/X",
    maxLength: 280,
    color: "bg-black",
    textColor: "text-white",
  },
  instagram: {
    icon: "📷",
    name: "Instagram",
    maxLength: 2200,
    color: "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400",
    textColor: "text-white",
  },
  linkedin: {
    icon: "💼",
    name: "LinkedIn",
    maxLength: 3000,
    color: "bg-blue-700",
    textColor: "text-white",
  },
};

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Business-appropriate, focused on value" },
  { value: "casual", label: "Casual", description: "Friendly and conversational" },
  { value: "humorous", label: "Humorous", description: "Witty and entertaining" },
  { value: "inspirational", label: "Inspirational", description: "Motivational and uplifting" },
  { value: "urgent", label: "Urgent", description: "Action-oriented, limited-time feel" },
];

interface ValidationErrors {
  name?: string;
  description?: string;
  price?: string;
}

function validateProduct(product: Product): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!product.name.trim()) {
    errors.name = "Product name is required";
  } else if (product.name.length > 200) {
    errors.name = "Product name must be less than 200 characters";
  }

  if (!product.description.trim()) {
    errors.description = "Product description is required";
  } else if (product.description.length > 5000) {
    errors.description = "Description must be less than 5000 characters";
  }

  if (product.price < 0) {
    errors.price = "Price cannot be negative";
  }

  return errors;
}

export default function Home() {
  const [product, setProduct] = useState<Product>({
    name: "",
    description: "",
    price: 0,
    category: "",
  });
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [tone, setTone] = useState<Tone>("professional");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitter",
    "instagram",
    "linkedin",
  ]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(platform)) {
        if (prev.length === 1) return prev; // Keep at least one platform
        return prev.filter((p) => p !== platform);
      }
      return [...prev, platform];
    });
  };

  const handleCopyToClipboard = useCallback(async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  }, []);

  const handleGeneratePosts = async () => {
    // Validate
    const errors = validateProduct(product);
    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    if (selectedPlatforms.length === 0) {
      setError("Please select at least one platform");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generatePosts({
        product,
        tone,
        platforms: selectedPlatforms,
      });
      setPosts(result.posts);
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.details && err.details.length > 0) {
          setError(err.details.join(". "));
        } else {
          setError(err.message);
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (value: string) => {
    // Handle empty string
    if (value === "") {
      setProduct({ ...product, price: 0 });
      return;
    }
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      setProduct({ ...product, price: parsed });
    }
  };

  const isFormValid =
    product.name.trim() &&
    product.description.trim() &&
    product.price >= 0 &&
    selectedPlatforms.length > 0;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Social Media Post Generator
          </h1>
          <p className="text-gray-600">
            Generate engaging posts for multiple platforms from a single product description
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">
              Product Details
            </h2>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.name ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                value={product.name}
                onChange={(e) => {
                  setProduct({ ...product, name: e.target.value });
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: undefined });
                  }
                }}
                placeholder="EcoBottle Pro"
                maxLength={200}
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{product.name.length}/200 characters</p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                  validationErrors.description ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
                rows={4}
                value={product.description}
                onChange={(e) => {
                  setProduct({ ...product, description: e.target.value });
                  if (validationErrors.description) {
                    setValidationErrors({ ...validationErrors, description: undefined });
                  }
                }}
                placeholder="Revolutionary reusable water bottle with built-in UV purification that kills 99.9% of bacteria..."
                maxLength={5000}
              />
              {validationErrors.description && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.description}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">{product.description.length}/5000 characters</p>
            </div>

            {/* Price and Category Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2.5 border rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.price ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                  value={product.price || ""}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  placeholder="49.99"
                />
                {validationErrors.price && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.price}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={product.category || ""}
                  onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  placeholder="Health & Wellness"
                  maxLength={100}
                />
              </div>
            </div>

            {/* Tone Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tone & Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setTone(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      tone === option.value
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    title={option.description}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {TONE_OPTIONS.find((t) => t.value === tone)?.description}
              </p>
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platforms
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(PLATFORM_CONFIG) as [Platform, typeof PLATFORM_CONFIG.twitter][]).map(
                  ([platform, config]) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => handlePlatformToggle(platform)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedPlatforms.includes(platform)
                          ? `${config.color} ${config.textColor} shadow-md`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.name}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="text-red-500 text-xl">!</span>
                  <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <button
              onClick={handleGeneratePosts}
              disabled={isLoading || !isFormValid}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate Posts"
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {posts.length > 0 ? "Generated Posts" : "Preview"}
            </h2>

            {posts.length === 0 && !isLoading && (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <div className="text-gray-400 text-6xl mb-4">📝</div>
                <p className="text-gray-500">
                  Fill in your product details and click "Generate Posts" to see your social media content here
                </p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4">
                {selectedPlatforms.map((platform) => (
                  <div
                    key={platform}
                    className="bg-white rounded-xl shadow-sm p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full" />
                      <div className="h-4 bg-gray-200 rounded w-5/6" />
                      <div className="h-4 bg-gray-200 rounded w-4/6" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {posts.length > 0 && (
              <div className="space-y-4">
                {posts.map((post, index) => {
                  const config = PLATFORM_CONFIG[post.platform];
                  const isOverLimit = post.content.length > config.maxLength;

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      {/* Platform Header */}
                      <div className={`${config.color} ${config.textColor} px-4 py-3 flex items-center justify-between`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{config.icon}</span>
                          <span className="font-medium">{config.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              isOverLimit ? "bg-red-500" : "bg-white/20"
                            }`}
                          >
                            {post.content.length}/{config.maxLength}
                          </span>
                        </div>
                      </div>

                      {/* Post Content */}
                      <div className="p-4">
                        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                          {post.content}
                        </p>

                        {isOverLimit && (
                          <p className="mt-2 text-sm text-red-600">
                            Warning: This post exceeds the {config.maxLength} character limit for {config.name}
                          </p>
                        )}

                        {/* Copy Button */}
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={() => handleCopyToClipboard(post.content, index)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            {copiedIndex === index ? (
                              <>
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Copied!
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
