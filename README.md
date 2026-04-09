# Punkt

Punkt is a production-oriented Expo + React Native starter for a social reading tracker. The codebase is bootstrapped for reading progress, yearly challenges, bookshelves, discovery, AI recommendations, and authentication-ready flows.

## Stack

- React Native
- Expo
- TypeScript
- Expo Router
- NativeWind
- TanStack Query
- Zustand
- React Hook Form
- Reanimated
- ESLint + Prettier
- Husky + lint-staged

## Architecture

The project uses a feature-first structure with clean separation between routes, shared UI, entities, services, and state.

```text
app/
  (tabs)/
features/
  auth/
  discover/
  library/
  profile/
  social/
entities/
components/
  atoms/
  molecules/
  organisms/
shared/
  lib/
  providers/
hooks/
services/
store/
constants/
types/
theme/
assets/
mocks/
design/
```

## Setup

1. Install Node 20.19.4 or newer.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` if you need to override API endpoints.

## Scripts

- `npm run dev` starts Expo with a clean cache.
- `npm run lint` runs ESLint.
- `npm run format` formats the repo with Prettier.
- `npm run typecheck` runs TypeScript in strict mode.
- `npm run build` exports the Expo web bundle for CI validation.

## Run locally

```bash
npm run dev
```

Then press `a`, `i`, or `w` in the Expo terminal to open Android, iOS, or web.

## Current implementation

- Expo Router tab navigation for Library, Discover, Friends, Messages, and Profile.
- Library screen with a reading challenge card, progress ring, segmented tabs, horizontal book shelves, and a floating action button.
- Theme tokens with dark mode support.
- Mock-first stores and service contracts prepared for backend integration.
- Design token JSON prepared for Figma-to-code token sync.

## Backend preparation

- `services/apiClient.ts` defines a shared fetch client.
- `services/books/*` contains adapters for Google Books, Open Library, NYT Books, and an Amazon placeholder.
- Authentication scaffolding lives in `features/auth/*` and `services/auth/*`.

## Notes

- Expo SDK 54 currently warns on older Node 20 patch releases. CI is pinned to Node 20.19.4 to avoid Metro engine mismatches.
- TODO markers in the codebase indicate the handoff points for real backend and mutation flows.
