# Publishing Guide

This guide explains how to publish new versions of prismark to npm using Changesets.

## Setup (One-time)

### 1. Update Repository URL

Before publishing, update the repository URL in `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/prismark.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/prismark#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/prismark/issues"
  }
}
```

### 2. Configure NPM Token

1. Create an npm account if you don't have one: https://www.npmjs.com/signup
2. Generate an automation token:
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Select "Automation" token type
   - Copy the token

3. Add the token to GitHub:
   - Go to your repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### 3. Publish Access

Ensure you have publish access to the `prismark` package on npm. If the package doesn't exist yet, the first publish will create it.

## Publishing Workflow

### For Contributors

When making changes that should be included in a release:

1. **Make your changes** in a feature branch
2. **Create a changeset**:
   ```bash
   pnpm changeset
   ```

   You'll be prompted to:
   - Select the change type:
     - **major**: Breaking changes (1.0.0 → 2.0.0)
     - **minor**: New features, backwards compatible (1.0.0 → 1.1.0)
     - **patch**: Bug fixes, backwards compatible (1.0.0 → 1.0.1)
   - Enter a description of your changes

3. **Commit the changeset** along with your code changes:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push and create a PR**:
   ```bash
   git push origin feature-branch
   ```

### For Maintainers

#### Automated Publishing (Recommended)

1. **Review and merge PRs** with changesets
2. **Wait for the Version PR**: The GitHub Action will automatically create a "Version Packages" PR that:
   - Bumps the version in `package.json`
   - Updates `CHANGELOG.md`
   - Removes consumed changesets
3. **Review the Version PR**: Check that versions and changelog look correct
4. **Merge the Version PR**: This will automatically:
   - Publish to npm
   - Create a GitHub release
   - Tag the release

#### Manual Publishing (Alternative)

If you need to publish manually:

1. **Ensure all changesets are ready**:
   ```bash
   ls .changeset/*.md
   ```

2. **Update versions**:
   ```bash
   pnpm version
   ```

3. **Review the changes**:
   ```bash
   git diff
   ```

4. **Commit version changes**:
   ```bash
   git add .
   git commit -m "chore: version packages"
   git push
   ```

5. **Publish to npm**:
   ```bash
   pnpm release
   ```

## Version Guidelines

Follow [Semantic Versioning](https://semver.org/):

### Major (Breaking Changes)
- Removing features
- Changing APIs in backwards-incompatible ways
- Removing or renaming configuration options
- Changing default behavior significantly

Example changeset:
```markdown
---
"prismark": major
---

BREAKING: Remove support for Prisma v3. Now requires Prisma v4+.
```

### Minor (New Features)
- Adding new features
- Adding new configuration options
- Deprecating features (but not removing them)
- Backwards-compatible enhancements

Example changeset:
```markdown
---
"prismark": minor
---

Add support for @prismark.readonly annotation to mark fields as read-only.
```

### Patch (Bug Fixes)
- Bug fixes
- Documentation updates
- Performance improvements
- Internal refactoring

Example changeset:
```markdown
---
"prismark": patch
---

Fix incorrect type generation for optional DateTime fields.
```

## Troubleshooting

### Publishing fails with "You must be logged in to publish"

- Verify `NPM_TOKEN` is correctly set in GitHub secrets
- Ensure the token is an "Automation" token, not a "Classic" token
- Check that the token hasn't expired

### Publishing fails with "403 Forbidden"

- Verify you have publish access to the package
- If this is the first publish, ensure the package name is available on npm

### Version PR not created

- Check GitHub Actions logs in the "Actions" tab
- Ensure the workflow has proper permissions (should be set in the workflow file)
- Verify that changesets were properly committed

### Multiple changesets for one PR

This is fine! You can create multiple changesets if your PR contains multiple unrelated changes that should be documented separately.

## Best Practices

1. **Always create a changeset** for user-facing changes
2. **Write clear descriptions** - these go directly into the changelog
3. **Review version bumps** before merging the Version PR
4. **Keep changesets small** - one logical change per changeset
5. **Don't skip changesets** for bug fixes - users want to know what's fixed!

## Resources

- [Changesets Documentation](https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md)
- [Semantic Versioning](https://semver.org/)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
