# Solution Documentation

## Overview

This document describes the improvements and features added to the Social Media Post Generator during this trial task.

## What I Did and Why

### Part 1: Fix and Improve

#### 1. Input Validation (Frontend + Backend)

**Why:** The original application accepted any input without validation, which could lead to poor AI outputs or API errors.

**Implementation:**
- **Backend:** Added `validateProduct()` function in `server.ts` that validates:
  - Product name: Required, max 200 characters
  - Description: Required, max 5000 characters
  - Price: Required, must be non-negative, reasonable upper limit
  - Category: Optional, max 100 characters

- **Frontend:** Added inline validation with error messages and character counters. Form submission is blocked until all required fields are valid.

#### 2. Loading States and Error Handling

**Why:** Users had no feedback during API calls and no graceful error handling.

**Implementation:**
- Added `isLoading` state with animated spinner
- Added skeleton loaders that match the expected output layout
- Created `ApiException` class for structured error handling
- Display user-friendly error messages with specific details
- Handled specific OpenAI API errors (rate limiting, invalid key, etc.)

#### 3. Edge Cases

**Why:** The price input defaulted to 0, making the form confusing.

**Implementation:**
- Price input shows empty until user enters a value
- Added proper number parsing with NaN handling
- Backend validates for unrealistic values

### Part 2: Extend

#### 1. Copy to Clipboard

**Why:** Users need to easily copy generated posts to paste into social media platforms.

**Implementation:**
- One-click copy button on each post card
- Visual feedback ("Copied!") with checkmark icon
- Fallback for older browsers using `document.execCommand`

#### 2. Tone/Style Customization

**Why:** Different businesses need different voices - a law firm needs professional tone, while a coffee shop might want something casual.

**Implementation:**
- 5 tone options: Professional, Casual, Humorous, Inspirational, Urgent
- Each tone has specific instructions in the AI prompt
- Toggle UI with descriptions of what each tone produces
- Default: Professional

#### 3. Visual Preview Cards

**Why:** Users should see how posts will appear on each platform, not just raw text.

**Implementation:**
- Platform-branded headers (Twitter black, Instagram gradient, LinkedIn blue)
- Character count with limit warnings
- Warning when posts exceed platform limits
- Platform-specific styling that mimics real social media cards

#### 4. Platform Selection

**Why:** Not all businesses use all platforms.

**Implementation:**
- Toggle buttons for each platform
- At least one platform must be selected
- Only generates posts for selected platforms

#### 5. Web Research (Beta)

**Why:** Adding current trends and hashtags makes posts more relevant and engaging.

**Implementation:**
- Uses OpenAI's Responses API with `web_search` tool
- Searches for trending topics and hashtags related to the product
- Parses results to extract useful insights
- Integrates findings into the post generation prompt
- Optional toggle - doesn't block generation if disabled or fails

## Technical Decisions

### Backend: TypeScript (backend-ts)

I chose the TypeScript backend because:
- Better type safety for complex data structures
- Familiar ecosystem for Node.js developers
- Direct compatibility with frontend types

### Architecture

- **Separation of concerns:** API handling (server.ts), generation logic (generate.ts), OpenAI integration (openai.ts), web research (webResearch.ts)
- **Error handling:** Graceful degradation - web research failures don't block post generation
- **Type safety:** Shared types between components, validation at API boundaries

### UI/UX Decisions

- **Two-column layout:** Input on left, output on right - natural reading flow
- **Immediate feedback:** Character counters, validation errors as you type
- **Progressive disclosure:** Advanced features (web research) in collapsible/toggle sections
- **Visual hierarchy:** Platform-colored headers help identify posts quickly

## Testing

### Test Framework: Vitest

I chose Vitest because:
- Fast execution with native ESM support
- Compatible with both Node.js (backend) and happy-dom (frontend)
- Easy mocking capabilities
- Good TypeScript support out of the box

### Backend Tests (47 tests)

Located in `backend-ts/tests/`:

**Unit Tests** (`tests/unit/`)
- **validation.test.ts** (30 tests) - Tests for validation functions
  - `validateProduct()`: valid products, missing fields, empty values, length limits, price validation, type validation
  - `validateTone()`: valid and invalid tone values
  - `validatePlatforms()`: platform array validation

**Integration Tests** (`tests/integration/`)
- **api.test.ts** (17 tests) - API endpoint tests using supertest
  - Health check endpoint
  - Generate endpoint validation errors
  - Successful generation with mocked OpenAI
  - Web research integration
  - Error handling (API errors, rate limits)

Run backend tests:
```bash
cd backend-ts
npm test              # Run all tests
npm run test:unit     # Run only unit tests
npm run test:integration  # Run only integration tests
```

### Frontend Tests (39 tests)

Located in `frontend/tests/`:

**Unit Tests** (`tests/unit/`)
- **api.test.ts** (11 tests) - API client tests
  - Request formatting and parameters
  - Error handling and ApiException
  - Health check functionality

- **validation.test.ts** (28 tests) - Validation utility tests
  - `validateProduct()`: name, description, price validation
  - `isFormValid()`: form state validation
  - `formatPrice()`: price string parsing

Run frontend tests:
```bash
cd frontend
npm test              # Run all tests
npm run test:unit     # Run only unit tests
npm run test:integration  # Run only integration tests (when added)
```

### Test Coverage

Both test suites cover:
- Happy path scenarios
- Edge cases (empty strings, whitespace, boundary values)
- Error conditions (API failures, validation errors, rate limits)
- Type safety (invalid types, null/undefined)

## What I'd Do With More Time

1. **Image Upload Support:** Allow users to upload product images and reference them in posts
2. **Post History:** Save generated posts for later reference
3. **A/B Variants:** Generate multiple variants for the same platform
4. **Scheduled Posting:** Integrate with social media APIs for direct posting
5. **Analytics:** Track which posts perform best
6. **Templates:** Pre-built templates for common industries
7. **Multi-language Support:** Generate posts in different languages
8. **Caching:** Cache web research results to reduce API calls
9. **Rate Limiting:** Add request rate limiting for production use
10. **E2E Tests:** Add Playwright or Cypress for end-to-end testing

## Tradeoffs Made

1. **Web Research as Beta:** The Responses API with web_search is powerful but adds latency. Made it opt-in so users can choose speed vs. relevance.

2. **Client-side Validation:** Duplicated some validation logic between frontend and backend for better UX, accepting the maintenance overhead.

3. **Skeleton Loaders vs Progress:** Chose skeleton loaders over progress bars because post generation time is unpredictable.

4. **No Database:** Kept it stateless for simplicity, accepting that there's no history or persistence.

5. **No Authentication:** Skipped auth to focus on core functionality, would add for production.

## Tools Used

- **Claude Code:** Primary development tool for implementation
- **OpenAI API:** GPT-4o for post generation, Responses API for web research
- **Next.js 15:** Frontend framework
- **Express:** Backend framework
- **Tailwind CSS:** Styling
- **Vitest:** Testing framework for both frontend and backend
- **Supertest:** HTTP assertion library for API integration tests
- **happy-dom:** Lightweight DOM implementation for frontend tests

## File Structure

```
backend-ts/
  src/
    server.ts      - Express app, routes, imports validation
    validation.ts  - Product, tone, platform validation functions
    generate.ts    - Post generation logic, prompts
    openai.ts      - OpenAI client, API calls
    webResearch.ts - Web search integration
    types.ts       - Shared TypeScript types
    config.ts      - Platform configurations
  tests/
    unit/
      validation.test.ts - Unit tests for validation functions
    integration/
      api.test.ts        - Integration tests for API endpoints
  vitest.config.ts       - Vitest configuration

frontend/
  src/
    api.ts         - API client with error handling
    validation.ts  - Frontend validation utilities
    app/
      page.tsx     - Main application component
      layout.tsx   - App layout
      globals.css  - Global styles
  tests/
    unit/
      api.test.ts        - API client unit tests
      validation.test.ts - Validation utility tests
    integration/
      (future integration tests)
    setup.ts             - Test setup file
  vitest.config.ts       - Vitest configuration
```

## Running the Application

```bash
# Backend
cd backend-ts
cp .env.example .env  # Add your OPENAI_API_KEY
npm install
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit http://localhost:3000 to use the application.

## Running Tests

```bash
# Backend tests (47 tests)
cd backend-ts
npm test

# Frontend tests (39 tests)
cd frontend
npm test

# Watch mode for development
npm run test:watch
```

Total: **86 tests** across both frontend and backend.
