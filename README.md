# Sintra Trial Task

## Background

Small business owners spend hours writing social media posts for each platform. This tool helps them generate posts for Twitter, Instagram, and LinkedIn from a single product description.

Someone built a quick prototype using OpenAI's Completions API. It works, but it's rough around the edges.

Your job: make it better.

## The Task

Plan to spend at least 4 hours on this task. But you're welcome to invest more time if you feel it's needed.  
Please commit your work frequently with clear messages so we can follow your development process.

Use any tools you want - Cursor, Windsurf, Claude Code, GitHub Copilot, ChatGPT, v0, whatever you'd use on the job. This is about how you work in the real world, not a closed-book exam.

### Part 1: Fix and Improve

Focus on making the existing functionality reliable. Add proper validation, handle loading/error states, cover possible edge cases.

### Part 2: Extend

Build something that demonstrates real product thinking and technical execution. We want to see you go beyond the basics, yet prioritize things with highest impact.
Here are some ideas you can choose from:

**Fundamentals**:

- Copy to clipboard functionality
- Tone/style customization

**UX/UI:**

- Adopt better UI primitives
- Rethink the layout for a better user experience
- Add visual preview cards that resemble how posts will look like in the real world

**Full-Stack Features:**

- **Image Support**: Allow user to upload product images and generate posts that reference them
- **Web Research**: Use web_search from Responses API and add it somewhere in the workflow to improve UX
- **Your Choice**: Build any feature you think would add value for small business owners

Responses API reference: https://cookbook.openai.com/examples/responses_api/responses_example

## Backend Setup

```bash
cd backend-ts
npm install
cp .env.example .env  # Add your OPENAI_API_KEY
npm run dev
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Visit http://localhost:3000 to test it out.

## What to Submit

1. **GitHub Repository**: Create a GitHub repository with your solution and add `trial-sintra` as a collaborator

   - GitHub account to add: https://github.com/trial-sintra
   - Include full commit history

2. **Documentation**: Document your approach in a .md file, and optionally record a Loom video:

   - What you did and why
   - What you'd do with more time
   - Explain any tradeoffs you made
   - What tools did you use in the process

## What We're Looking For

- Code quality and structure
- Smart validation and edge case handling
- Features that add value for the end user
- Clear communication about your decisions

## Tips

- Start with the highest impact changes
- Think about the next developer who'll work on this
- Don't waste time

That's it. Show us how you approach real-world code.
