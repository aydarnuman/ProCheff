# ProCheff - AI Coding Agent Instructions

## Project Overview
ProCheff is a web application with a modular architecture consisting of client-side React components and a server component. The project follows a clean separation between frontend UI logic, reusable business logic, server functionality, and shared utilities.

## Architecture & Structure

### Directory Layout
- `ProCheff/components/` - React UI components (pages, layouts, forms, etc.)
- `ProCheff/hooks/` - Custom React hooks for state management and side effects  
- `ProCheff/server/` - Backend server logic with static assets in `public/`
- `ProCheff/utils/` - Shared utility functions and helper modules

### Key Patterns
- **Component Organization**: Components should be self-contained with clear props interfaces
- **Hook Usage**: Extract reusable stateful logic into custom hooks rather than duplicating in components
- **Server-Client Separation**: Server logic is isolated from client components for clean deployment boundaries
- **Utility Functions**: Pure functions for data transformation, validation, and common operations

## Development Guidelines

### File Naming & Organization
- Use PascalCase for React components (`UserProfile.jsx`, `RecipeCard.tsx`)
- Use camelCase for hooks (`useRecipeData.js`, `useAuthState.ts`)
- Use camelCase for utilities (`formatDate.js`, `apiHelpers.ts`)
- Group related functionality in subdirectories when appropriate

### Code Conventions
- Prefer functional components with hooks over class components
- Use custom hooks to encapsulate complex state logic and API interactions
- Keep components focused on presentation, move business logic to hooks or utils
- Server endpoints should handle one concern per route/handler

### Dependencies & Integration
- Client components communicate with server via API endpoints
- Shared utilities can be imported by both client and server code
- Static assets are served from `server/public/`

## Key Implementation Areas

### Components (`ProCheff/components/`)
Focus on:
- Reusable UI components with clear prop interfaces
- Form handling and user input validation
- Recipe display and management interfaces
- Navigation and layout components

### Hooks (`ProCheff/hooks/`)
Focus on:
- Data fetching and caching strategies
- Form state management
- Authentication state handling
- Recipe management operations

### Server (`ProCheff/server/`)
Focus on:
- API endpoints for recipe CRUD operations
- User authentication handling
- File upload/management for recipe images
- Database interactions and data persistence

### Utils (`ProCheff/utils/`)
Focus on:
- Recipe data validation and formatting
- Date/time utilities for cooking times
- Image processing helpers
- API response formatting

## Development Workflow
- Components should be developed with reusability in mind
- Test hooks independently from components when possible
- Server endpoints should handle errors gracefully and return consistent response formats
- Utils should be pure functions that are easy to test and reason about