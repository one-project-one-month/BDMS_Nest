# Gemini Instructions

This file contains foundational mandates for Gemini CLI when working on the BDMS Nest project. These instructions take precedence over general defaults.

## Codebase Context

Always reference the codebase documentation in `.planning/codebase/` for architectural decisions and implementation patterns:

- **[.planning/codebase/STACK.md](.planning/codebase/STACK.md)** - Technologies, frameworks, dependencies
- **[.planning/codebase/ARCHITECTURE.md](.planning/codebase/ARCHITECTURE.md)** - System design patterns and layers
- **[.planning/codebase/STRUCTURE.md](.planning/codebase/STRUCTURE.md)** - Directory organization and file conventions
- **[.planning/codebase/CONVENTIONS.md](.planning/codebase/CONVENTIONS.md)** - Code style, naming, error handling
- **[.planning/codebase/TESTING.md](.planning/codebase/TESTING.md)** - Test patterns and practices
- **[.planning/codebase/INTEGRATIONS.md](.planning/codebase/INTEGRATIONS.md)** - External services and APIs
- **[.planning/codebase/CONCERNS.md](.planning/codebase/CONCERNS.md)** - Technical debt and known issues

## Development Guidelines

When working on this codebase:

1. **Follow existing patterns** documented in `CONVENTIONS.md`.
2. **Match the architecture** described in `ARCHITECTURE.md`.
3. **Follow testing practices** from `TESTING.md`.
4. **Be aware of concerns** listed in `CONCERNS.md` before making changes.

## Preferred Workflow

- Use GSD (Get Shit Done) workflow commands when available.
- Reference codebase docs before planning new features.
- Maintain consistency with established patterns.

## Implementation Process

When asked to implement features or make changes:

### Phase 1: Planning

1. **Create/Update planning doc** - Create or update `docs/{feature-name}/planning.md` using these required sections:
   - Feature overview
   - API design
   - Data model
   - Folder structure
   - Trade-offs
   - Step-by-step implementation plan
2. **Show plan summary** - Present the plan to user.
3. **Ask for approval** - Wait for confirmation before proceeding.

### Phase 2: Step-by-Step Execution

For each step in the plan:

1. **Execute step** - Make the code changes for one task.
2. **Show changes** - Display what files were modified and what changed.
3. **Ask permission** - "Continue to next step?"
4. **Ask about commit** - "Commit these changes?"
   - If **Yes**: Create atomic commit with descriptive message.
   - If **No**: Stage changes but don't commit, continue to next step.

### Phase 3: Completion

1. **Report summary**:
   - All files changed.
   - What was implemented.
   - Test results (if applicable).
   - Any issues or considerations.
2. **Suggest next steps** - Testing, documentation, or related features.

## Agent Instructions

Gemini should:

- Always load and follow the plan from `docs/{feature-name}/planning.md`.
- Never skip the permission step between tasks.
- Provide clear diffs or summaries of changes made.
- Respect the commit preference for each step.
- Stop immediately if user says "stop" or "pause".
