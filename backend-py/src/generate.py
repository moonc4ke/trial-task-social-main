from .openai import call_openai


POST_COUNT = 5


async def generate_social_media_posts(
    product_name: str,
    product_description: str,
    product_price: float,
    product_category: str,
):
    prompt = build_prompt(
        product_name, product_description, product_price, product_category
    )

    posts = await call_openai(prompt)

    return posts


def build_prompt(
    product_name: str,
    product_description: str,
    product_price: float,
    product_category: str,
) -> str:
    return f"""Generate ${POST_COUNT} social media posts for this product:

Product: {product_name}
Description: {product_description}
Price: ${product_price}
{f"Category: {product_category}" if product_category else ""}

Format each post as:
Platform: Content

Include posts for Twitter, Instagram, and LinkedIn. Use emojis and make them engaging.

Return response as JSON object, where the key is "posts" and the value is an array of objects.
Each object should have "platform" and "content" properties.
"""
