# CI/CD Expert Patterns Analysis
**Source**: Chris Hayuk's Vibe Coding Templates (Python/GitHub Actions)
**Applicable to**: TypeScript/Node.js projects (GitHub Actions & GitLab CI)
**Version**: 1.0 - Platform Agnostic
**Last Updated**: October 14, 2025

## 🎯 Key Expert Patterns Identified

### 1. **Modular Workflow Design**
**Pattern**: Separate workflows for different concerns instead of one monolithic file

**GitHub Actions Approach**:
```yaml
# Multiple workflow files in .github/workflows/
# ci.yml - Main integration
# lint.yml - Dedicated linting
# test.yml - Testing matrix
# coverage.yml - Coverage tracking
# deploy.yml - Deployment
# release.yml - Release automation
```

**GitLab CI Approach**:
```yaml
# Single .gitlab-ci.yml with multiple stages
stages:
  - quality    # lint, format, typecheck
  - security   # audit, security scans
  - test       # unit, integration tests
  - build      # compile, bundle
  - deploy     # staging, production
```

**Why it matters**:
- **GitHub**: Multiple files = parallel execution, easier to maintain
- **GitLab**: Stages with parallel jobs = clean visualization
- Both support running jobs in parallel within same stage/workflow

---

### 2. **Matrix Testing Strategy**
**Pattern**: Test across multiple versions and platforms

**GitHub Actions**:
```yaml
strategy:
  fail-fast: false
  matrix:
    os: [ubuntu-latest, macos-latest, windows-latest]
    node-version: [18, 20, 22]
```

**GitLab CI**:
```yaml
test:
  parallel:
    matrix:
      - NODE_VERSION: ["18", "20", "22"]
        OS: ["alpine", "bullseye", "ubuntu"]
```

**Why it matters**:
- Catches environment-specific bugs (OS differences, Node.js versions)
- Ensures compatibility across Node.js LTS versions
- `fail-fast: false` shows ALL failures, not just the first one
- Critical for libraries/packages supporting multiple environments

---

### 3. **Intelligent Caching**
**Pattern**: Use lockfiles as cache keys for invalidation

**GitHub Actions**:
```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm           # npm cache
      ~/.pnpm-store    # pnpm cache
      node_modules/
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    # For pnpm: hashFiles('**/pnpm-lock.yaml')
    # For yarn: hashFiles('**/yarn.lock')
    restore-keys: |
      ${{ runner.os }}-node-
```

**GitLab CI**:
```yaml
cache:
  key:
    files:
      - package-lock.json  # npm
      # - pnpm-lock.yaml   # pnpm
      # - yarn.lock        # yarn
  paths:
    - node_modules/
    - .npm/              # npm
    # - .pnpm-store/     # pnpm
    # - .yarn/cache/     # yarn
```

**Why it matters**:
- Speeds up CI by 2-5x (skips reinstalling unchanged dependencies)
- Auto-invalidates when lockfile changes (new/updated dependencies)
- Restore-keys provide fallback caching strategy
- Works with npm, pnpm, or yarn (adjust paths accordingly)

---

### 4. **Security-First Approach**
**Pattern**: Dedicated security scanning jobs

**GitHub Actions**:
```yaml
security-audit:
  runs-on: ubuntu-latest
  steps:
    - name: Run npm audit
      run: npm audit --production --audit-level=high
      continue-on-error: true

    # Optional: Advanced security scanning
    - name: Run Snyk security scan
      uses: snyk/actions/node@master
      continue-on-error: true
```

**GitLab CI**:
```yaml
security-audit:
  stage: security
  script:
    - npm audit --production --audit-level=high
    # For pnpm: pnpm audit --prod --audit-level=high
    # For yarn: yarn audit --level high --groups dependencies
  allow_failure: true
```

**Why it matters**:
- Finds known vulnerabilities early (before production)
- `continue-on-error`/`allow_failure` = informational, doesn't block pipeline
- Separate job = can be run on schedule (daily/weekly)
- Works with npm/pnpm/yarn audit or advanced tools (Snyk, Dependabot)

---

### 5. **Multi-Layer Quality Gates**
**Pattern**: Multiple independent quality checks

**GitHub Actions**:
```yaml
quality:
  runs-on: ubuntu-latest
  steps:
    - name: Lint code
      run: npm run lint              # ESLint

    - name: Check formatting
      run: npm run format:check      # Prettier

    - name: Type check
      run: npx tsc --noEmit --strict # TypeScript
```

**GitLab CI**:
```yaml
lint:
  stage: quality
  script:
    - npm run lint

format-check:
  stage: quality
  script:
    - npm run format:check

typecheck:
  stage: quality
  script:
    - npx tsc --noEmit --strict
```

**Why it matters**:
- Catches different classes of issues (syntax, style, types)
- Enforces consistent code style across team
- Type safety prevents runtime errors
- Each layer runs independently (parallel in same stage)

---

### 6. **Coverage Tracking with Thresholds**
**Pattern**: Track coverage and enforce minimum thresholds

**GitHub Actions**:
```yaml
test-coverage:
  runs-on: ubuntu-latest
  steps:
    - name: Run tests with coverage
      run: |
        # Vitest
        npm run test:coverage -- --coverage.threshold.lines=80
        # Jest
        # npm test -- --coverage --coverageThreshold='{"global":{"lines":80}}'

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v4
      with:
        files: ./coverage/cobertura-coverage.xml
```

**GitLab CI**:
```yaml
test-coverage:
  stage: test
  script:
    - npm run test:coverage -- --coverage.threshold.lines=80
  coverage: '/Lines\s*:\s*(\d+\.\d+)%/'  # Regex to extract coverage
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
```

**Why it matters**:
- Prevents coverage regression (fails build if below threshold)
- GitLab shows coverage badge automatically
- GitHub can integrate with Codecov/Coveralls for badges
- Forces writing tests for new code (enforced via threshold)

---

### 7. **Artifact Management**
**Pattern**: Save build outputs and test results

**GitHub Actions**:
```yaml
- name: Upload build artifacts
  if: always()  # Upload even on failure
  uses: actions/upload-artifact@v4
  with:
    name: build-${{ github.sha }}
    path: |
      dist/
      build/
      coverage/
    retention-days: 7

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: test-results
    path: test-results.xml
```

**GitLab CI**:
```yaml
build:
  stage: build
  script:
    - npm run build
  artifacts:
    name: "build-$CI_COMMIT_SHORT_SHA"
    paths:
      - dist/
      - build/
      - coverage/
    expire_in: 7 days
    reports:
      junit: test-results.xml
    when: always  # Save even on failure
```

**Why it matters**:
- **Debugging failures**: Access build output when CI fails
- **Sharing builds**: Pass artifacts between stages (build → test → deploy)
- **Historical tracking**: Download artifacts from past runs
- **`if: always()`/`when: always`**: Saves artifacts even when job fails

---

### 8. **Smart Conditionals**
**Pattern**: Run expensive steps only when needed

**GitHub Actions**:
```yaml
deploy-production:
  if: github.ref == 'refs/heads/main'  # Only on main branch
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: npm run deploy:prod

- name: Upload coverage
  if: matrix.os == 'ubuntu-latest' && matrix.node-version == 20
  uses: codecov/codecov-action@v4  # Upload once, not for every matrix combo
```

**GitLab CI**:
```yaml
deploy-production:
  stage: deploy
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'  # Only on main
  script:
    - npm run deploy:prod

upload-coverage:
  stage: test
  only:
    - main
  script:
    - npm run upload:coverage  # Skip for feature branches
```

**Why it matters**:
- **Saves CI minutes**: Don't deploy on every branch, only main
- **Prevents duplicate uploads**: Upload coverage once, not per matrix combo
- **Conditional deployments**: Production only from main, staging from develop

---

### 9. **Environment Management**
**Pattern**: Use environment variables for configuration

**GitHub Actions**:
```yaml
env:
  NODE_VERSION: "20"
  CI: true
  NPM_CONFIG_LOGLEVEL: error

jobs:
  build:
    env:
      BUILD_ENV: production  # Job-specific env vars
```

**GitLab CI**:
```yaml
variables:
  NODE_VERSION: "20"
  CI: "true"
  NPM_CONFIG_LOGLEVEL: "error"

build:
  variables:
    BUILD_ENV: "production"  # Job-specific variables
```

**Why it matters**:
- **Centralized configuration**: Change Node version in one place
- **Reusability**: Reference `$NODE_VERSION` throughout pipeline
- **Environment-specific**: Different vars for dev/staging/prod

---

### 10. **Modern Tooling**
**Pattern**: Use latest versions of actions/tools

**GitHub Actions - Latest Versions**:
- `actions/checkout@v4` (not v2 or v3)
- `actions/setup-node@v4`
- `actions/cache@v4`
- `actions/upload-artifact@v4`

**GitLab CI - Modern Docker Images**:
- `node:20-alpine` (latest LTS, lightweight)
- `node:22-alpine` (when stable)
- Alpine images = smaller, faster pulls

**Modern Package Managers**:
- **pnpm**: 2x faster than npm, disk-space efficient
- **yarn v4**: Plug'n'Play, zero-install mode
- **npm v10+**: Workspaces, improved performance

**Why it matters**:
- Latest versions have security patches and performance improvements
- Alpine images reduce Docker pull time by 60-80%
- Modern package managers significantly speed up installs

---

## 📊 Pattern Comparison: Python → TypeScript

| Python Tool | TypeScript Equivalent | Purpose |
|-------------|----------------------|---------|
| uv | pnpm / yarn v4 / npm | Fast package manager |
| ruff | eslint | Linting |
| black | prettier | Formatting |
| mypy | tsc --noEmit | Type checking |
| pytest | vitest / jest / mocha | Testing |
| bandit | npm audit / eslint-plugin-security | Security scanning |
| safety | npm/pnpm/yarn audit | Dependency vulnerabilities |
| interrogate | typedoc coverage | Documentation coverage |
| codecov | codecov / GitLab coverage | Coverage tracking |

---

## 🎓 Key Takeaways for Commercial Projects

### 1. **Fail Fast is Bad for CI**
```yaml
# ❌ BAD: Stops at first failure
fail-fast: true

# ✅ GOOD: Shows all failures
fail-fast: false
```

### 2. **Cache Everything**
```yaml
# Use lockfile as cache key (GitLab CI example)
key:
  files:
    - package-lock.json  # npm
    # - pnpm-lock.yaml   # pnpm
    # - yarn.lock        # yarn
```

### 3. **Matrix Testing is Essential**
```yaml
# Test multiple Node versions
parallel:
  matrix:
    - NODE_VERSION: ["18", "20", "22"]
```

### 4. **Security Scans Should Be Informational**
```yaml
# Don't block on security warnings initially
allow_failure: true
```

### 5. **Save Artifacts Always**
```yaml
# Even on failure
if: always()
```

---

## 🔧 Tools Recommendations

**Python Projects**:
- Package manager: `uv` (10-100x faster than pip)
- Linter: `ruff` (100x faster than pylint)
- Formatter: `black` or `ruff format`
- Type checker: `mypy --strict`

**TypeScript/Node.js Projects**:
- Package manager: `pnpm` (recommended, 2x faster) or `yarn v4` or `npm v10+`
- Linter: `eslint` with TypeScript plugin
- Formatter: `prettier`
- Type checker: `tsc --noEmit --strict`

---

## 📝 Expert Pattern Checklist

- [ ] Separate concerns into stages/jobs
- [ ] Matrix testing across versions
- [ ] Cache dependencies using lockfile
- [ ] Security scanning (allow_failure: true)
- [ ] Multi-layer quality gates (lint + format + typecheck)
- [ ] Coverage tracking with thresholds
- [ ] Artifact management for debugging
- [ ] Smart conditionals to save CI time
- [ ] Environment variables for configuration
- [ ] Modern tooling (latest versions)
- [ ] fail-fast: false for matrix jobs
- [ ] Meaningful job names
- [ ] Upload artifacts even on failure (if: always())
- [ ] Use official actions/images when possible
