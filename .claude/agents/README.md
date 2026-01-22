# Development Workflow Agents

Reusable Claude Code agents for common development tasks. These are general-purpose and work across any codebase.

## Available Agents

| Agent                      | Purpose                          | Invoke With                   |
| -------------------------- | -------------------------------- | ----------------------------- |
| **PR Review**              | Review code changes for issues   | `Review my staged changes`    |
| **Test Generator**         | Create comprehensive test suites | `Generate tests for [file]`   |
| **Architecture Explainer** | Understand how code works        | `Explain how [feature] works` |

## How to Use

### Option 1: Natural Language (Recommended)

Just ask Claude Code directly:

```
Review the diff between main and my current branch
```

```
Generate tests for src/services/PaymentService.ts
```

```
Explain the authentication flow in this codebase
```

Claude will use appropriate tools and follow good practices.

### Option 2: Reference the Agent File

For more structured output, reference the agent definition:

```
Read .claude/agents/pr-review.md and use it to review my staged changes
```

This ensures Claude follows the exact output format and checklist.

### Option 3: Include in CLAUDE.md

Add to your project's CLAUDE.md:

```markdown
## Available Agents

When asked to review code, generate tests, or explain architecture,
reference the agent definitions in `.claude/agents/` for structured approaches.
```

## Customizing Agents

Edit the agent files to:

- Add project-specific patterns to check
- Modify output formats
- Add or remove review categories
- Include your testing conventions

## Adding New Agents

Create a new `.md` file with:

1. **Role** - What the agent does
2. **How to Invoke** - Example prompts
3. **Behavior** - Step-by-step process
4. **Output Format** - Expected structure
5. **Tools** - Which Claude Code tools to use
