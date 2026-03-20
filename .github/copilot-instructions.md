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

## Implementation Process

When asked to implement features or make changes:

### Phase 1: Planning
1. **Create plan file** - Generate a detailed plan in session workspace (`~/.copilot/session-state/.../plan.md`) with:
   - Overview of changes
   - List of files to create/modify
   - Step-by-step tasks with clear descriptions
   - Dependencies between steps
2. **Show plan summary** - Present the plan to user
3. **Ask for approval** - Wait for confirmation before proceeding

### Phase 2: Step-by-Step Execution
For each step in the plan:
1. **Execute step** - Make the code changes for one task
2. **Show changes** - Display what files were modified and what changed
3. **Ask permission** - "Continue to next step?"
4. **Ask about commit** - "Commit these changes?"
   - If **Yes**: Create atomic commit with descriptive message
   - If **No**: Stage changes but don't commit, continue to next step

### Phase 3: Completion
1. **Report summary**:
   - All files changed
   - What was implemented
   - Test results (if applicable)
   - Any issues or considerations
2. **Suggest next steps** - Testing, documentation, or related features

### Agent Instructions
Agents reading this file should:
- Always load and follow the plan from session workspace
- Never skip the permission step between tasks
- Provide clear diffs or summaries of changes made
- Respect the commit preference for each step
- Stop immediately if user says "stop" or "pause"
