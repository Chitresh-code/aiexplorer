# Contributing to AIExplorer

Thank you for your interest in contributing to AIExplorer! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

- Be respectful and professional
- Welcome diverse perspectives
- Focus on the code, not the person
- Help others learn and grow

## Getting Started

### Fork and Clone

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/aiexplorer.git
cd AIExplorer

# Add upstream remote
git remote add upstream https://github.com/Chitresh-code/aiexplorer.git
```

### Setup Development Environment

```bash
# Install dependencies
npm install

# Create local env file
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Verify Setup

```bash
# All these should run successfully
npm run type-check
npm run lint
npm run format:check
npm run dev
```

## Development Workflow

### Create a Feature Branch

```bash
# Update main branch
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch with descriptive name
git checkout -b feature/my-feature-name
# or
git checkout -b fix/bug-description
```

### Commit Your Changes

Follow conventional commits format:

```bash
git commit -m "type(scope): description"
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

Examples:
```
feat(gallery): add search functionality
fix(api): handle null response correctly
docs: update API documentation
refactor(hooks): simplify useUseCases hook
test(validators): add email validation tests
```

### Push and Create Pull Request

```bash
# Push to your fork
git push origin feature/my-feature-name

# Go to GitHub and create a Pull Request
# Provide clear description of changes
```

## Code Standards

### TypeScript

- Use strict types throughout
- Avoid `any` type - use proper types or `unknown`
- Export type definitions for public APIs
- Add JSDoc comments for exported functions

```typescript
// ✅ Good
export interface UserProps {
  name: string;
  age: number;
}

/**
 * Displays user information
 * @param props - User properties
 * @returns Rendered user component
 */
export function UserCard({ name, age }: UserProps): JSX.Element {
  return <div>{name}</div>;
}

// ❌ Avoid
export function UserCard(props: any) {
  return <div>{props.name}</div>;
}
```

### Component Structure

Follow the component structure documented in [DEVELOPMENT.md](./docs/DEVELOPMENT.md):

1. Imports (external, internal, relative)
2. Type definitions
3. Component definition
4. Hooks and state
5. Event handlers
6. Render logic

### Naming Conventions

- Components: `PascalCase` (`UserCard.tsx`)
- Files: Lowercase with hyphens for multi-word (`user-card.tsx`)
- Functions: `camelCase` (`getUserData()`)
- Constants: `UPPER_SNAKE_CASE` (`API_BASE_URL`)
- Types/Interfaces: `PascalCase` (`UserProps`)

### API Integration

- Use functions from `lib/api.ts`
- Validate inputs using `lib/validators.ts`
- Use constants from `config/constants.ts`
- Log errors with `lib/error-utils.ts`

### Error Handling

Every API call should have proper error handling:

```typescript
try {
  const data = await fetchUseCases();
  setData(data);
  setError(null);
} catch (error) {
  logErrorTrace("Failed to fetch use cases", error);
  setError(ERROR_CONFIG.MESSAGES.LOAD_USECASES);
}
```

## Testing

### Before Submitting PR

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Check formatting
npm run format:check

# Or fix everything automatically
npm run validate:fix

# Run tests
npm test

# Test manually
npm run dev
```

### Writing Tests

Tests should cover:
- Component rendering
- User interactions
- Hook behavior
- Utility functions
- Validation logic
- Error handling

Example:

```typescript
describe("UserCard", () => {
  test("renders user name", () => {
    render(<UserCard name="John" age={30} />);
    expect(screen.getByText("John")).toBeInTheDocument();
  });

  test("handles click event", async () => {
    const onClick = jest.fn();
    render(<UserCard name="John" age={30} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Pull Request Guidelines

### PR Title

Use conventional commit format:
```
feat(scope): brief description
fix(scope): brief description
```

### PR Description

Provide:
1. **What**: Clear description of changes
2. **Why**: Reason for the changes
3. **How**: Brief overview of implementation
4. **Checklist**: Self-review items

Template:
```markdown
## What
Brief description of changes

## Why
Explain the motivation and context

## How
Overview of implementation approach

## Type of Change
- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## Checklist
- [ ] Code follows style guidelines
- [ ] Type checking passes (`npm run type-check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting is correct (`npm run format:check`)
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if needed)
- [ ] No console.log left in code
- [ ] No breaking changes
- [ ] Tested in development mode

## Screenshots/Videos (if applicable)
Add screenshots or videos of the changes if UI-related
```

## Documentation

### Update Documentation For:

- New features in `docs/`
- API changes in `docs/API.md`
- Architecture changes in `docs/ARCHITECTURE.md`
- Development patterns in `docs/DEVELOPMENT.md`

### Documentation Standards

- Clear and concise language
- Code examples where applicable
- Keep it up-to-date with code
- Add JSDoc comments to functions

## Performance Considerations

When submitting changes:

- Check bundle size impact
- Avoid unnecessary re-renders
- Use React.memo for expensive components
- Consider lazy loading for heavy components
- Use efficient algorithms

## Security

- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized queries
- Escape HTML content
- Keep dependencies updated

## Review Process

Maintainers will:
1. Check code quality and style
2. Verify tests and type checking
3. Review for security issues
4. Request changes if needed
5. Merge when approved

### Responding to Feedback

- Be open to suggestions
- Explain your reasoning if you disagree
- Update code promptly
- Push new commits to address feedback
- Request re-review when ready

## Common Issues

### ESLint Errors

```bash
# Auto-fix ESLint issues
npm run lint:fix
```

### TypeScript Errors

```bash
# Check types
npm run type-check

# Review error messages and fix accordingly
```

### Formatting Issues

```bash
# Auto-format code
npm run format
```

### Merge Conflicts

```bash
# Update from upstream
git fetch upstream
git rebase upstream/main

# Resolve conflicts in files, then
git add .
git rebase --continue
git push origin feature/my-feature -f
```

## Getting Help

- **Questions**: Open a discussion on GitHub
- **Bugs**: Create an issue with reproduction steps
- **Features**: Discuss in issues before starting work
- **Documentation**: Clarify in docs directory

## Recognition

Contributors are recognized in:
- Commit history
- Release notes
- Contributors list (coming soon)

## License

By contributing to AIExplorer, you agree that your contributions will be licensed under the same license as the project.

## Questions?

Ask in:
1. GitHub Discussions
2. GitHub Issues
3. Pull Request comments

Thank you for contributing! 🙏
