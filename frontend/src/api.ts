interface Product {
  name: string;
  description: string;
  price: number;
  category?: string;
}

interface GeneratePostsResponse {
  posts: Array<{
    platform: "twitter" | "instagram" | "linkedin";
    content: string;
  }>;
  generated_at: string;
  count: number;
}

export async function generatePosts(
  product: Product
): Promise<GeneratePostsResponse> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/generate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product }),
    }
  );

  return response.json();
}
