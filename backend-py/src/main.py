from datetime import datetime
import os

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from .generate import generate_social_media_posts


app = FastAPI(title="Sintra Trial Task API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def home():
    return {"hello": "world", "timestamp": datetime.now().isoformat()}


@app.post("/api/generate")
async def generate_posts(request: Request):
    product = (await request.json())["product"]

    posts = await generate_social_media_posts(
        product["name"], product["description"], product["price"], product["category"]
    )

    return {
        "posts": posts,
        "generated_at": datetime.now().isoformat(),
        "count": len(posts),
    }


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 3001))

    uvicorn.run("src.main:app", host="0.0.0.0", port=port, reload=True)
