# GitHub Copilot Instructions

## Codebase Context

Always reference the codebase documentation in `.planning/codebase/` for architectural decisions and implementation patterns:

- **[STACK.md](../.planning/codebase/STACK.md)** - Technologies, frameworks, dependencies
- **[ARCHITECTURE.md](../.planning/codebase/ARCHITECTURE.md)** - System design patterns and layers
- **[STRUCTURE.md](../.planning/codebase/STRUCTURE.md)** - Directory organization and file conventions
- **[CONVENTIONS.md](../.planning/codebase/CONVENTIONS.md)** - Code style, naming, error handling
- **[TESTING.md](../.planning/codebase/TESTING.md)** - Test patterns and practices
- **[INTEGRATIONS.md](../.planning/codebase/INTEGRATIONS.md)** - External services and APIs
- **[CONCERNS.md](../.planning/codebase/CONCERNS.md)** - Technical debt and known issues

## Development Guidelines

When working on this codebase:

1. **Follow existing patterns** documented in CONVENTIONS.md
2. **Match the architecture** described in ARCHITECTURE.md
3. **Follow testing practices** from TESTING.md
4. **Be aware of concerns** listed in CONCERNS.md before making changes

## Preferred Workflow

- Use GSD (Get Shit Done) workflow commands when available
- Reference codebase docs before planning new features
- Maintain consistency with established patterns
