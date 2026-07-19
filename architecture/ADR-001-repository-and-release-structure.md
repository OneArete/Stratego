# ADR-001 — Repository and Release Structure

**Status:** Accepted  
**Decision:** During the current GitHub Pages phase, the executable Strategos application remains at repository root to avoid breaking deployment. Canon and architecture assets live beside it in `/canon` and `/architecture`.

## Rationale

The existing application is already deployed from the repository root. Moving it immediately into `/app` would require a Pages/build migration and creates risk without product value. The conceptual target remains a repository with a dedicated application directory when the build pipeline is introduced.

## Consequences

- Current ZIP releases can replace the existing repository contents directly.
- Canon and ADRs are preserved in the same repository.
- A later ADR will govern migration to `/app` together with an automated deployment workflow.
