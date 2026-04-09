# Contributing

## Workflow

1. Use Node 20.19.4 or newer for local work to match Expo SDK 54 and CI.
2. Create focused branches for each feature or refactor.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build` before opening a pull request.

## Architecture expectations

- Keep features isolated under `features/*`.
- Place reusable UI primitives in `components/*`.
- Route side effects and remote requests through `services/*`.
- Preserve strict typing and prefer exported types over inline object contracts.

## Commit quality

- Keep commits atomic.
- Avoid mixing refactors with feature work unless they are directly required.
- Maintain accessibility labels and touch targets for interactive elements.
