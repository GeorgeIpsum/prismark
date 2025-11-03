# Commit Message Conventions

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification.

## Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: The type of change (required)
- **scope**: The area of the codebase affected (optional)
- **subject**: Short description (required, max 100 chars)
- **body**: Detailed description (optional)
- **footer**: Breaking changes, issue references (optional)

## Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat: add support for @prisma-arktype.readonly` |
| `fix` | Bug fix | `fix: resolve null handling in DateTime fields` |
| `docs` | Documentation only | `docs: add examples for annotations` |
| `style` | Code style/formatting | `style: format with biome` |
| `refactor` | Code refactoring | `refactor: simplify type generation logic` |
| `perf` | Performance improvement | `perf: optimize schema compilation` |
| `test` | Adding/updating tests | `test: add coverage for enum generation` |
| `build` | Build system changes | `build: update dependencies` |
| `ci` | CI/CD changes | `ci: add caching to workflow` |
| `chore` | Other changes | `chore: update .gitignore` |
| `revert` | Revert previous commit | `revert: "feat: add feature X"` |

## Examples

### Simple commit
```bash
git commit -m "feat: add where clause validation"
```

### With scope
```bash
git commit -m "fix(generator): handle optional relations correctly"
```

### With body and footer
```bash
git commit -m "feat: add custom validator support

Allow users to specify custom ArkType validators using @prisma-arktype.validator annotation.

Closes #123"
```

### Breaking change
```bash
git commit -m "feat!: change annotation syntax

BREAKING CHANGE: Annotation syntax now uses JSON format instead of key-value pairs.
Migrate old annotations using the migration script."
```

## Git Hooks

### commit-msg
Validates that your commit message follows the convention.

**What it checks:**
- Message has a valid type
- Subject is not empty
- Header is not longer than 100 characters
- Subject case follows convention

**To skip (not recommended):**
```bash
git commit --no-verify -m "your message"
```

### pre-commit
Runs before each commit to ensure code quality.

**What it does:**
- Runs `pnpm lint:fix` and auto-stages fixed files
- Checks for `console.log` and `debugger` statements

**To skip:**
```bash
git commit --no-verify
```

### pre-push
Runs before pushing to remote.

**What it does:**
- Runs the full test suite

**To skip:**
```bash
git push --no-verify
```

## Troubleshooting

### Commit rejected with "type may not be empty"
Make sure your commit message starts with a valid type:
```bash
# ❌ Bad
git commit -m "added new feature"

# ✅ Good
git commit -m "feat: add new feature"
```

### Commit rejected with "subject may not be empty"
Ensure you have a subject after the colon:
```bash
# ❌ Bad
git commit -m "feat:"

# ✅ Good
git commit -m "feat: add validation"
```

### Commit rejected with "subject must not be sentence-case"
Don't capitalize the first letter or use periods:
```bash
# ❌ Bad
git commit -m "feat: Add new feature."

# ✅ Good
git commit -m "feat: add new feature"
```

### Pre-commit hook failing
Check the error message:
- **Lint errors**: Fix them with `pnpm lint:fix`
- **Debug statements**: Remove `console.log` or `debugger`
- **Need to commit anyway**: Use `--no-verify` (sparingly!)

## Tips

1. **Keep it concise**: Subject should be 50 chars or less ideally
2. **Use imperative mood**: "add feature" not "added feature"
3. **Don't end with period**: Subject line shouldn't end with `.`
4. **Reference issues**: Use `Closes #123` or `Fixes #456` in body
5. **Breaking changes**: Use `!` after type or `BREAKING CHANGE:` in footer
6. **Create changeset**: Remember to run `pnpm changeset` for user-facing changes!

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Semantic Versioning](https://semver.org/)
