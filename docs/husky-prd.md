# Product Requirements Document: Husky Pre-commit Hooks

**Version:** 1.0
**Last Updated:** October 14, 2025
**Status:** Template for Node.js/TypeScript Projects

---

## Executive Summary

Implement a local git hooks system using Husky to catch code quality, type, and build issues **before** they reach CI/CD pipelines, reducing feedback time from 5+ minutes to 2-10 seconds and preventing broken commits from entering version control.

**Applicable to:** Any Node.js/TypeScript project using npm/pnpm/yarn with ESLint, Prettier, and TypeScript.

---

## Quick Start Guide

**Prerequisites:** Node.js 16+, Git 2.x+, existing ESLint/Prettier/TypeScript setup

```bash
# 1. Install dependencies
<pm> add -D husky lint-staged

# 2. Initialize Husky
<pm> exec husky init

# 3. Create hook files (see Configuration Reference below)
# - Copy .husky/pre-commit script
# - Copy .husky/pre-push script
# - Replace <pm> with your package manager (npm/pnpm/yarn)

# 4. Add lint-staged config to package.json

# 5. Make executable (Linux/macOS)
chmod +x .husky/pre-commit .husky/pre-push

# 6. Test
git add . && git commit -m "test: Verify hooks working"
```

**Note:** Replace `<pm>` throughout this document with your package manager: `npm`, `pnpm`, or `yarn`.

---

## Problem Statement

### Current Pain Points
1. **Slow feedback loop**: Waiting 5+ minutes for CI/CD to report simple linting/formatting errors
2. **Broken commits**: Type errors and build failures only discovered after pushing to remote
3. **Wasted CI/CD resources**: Pipeline runs failing on preventable issues
4. **Developer frustration**: Context switching while waiting for remote checks

### Impact
- **Time waste**: ~4min 50s per failed commit caught only in CI/CD
- **Reduced productivity**: Broken commits block other developers
- **CI/CD costs**: Unnecessary pipeline executions for trivial errors

---

## Goals & Objectives

### Primary Goals
1. **Immediate feedback**: Catch 90% of issues locally within 2-10 seconds
2. **Auto-fix philosophy**: Automatically fix linting/formatting when possible
3. **Fail-fast**: Block commits/pushes with unfixable errors (type errors, build failures)
4. **Developer experience**: Minimal friction, maximum value

### Success Metrics
- ✅ Pre-commit checks complete in < 10 seconds
- ✅ Pre-push checks complete in < 60 seconds
- ✅ 90% of CI/CD failures prevented locally
- ✅ Zero false positives blocking valid commits

---

## Technical Requirements

### Dependencies
- **Husky** `^9.x`: Git hooks manager
- **lint-staged** `^15.x`: Run linters on staged files only
- **Existing tools**: ESLint, Prettier, TypeScript
- **Package manager**: npm, pnpm, or yarn

### Compatibility
- **Node.js**: 18+ recommended (minimum 16+)
- **Package manager**: npm, pnpm, or yarn (examples use `<pm>` placeholder)
- **Git**: 2.x+
- **OS**: Linux, macOS, Windows (cross-platform)

---

## Feature Specifications

### Feature 1: Pre-commit Hook (Fast Local Checks)

**Purpose**: Catch and auto-fix common issues on staged files only

**Checks:**
1. **Lint-staged** (2-5 seconds)
   - ESLint with `--fix` flag (auto-fixes issues)
   - Prettier with `--write` flag (auto-formats)
   - Only runs on staged files matching configured patterns
   - Configurable file types (default: `.ts`, `.tsx`, `.js`, `.jsx`, `.json`, `.md`, `.yaml`, `.yml`)

2. **TypeScript Strict Check** (3-8 seconds)
   - `tsc --noEmit --pretty` or `npx tsc --noEmit`
   - Strict mode type checking (configure in `tsconfig.json`)
   - Runs on entire project (requires full context)
   - **Blocking**: Fails commit if type errors exist

**User Experience:**
```bash
$ git commit -m "feat: Add new feature"
🔍 Running pre-commit checks...
  → Linting and formatting staged files...
  → Type checking (strict mode)...
✅ Pre-commit checks passed!
[main abc1234] feat: Add new feature
 3 files changed, 42 insertions(+), 5 deletions(-)
```

**Edge Cases:**
- Warnings (lint): Don't block commit, just display
- Errors (type/lint): Block commit, display fixes needed
- Auto-fixed files: Re-stage automatically via lint-staged

---

### Feature 2: Pre-push Hook (Comprehensive Checks)

**Purpose**: Final validation before code reaches remote repository

**Checks:**
1. **Full Lint** (5-10 seconds)
   - `<pm> run lint` on all files
   - Warnings don't block push

2. **Build Verification** (20-40 seconds)
   - `<pm> run build`
   - **Blocking**: Fails push if build errors
   - Catches issues missed by type check alone

3. **Security Audit** (5-10 seconds)
   - `npm audit` / `pnpm audit` / `yarn audit`
   - Informational only, doesn't block
   - Configure severity threshold as needed

4. **Secret Detection** (< 1 second)
   - Basic grep for `.env`, `.key`, `.pem`, `.credentials` files
   - Warns user, prompts for confirmation
   - Optional: Integrate advanced tools (gitleaks, detect-secrets)

**User Experience:**
```bash
$ git push origin main
🛡️  Running pre-push checks...
  → Full lint check...
  → Build verification...
  → Security audit...
  → Secret detection...
✅ Pre-push checks passed!
Enumerating objects: 5, done.
```

---

## Implementation Plan

### Phase 1: Core Setup
- [ ] Install Husky and lint-staged: `<pm> add -D husky lint-staged`
- [ ] Initialize Husky: `<pm> exec husky init` or `npx husky init`
- [ ] Create `.husky/pre-commit` script (see Configuration Reference)
- [ ] Create `.husky/pre-push` script (see Configuration Reference)
- [ ] Configure `lint-staged` in package.json (see Configuration Reference)
- [ ] Make hooks executable: `chmod +x .husky/pre-commit .husky/pre-push` (Linux/macOS)

### Phase 2: Testing & Validation
- [ ] Test pre-commit with intentional lint errors (should auto-fix)
- [ ] Test pre-commit with TypeScript errors (should block)
- [ ] Test pre-push with build failures (should block)
- [ ] Test pre-push with security issues (should warn)
- [ ] Verify auto-fix behavior
- [ ] Document edge cases specific to your project

### Phase 3: Future Enhancements (Optional)
- [ ] Integrate test suite in pre-push (Vitest/Jest/Mocha)
- [ ] Add coverage threshold check (configurable percentage)
- [ ] Advanced secret detection (gitleaks, detect-secrets)
- [ ] Commit message linting (commitlint, conventional commits)
- [ ] Performance benchmarks (Lighthouse CI for web projects)

---

## Tool Mapping (Python → TypeScript)

Based on Chris Hayuk's expert patterns:

| Python Tool | TypeScript Equivalent | Purpose |
|-------------|----------------------|---------|
| `ruff check --fix` | `eslint --fix` | Linting with auto-fix |
| `ruff format` | `prettier --write` | Code formatting |
| `mypy --strict` | `tsc --noEmit` | Strict type checking |
| `pytest -m "not slow"` | `vitest run` | Fast unit tests (TODO) |
| `pytest --cov --cov-fail-under=80` | `vitest --coverage` | Coverage threshold (TODO) |
| `detect-secrets` | Basic grep patterns | Secret detection |
| `bandit/safety` | `pnpm audit` | Security scanning |

---

## Architecture Decisions

### Why Husky over alternatives?
- **Industry standard**: 10M+ weekly npm downloads
- **Simple configuration**: Single `.husky/` folder
- **Framework agnostic**: Works with any Node.js project
- **Active maintenance**: Regular updates, Husky v9 released 2024

### Why lint-staged?
- **Performance**: Only checks staged files (vs all files)
- **Auto-staging**: Re-stages auto-fixed files automatically
- **Flexible**: Supports any linter/formatter

### Why multi-stage approach?
- **Pre-commit** (fast 2-10s): Catches 80% of issues
- **Pre-push** (comprehensive 30-60s): Catches remaining 20% + build errors
- **Balance**: Speed vs thoroughness

---

## Configuration Reference

### `.husky/pre-commit`
```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running pre-commit checks..."

# Replace <pm> with your package manager: npm/pnpm/yarn
<pm> exec lint-staged || {
  echo "❌ Lint-staged failed. Fix errors above."
  exit 1
}

# TypeScript check (use npx if tsc not in scripts)
<pm> exec tsc --noEmit --pretty || {
  echo "❌ Type check failed. Fix type errors above."
  exit 1
}

echo "✅ Pre-commit checks passed!"
```

### `.husky/pre-push`
```bash
#!/usr/bin/env sh
. "$(dirname "$0")/_/husky.sh"

echo "🛡️  Running pre-push checks..."

# Full lint (warnings don't block)
<pm> run lint || {
  echo "⚠️  Lint warnings found. Run '<pm> run lint:fix' to auto-fix."
}

# Build check (BLOCKING)
<pm> run build || {
  echo "❌ Build failed. Fix build errors above."
  exit 1
}

# Security audit (adjust command per package manager)
# npm: npm audit --audit-level=high --production
# pnpm: pnpm audit --audit-level=high --production
# yarn: yarn audit --level high --groups dependencies
<pm> audit --audit-level=high --production || {
  echo "⚠️  Security vulnerabilities found. Review and update dependencies."
}

# Secret detection (basic grep)
if git diff --cached --name-only | grep -E '\.(env|key|pem|credentials)$'; then
  echo "⚠️  Warning: You're committing files that may contain secrets!"
  read -p "  → Are you sure you want to push? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Push cancelled."
    exit 1
  fi
fi

echo "✅ Pre-push checks passed!"
```

### `package.json` (lint-staged config)
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yaml,yml}": [
      "prettier --write"
    ]
  }
}
```

---

## Performance Targets

| Check | Target Time | Actual Time | Status |
|-------|-------------|-------------|--------|
| Pre-commit (staged files only) | < 10s | 2-10s | ✅ |
| Pre-push (full project) | < 60s | 30-60s | ✅ |
| CI/CD (remote) | 5+ min | 5+ min | ⏳ |

**Time saved per caught issue**: ~4min 50s

---

## Known Issues & Limitations

### Known Issues
1. **Husky v10.0.0 deprecation**: Future version will require removing shebang lines from hook files
   - Current workaround: Keep using v9.x until v10 stable release
   - Migration path: Update hooks to remove `#!/usr/bin/env sh` and `. "$(dirname "$0")/_/husky.sh"`

2. **Windows compatibility**: Git Bash or WSL required for shell scripts
   - Alternative: Use Node.js-based hooks instead of bash scripts

### Limitations
- **Type checking**: Requires full project context (can't use lint-staged optimization)
  - Runs on entire codebase, not just staged files
  - Trade-off: Slower but catches cross-file type errors

- **Build time**: Pre-push adds 20-40s for build verification
  - Trade-off: Acceptable to prevent broken builds in CI/CD

- **Secret detection**: Basic grep patterns vs advanced tools
  - Basic: Fast but may miss encoded secrets
  - Advanced (gitleaks): More thorough but requires separate installation

- **Package manager variations**: Audit commands differ between npm/pnpm/yarn
  - Requires manual adjustment in hook scripts

---

## Migration Guide

### For New Projects
1. Follow the Implementation Plan (Phase 1: Core Setup)
2. Customize hook scripts for your package manager (replace `<pm>` placeholders)
3. Adjust lint-staged patterns for your file structure
4. Test with `git commit` and `git push`

### For Existing Projects
1. **Install dependencies**:
   ```bash
   npm install -D husky lint-staged
   # or
   pnpm add -D husky lint-staged
   # or
   yarn add -D husky lint-staged
   ```

2. **Initialize Husky**:
   ```bash
   npx husky init
   # or
   pnpm exec husky init
   # or
   yarn husky init
   ```

3. **Create hook scripts**: Copy `.husky/pre-commit` and `.husky/pre-push` from Configuration Reference
   - Replace `<pm>` with your package manager (npm/pnpm/yarn)
   - Adjust audit commands for your package manager

4. **Add lint-staged config** to `package.json` (see Configuration Reference)
   - Customize file patterns for your project structure

5. **Make hooks executable** (Linux/macOS):
   ```bash
   chmod +x .husky/pre-commit .husky/pre-push
   ```

6. **Test the setup**:
   - Create a test commit with intentional lint errors
   - Verify auto-fix works
   - Test with TypeScript errors (should block)
   - Test push with build failures (should block)

---

## Testing Strategy

### Test Cases
1. **Commit with lint errors** → Auto-fixed, commit succeeds
2. **Commit with type errors** → Blocked, commit fails
3. **Push with build errors** → Blocked, push fails
4. **Push with security issues** → Warning displayed, push continues
5. **Commit secret files** → Warning + confirmation prompt

### Validation Checklist
- [ ] Pre-commit runs on `git commit`
- [ ] Pre-push runs on `git push`
- [ ] Auto-fix works for ESLint/Prettier
- [ ] Type errors block commits
- [ ] Build errors block pushes
- [ ] Security audit displays warnings
- [ ] Secret detection prompts user

---

## Success Criteria

### Must Have (MVP)
- ✅ Pre-commit hook catches lint/format issues
- ✅ Pre-commit hook catches type errors
- ✅ Pre-push hook catches build errors
- ✅ Auto-fix works for fixable issues
- ✅ Hooks execute in target time ranges

### Should Have (Phase 3)
- [ ] Test suite integration
- [ ] Coverage threshold enforcement
- [ ] Advanced secret detection
- [ ] Commit message linting

### Nice to Have (Future)
- [ ] Performance benchmarks
- [ ] Parallel test execution
- [ ] Custom hook templates
- [ ] Team-wide hook distribution

---

## References

### Official Documentation
- **Husky**: https://typicode.github.io/husky/
- **lint-staged**: https://github.com/okonet/lint-staged
- **TypeScript**: https://www.typescriptlang.org/docs/
- **ESLint**: https://eslint.org/docs/latest/
- **Prettier**: https://prettier.io/docs/

### Inspiration & Expert Patterns
- **Chris Hayuk Vibe Coding Templates**: https://github.com/chrishayuk/vibe-coding-templates
  - Expert patterns adapted from Python pre-commit hooks to TypeScript/Node.js

### Additional Tools (Optional)
- **commitlint**: https://commitlint.js.org/ (Commit message linting)
- **gitleaks**: https://github.com/gitleaks/gitleaks (Advanced secret detection)
- **detect-secrets**: https://github.com/Yelp/detect-secrets (Secret scanning)
- **Conventional Commits**: https://www.conventionalcommits.org/ (Commit message format)

---

## Appendix: Expert Patterns Implemented

1. **Multi-stage strategy**: Fast commit checks, comprehensive push checks
2. **Auto-fix philosophy**: `--fix` flags reduce manual work
3. **Strict type checking**: Prevents runtime errors
4. **File-specific optimization**: lint-staged for performance
5. **Security-first**: pnpm audit + secret detection
6. **Fail-fast**: Critical errors block, warnings inform
7. **Informational warnings**: Don't block developer flow
8. **Future-ready**: Placeholders for tests and coverage

---

**Document Status**: Living document, updated as implementation evolves.
