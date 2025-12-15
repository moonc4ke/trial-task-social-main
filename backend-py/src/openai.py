import os
import json

from openai import AsyncOpenAI
from openai.types.shared_params import (
    ResponseFormatJSONObject,
)


client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def call_openai(prompt: str) -> list:
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "user", "content": prompt},
        ],
        response_format=ResponseFormatJSONObject(
            type="json_object",
        ),
    )

    content = response.choices[0].message.content

    if content:
        return json.loads(content)["posts"]

    return []
