# Home Connect

Home Connect is a frontend-first experience marketplace that connects tourists with authentic local culture in Ethiopian homes. Hosts can publish cultural experiences, and guests can discover, explore, and book them.

## Features
- Curated cultural experiences with categories and rich cards
- “Become a Host” flow with required and optional details
- Location capture with meeting point and map preview
- Responsive layout with modern UI components

## Tech Stack
- React + Vite
- TypeScript
- Tailwind CSS
- Radix UI

## Getting Started

Install dependencies:
```bash
npm install
```

Run the client:
```bash
npm run dev:client
```

The app will be available at `http://localhost:5000`.

## Scripts
- `npm run dev:client` Start the Vite client on port 5000
- `npm run dev` Start the server (if used)
- `npm run build` Build the project
- `npm run start` Run the production build
- `npm run check` Typecheck

## Project Structure
- `client/` Frontend application
- `server/` Server (optional, currently not required for frontend-only features)
- `shared/` Shared types and schema

## Notes
- Listings are currently mocked in `client/src/lib/mockData.ts`.
- Host submissions are frontend-only.
