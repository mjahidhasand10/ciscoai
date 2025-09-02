# AI Next.js Web Application

This is a modern web application built with [Next.js](https://nextjs.org/) and TypeScript. It features a modular structure, global styling, and an AI-powered API endpoint.

## Features

- **Next.js App Directory**: Uses the latest Next.js routing and layout features.
- **TypeScript**: Type-safe codebase for reliability and maintainability.
- **Global Styling**: Centralized CSS in [`app/globals.css`](app/globals.css).
- **AI API Endpoint**: Serverless API route at [`app/api/ai/route.ts`](app/api/ai/route.ts).
- **Reusable Components**: Organized in the [`components/`](components/) directory.
- **Utility Functions**: Shared logic in [`lib/utils.ts`](lib/utils.ts).

## What the AI Does

The AI endpoint (`/api/ai`) intelligently answers user queries about Cisco NX-OS commands and general topics:

- **Cisco Command Queries:**  
  When a user asks about a Cisco command (e.g., "show interface"), the AI:

  1. Detects the command type.
  2. Finds the relevant Cisco documentation page.
  3. Fetches and processes the documentation content.
  4. Uses a language model (OpenAI GPT-4o) to generate a structured, easy-to-read answer.  
     The response includes:
     - Command syntax
     - Description
     - Key parameters
     - Usage examples
     - Important notes

- **General Queries:**  
  For non-Cisco or conversational questions, the AI responds helpfully and professionally, mentioning its Cisco expertise and offering further assistance.

This enables users to get instant, well-organized answers about Cisco NX-OS commands or general networking topics, making the app useful for both

## Project Structure

```
app/
  globals.css         # Global styles
  layout.tsx          # Root layout component
  page.tsx            # Main page component
  api/
    ai/
      route.ts        # AI API route
components/           # Reusable React components
lib/
  utils.ts            # Utility functions
public/               # Static assets
types/                # TypeScript type definitions
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)

### Installation

```sh
pnpm install
```

### Development

```sh
pnpm dev
```

### Build

```sh
pnpm build
```

### Start

```sh
pnpm start
```

## Configuration

- Environment variables are managed in [`.env`](.env).
- Linting is configured via [`eslint.config.mjs`](eslint.config.mjs).
- TypeScript settings are in [`tsconfig.json`](tsconfig.json).
- Next.js configuration is in [`next.config.ts`](next.config.ts).

## License

See [LICENSE](LICENSE) for details.

---

For more information, see the source files:

- [app/layout.tsx](app/layout.tsx)
- [app/page.tsx](app/page.tsx)
- [app/api/ai/route.ts](app/api/ai/route.ts)
-
