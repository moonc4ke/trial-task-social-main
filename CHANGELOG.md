# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Input Validation**: Comprehensive validation on both frontend and backend
  - Product name: required, max 200 characters
  - Description: required, max 5000 characters
  - Price: required, must be non-negative
  - Category: optional, max 100 characters
- **Loading States**: Visual feedback during API calls with skeleton loaders
- **Error Handling**: Graceful error display with specific error messages
- **Copy to Clipboard**: One-click copy for each generated post
- **Tone Selection**: 5 tone options (Professional, Casual, Humorous, Inspirational, Urgent)
- **Platform Selection**: Toggle individual platforms for generation
- **Character Counter**: Real-time character count with platform-specific limits
- **Visual Post Cards**: Platform-branded cards with proper styling
- **Health Check Endpoint**: `/api/health` for monitoring
- **Web Research (Beta)**: Optional feature using OpenAI Responses API with web_search
  - Searches for trending topics related to the product
  - Finds relevant hashtags being used
  - Gathers market insights
  - Results displayed in dedicated section
  - Toggle to enable/disable research
- **Test Suite**: Comprehensive unit and integration tests using Vitest
  - Backend: 47 tests (validation, API endpoints, error handling)
  - Frontend: 39 tests (API client, validation utilities)

### Changed
- Redesigned UI with two-column layout (input/output)
- Improved prompt engineering for better post quality
- Enhanced API response structure with tone and platform metadata
- Better form UX with inline validation and character counts

### Fixed
- Price input no longer shows 0 by default
- API errors are now properly caught and displayed
- Invalid JSON responses from AI are handled gracefully

---

## Development Log

### Session Start
- Analyzed existing codebase structure
- Identified issues:
  - No input validation on frontend or backend
  - No loading states during API calls
  - No error handling for failed API requests
  - Price input defaults to 0 (poor UX)
  - Backend doesn't validate incoming requests
  - No try-catch blocks for API errors

### Implementation Phase 1: Backend Improvements
- Added validateProduct function with comprehensive checks
- Added Tone and Platform types
- Updated generateSocialMediaPosts to accept tone and platforms
- Improved prompt engineering with platform-specific guidelines
- Added error handling for OpenAI API errors
- Added health check endpoint

### Implementation Phase 2: Frontend Improvements
- Created ApiException class for better error handling
- Added loading state with skeleton loaders
- Added validation with inline error messages
- Added tone selection UI
- Added platform toggle UI
- Added copy to clipboard functionality
- Redesigned UI with cards and better visual hierarchy

### Implementation Phase 3: Web Research Feature
- Created webResearch.ts service using OpenAI Responses API
- Implemented web_search tool integration
- Added result parsing for trending topics and hashtags
- Integrated research results into post generation prompt
- Added frontend toggle for web research
- Created results display section
- Added beta badge to indicate experimental feature

### Implementation Phase 4: Testing
- Set up Vitest testing framework for both backend and frontend
- Created validation.ts module for testable validation logic
- Refactored server.ts to export app for integration testing

**Backend Tests (47 total):**
- Unit tests for validateProduct (30 tests)
  - Valid product acceptance
  - Missing field detection
  - Empty/whitespace value detection
  - Length limit enforcement
  - Price validation (negative, unrealistic, NaN)
  - Type validation
- Unit tests for validateTone (7 tests)
- Unit tests for validatePlatforms (6 tests)
- Integration tests for API endpoints (17 tests)
  - Health check endpoint
  - Generate endpoint validation
  - Successful generation with mocked OpenAI
  - Web research integration
  - Error handling (API errors, rate limits)

**Frontend Tests (39 total):**
- API client tests (11 tests)
  - Request formatting
  - Error handling
  - ApiException creation
  - Health check functionality
- Validation utility tests (28 tests)
  - validateProduct function
  - isFormValid function
  - formatPrice function
