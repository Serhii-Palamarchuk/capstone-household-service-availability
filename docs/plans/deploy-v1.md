# Deploy v1 Implementation Plan

**Goal:** Розгорнути прийнятий `React Demo v1` у GitHub Pages через GitHub Actions та зафіксувати перевірене публічне посилання.

**Architecture:** Застосунок залишається статичним React/Vite SPA. GitHub Actions виконує tests → production build → upload Pages artifact → deploy у `github-pages`; GitHub Pages лише віддає згенерований `dist` без backend.

**Tech Stack:** React 19, Vite 8, Node.js 24, npm, GitHub Actions, GitHub Pages.

**Spec:** `docs/specs/deploy-v1.md`

## Global Constraints

- Не змінювати `Simulation Engine v1` або поведінку `React Demo v1` для потреб hosting.
- Не додавати backend, DB, persistence, custom domain або інший hosting provider.
- Не додавати deployment npm package.
- Не commit-ити `dist`, tokens, PAT або secrets.
- GitHub Pages source — `GitHub Actions`.
- Vite base path — `/capstone-household-service-availability/`.
- Кожен task проходить Developer → fresh Reviewer gate за repository workflow.
- Якщо Pages не enabled/configured, це escalation condition користувачу; credentials автоматично не створювати.

---

## Task 1 — Static build configuration і Pages workflow

**Files:**
- Create: `apps/web/vite.config.js`
- Create: `.github/workflows/deploy-pages.yml`
- Modify: `docs/STATUS.md` тільки після factual verification/handoff

**Interfaces:**
- Consumes: `apps/web/package.json`, `apps/web/package-lock.json`, accepted `React Demo v1` і `simulate()` implementation.
- Produces: production build із repository base path та GitHub Pages workflow, що deploy-ить `apps/web/dist`.

### Acceptance criteria

- Vite production assets використовують repository subpath.
- Workflow використовує `apps/web` як application root.
- Workflow виконує `npm ci`, `npm test`, `npm run build` до deploy.
- Pages artifact — тільки `apps/web/dist`.
- permissions: `contents: read`, `pages: write`, `id-token: write`.
- deployment environment: `github-pages`.
- workflow має `workflow_dispatch`.
- Немає нових npm dependencies.

- [ ] **Step 1: Verify clean baseline**

Run from repository root:

```bat
cmd.exe /d /c "cd apps\web && npm test"
cmd.exe /d /c "cd apps\web && npm run build"
git status --short
```

Expected:

- tests exit `0`;
- build exit `0`;
- worktree не містить неочікуваних змін.

- [ ] **Step 2: Create Vite deployment config**

Create `apps/web/vite.config.js`:

```js
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/capstone-household-service-availability/',
});
```

- [ ] **Step 3: Build and verify repository base path**

Run:

```bat
cmd.exe /d /c "cd apps\web && npm run build"
cmd.exe /d /c "cd apps\web && node -e \"const fs=require('node:fs');const html=fs.readFileSync('dist/index.html','utf8');if(!html.includes('/capstone-household-service-availability/assets/')){console.error('repository base path missing');process.exit(1)}console.log('repository base path ok')\""
```

Expected:

- build exit `0`;
- verification prints `repository base path ok`.

- [ ] **Step 4: Create GitHub Pages workflow**

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy React demo to GitHub Pages

on:
  push:
    branches: ['main']
    paths:
      - 'apps/web/**'
      - '.github/workflows/deploy-pages.yml'
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0 # v7

      - name: Set up Node
        uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7
        with:
          node-version: 24
          cache: npm
          cache-dependency-path: apps/web/package-lock.json

      - name: Install dependencies
        working-directory: apps/web
        run: npm ci

      - name: Run tests
        working-directory: apps/web
        run: npm test

      - name: Build
        working-directory: apps/web
        run: npm run build

      - name: Configure Pages
        uses: actions/configure-pages@45bfe0192ca1faeb007ade9deae92b16b8254a0d # v6

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@fc324d3547104276b827a68afc52ff2a11cc49c9 # v5
        with:
          path: apps/web/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@cd2ce8fcbc39b97be8ca5fce6e763baed58fa128 # v5
```

- [ ] **Step 5: Run local regression checks**

Run:

```bat
cmd.exe /d /c "cd apps\web && npm test"
cmd.exe /d /c "cd apps\web && npm run build"
git diff --check
```

Expected:

- full suite exit `0`;
- build exit `0`;
- `git diff --check` exit `0`.

- [ ] **Step 6: Verify no dependency drift**

Run:

```bat
cmd.exe /d /c "cd apps\web && npm ls --depth=0"
git diff -- apps/web/package.json apps/web/package-lock.json
```

Expected:

- only already approved React/ReactDOM/Vite top-level packages;
- package files unchanged by this task.

- [ ] **Step 7: Commit implementation**

```bash
git add apps/web/vite.config.js .github/workflows/deploy-pages.yml
git commit -m "ci: configure GitHub Pages deployment"
```

- [ ] **Step 8: Update STATUS and push**

Update `docs/STATUS.md` with factual local results, Task 1 implementation SHA and `Next action: fresh Reviewer`.

```bash
git add docs/STATUS.md
git commit -m "docs: record deploy v1 task 1 status"
git push origin main
```

Do not claim live deployment success yet.

### Reviewer gate for Task 1

Fresh Reviewer must:

1. inspect only Task 1 implementation range;
2. verify Vite base exactly matches repository path;
3. verify workflow app root/artifact/permissions/environment/action pins;
4. rerun full tests and production build;
5. verify package files have no dependency drift;
6. verify no `dist`, secret, PAT, backend або unrelated source changes;
7. return `ACCEPTED` or `CHANGES REQUESTED` and update STATUS.

Task 2 starts only after Task 1 source/config acceptance.

---

## Task 2 — Live Pages deployment verification і public demo link

**Files:**
- Modify: `README.md` після фактично успішного deployment
- Modify: `docs/STATUS.md` після factual verification
- Production source changes: none expected

**Interfaces:**
- Consumes: accepted Task 1 deployment config and GitHub Pages repository settings.
- Produces: verified public Pages URL and documented `Live demo` link.

### Acceptance criteria

- GitHub Pages source configured as `GitHub Actions`.
- Latest deployment workflow for accepted Task 1 code is `success`.
- Public Pages URL responds over HTTPS.
- Root HTML and referenced built assets are reachable under repository subpath.
- Public deployment corresponds to current `main`.
- README contains verified live-demo URL only after success.
- Functional smoke is verified in browser when available; otherwise user manual verification is explicitly requested and recorded.

- [ ] **Step 1: Check Pages deployment state**

After Task 1 is accepted, inspect the latest `Deploy React demo to GitHub Pages` workflow run using available GitHub tooling/API.

Expected: workflow exists and either succeeds or reports a concrete Pages configuration error.

If the run reports that Pages is not enabled/configured for GitHub Actions, stop and escalate exactly this one-time user action:

```text
Repository → Settings → Pages → Build and deployment → Source → GitHub Actions
```

Do not create/store PAT or other credentials.

- [ ] **Step 2: Trigger/re-run deployment after Pages is enabled**

Use `workflow_dispatch` or rerun the failed workflow with available GitHub tooling/UI.

Expected: deployment job completes with conclusion `success`.

Record:

- workflow run URL/id;
- deployed commit SHA;
- deployment `page_url`.

- [ ] **Step 3: Verify public root URL**

For the actual `page_url`, run an HTTPS request with available system tooling, for example:

```bash
curl -L --fail --silent --show-error -o deployed-index.html "<page_url>"
```

Expected: exit `0` and non-empty HTML.

Do not hard-code success if the request was not executed.

- [ ] **Step 4: Verify repository-base assets from deployed HTML**

Confirm deployed HTML references assets below:

```text
/capstone-household-service-availability/assets/
```

Fetch each referenced JS/CSS asset (or at minimum the emitted JS entry and CSS entry when present) with `curl --fail` or equivalent.

Expected: all checked assets return successful HTTP responses; no root-relative `/assets/...` regression.

- [ ] **Step 5: Functional smoke**

If browser runtime is available, execute on the public URL:

1. `6 / 8 / 2 / 72 h` → `Limited`, `2 h`, `ONT/ONU`, `Internet → ONT/ONU`;
2. change only ONT/ONU to `8 h` → `Available`, `8 h`, no limiting dependency/path.

If browser runtime is unavailable:

- do not invent browser success;
- rely only on factual workflow/HTTP/assets verification automatically;
- set a manual browser smoke as the only remaining user verification before final `Deploy v1` acceptance.

- [ ] **Step 6: Add verified Live demo link to README**

Only after successful live deployment, add a concise section near the project introduction:

```markdown
## Live demo

[Open the deployed React demo](<actual page_url>)
```

Use the actual `page_url` returned by deployment, not an assumed URL.

- [ ] **Step 7: Run final regression/build checks**

Run:

```bat
cmd.exe /d /c "cd apps\web && npm test"
cmd.exe /d /c "cd apps\web && npm run build"
git diff --check
```

Expected: all exit `0`.

- [ ] **Step 8: Commit documentation and handoff**

```bash
git add README.md docs/STATUS.md
git commit -m "docs: publish live demo link"
git push origin main
```

`docs/STATUS.md` must record factual:

- deployment workflow result;
- deployed commit;
- actual Pages URL;
- HTTP/assets verification;
- browser smoke result or explicit manual pending state;
- final test/build results;
- Next action: fresh Reviewer final gate.

### Final Reviewer gate for Deploy v1

Fresh Reviewer must verify independently:

- Task 1 source/config acceptance remains valid;
- latest relevant Pages workflow conclusion is `success`;
- actual public URL is reachable;
- deployed HTML/assets use correct repository base path;
- README link equals actual deployment URL;
- full test suite and production build are green;
- no secrets, PAT, committed `dist`, backend or unrelated dependency changes;
- functional browser smoke is factual; if reviewer has no browser, it must rely on recorded manual user confirmation rather than infer it.

Final verdict:

`ACCEPTED` only when deployment is live and all required verification is factual.

Otherwise:

`CHANGES REQUESTED` or escalation with the single concrete unresolved condition.
