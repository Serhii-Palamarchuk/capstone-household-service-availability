# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1` і `React Demo v1` завершено та прийнято після fresh незалежних review.

`Deploy v1 / Task 2` завершено Developer; публічна GitHub Pages demo розгорнута і передана на fresh final Reviewer gate.

## Активне завдання

Fresh final Reviewer для `Deploy v1`.

Канонічна специфікація:

`docs/specs/deploy-v1.md`

Implementation plan:

`docs/plans/deploy-v1.md`

## Останнє завершене

- `Simulation Engine v1` прийнято; final engine suite: `43 passed, 0 failed`;
- `React Demo v1` прийнято; final full suite: `53 passed, 0 failed`;
- production build React Demo: exit `0`, Vite `8.2.1`;
- React Demo dependencies: React, ReactDOM, Vite;
- local two-pass browser visual confirmation виконано користувачем 2026-08-19:
  - `6 / 8 / 2 / 72 h` → `Limited`, `2 h`, `ONT/ONU`, `Internet → ONT/ONU`;
  - `6 / 8 / 8 / 72 h` → `Available`, `8 h`, без limiting dependency і causal path;
- погоджено hosting/platform для `Deploy v1`: GitHub Pages через GitHub Actions;
- користувач підтвердив, що GitHub Pages проходився в межах навчальної програми;
- рішення зафіксовано як `D-002` у `docs/DECISIONS.md`;
- створено `docs/specs/deploy-v1.md` і `docs/plans/deploy-v1.md`.
- GitHub Pages увімкнено з Source = `GitHub Actions`; public HTTPS URL: `https://serhii-palamarchuk.github.io/capstone-household-service-availability/`.

## Поточні ролі

- `Developer`: Task 2 передано на final review;
- `Reviewer`: потрібен fresh final Reviewer для `Deploy v1`;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Актуальна база

- final accepted Simulation Engine commit: `15a07e82263ca3885bd538c15460005f5e3b68c0`;
- final accepted React Demo implementation commit: `209b17b6d81c45b64ada9aedf4b97cf6a9f4d2a3`;
- React Demo final acceptance STATUS commit: `10da517`;
- Deploy v1 spec commit: `2b735f0e4165abc1da1992f651d3be8ab68b6d49`;
- Deploy v1 plan commit: `6441b20f1a9e435fac5186e54266dfba2499a345`;
- deployment decision: `D-002` у `docs/DECISIONS.md`;
- synchronization rules: `docs/specs/repository-workflow.md`;
- autonomous workflow: `docs/specs/autonomous-agent-workflow.md`;
- reusable prompts: `docs/specs/agent-session-prompts.md`.
- Task 2 lockfile correction commits, ще не reviewed у final Deploy v1 gate: `8c7134d` і `1f735f3`.

## Наступна дія

Запустити fresh final Reviewer для `Deploy v1` відповідно до `docs/specs/repository-workflow.md` та final Reviewer gate у `docs/specs/deploy-v1.md`.

## Deploy v1 / Task 1 — factual handoff

- Створено `apps/web/vite.config.js` з repository base path `/capstone-household-service-availability/`.
- Створено `.github/workflows/deploy-pages.yml` з pinned GitHub Actions, Node.js 24, `npm ci`, повним `npm test`, `npm run build`, Pages artifact `apps/web/dist`, permissions `contents: read`, `pages: write`, `id-token: write` та environment `github-pages`.
- Baseline: `cmd.exe /d /c "cd apps\web && npm test"` — exit `0`, `53 passed, 0 failed`; `npm run build` — exit `0`.
- Regression: `npm test` — exit `0`, `53 passed, 0 failed`; `npm run build` — exit `0`; built `dist/index.html` містить `/capstone-household-service-availability/assets/`; `git diff --check` — exit `0`.
- Dependency drift: `npm ls --depth=0` — exit `0`, лише `react`, `react-dom`, `vite`; `package.json` і `package-lock.json` не змінені.
- Implementation commit: `8208809` (`ci: configure GitHub Pages deployment`). Live Pages deployment у Task 1 не підтверджувався.
- Наступна дія: fresh Reviewer для Task 1.

## Deploy v1 / Task 1 — Reviewer decision

- Fresh independent review of `94fb998ddb06e8401fa1800fbb285a8cd8c1b978..4f8aaa8`: **ACCEPTED**.
- Local reviewer verification: Node.js `v24.18.0`; `npm test` — exit `0`, `53 passed, 0 failed`; `npm run build` — exit `0`; `dist/index.html` contains two `/capstone-household-service-availability/assets/` references; `git diff --check` — exit `0`; `npm ls --depth=0` — exit `0` (`react`, `react-dom`, `vite`); package-file diff is empty.
- Scope verified: only Vite config, GitHub Pages workflow and Task 1 handoff; no production/test changes by Reviewer, dependencies, committed `dist`, secrets/PAT, backend or Task 2 work.
- Workflow verified: exact Vite base, Node.js 24, npm cache from `apps/web/package-lock.json`, `npm ci` → `npm test` → `npm run build`, artifact only `apps/web/dist`, exact required permissions, environment `github-pages`, `workflow_dispatch`, and pinned action SHAs.
- Live Pages deployment is not claimed in Task 1; it remains Task 2 work.
- Наступна дія: **Task 2 — Developer**.

## Deploy v1 / Task 2 — Developer factual handoff

- До runtime deploy усунуто concrete CI lockfile defect: у `apps/web/package-lock.json` два incomplete nested optional `rolldown` entries не мали `version`, що спричиняло `npm ci: Invalid Version:`. Виправлення складають commits `8c7134d fix: repair web dependency lockfile` і `1f735f3 fix: complete web dependency lockfile`; ці commits входять до unreviewed Task 2 range.
- Після одноразового налаштування користувачем `Repository → Settings → Pages → Build and deployment → Source → GitHub Actions`, вручну запущений workflow [32276285162](https://github.com/Serhii-Palamarchuk/capstone-household-service-availability/actions/runs/32276285162) для SHA `1f735f384b0b9c8b3077bd639bab4221bbe89c58` завершився `success`.
- GitHub deployment `5986686717`: environment `github-pages`, status `success`, фактичний `page_url` — `https://serhii-palamarchuk.github.io/capstone-household-service-availability/`. GitHub Pages API підтверджує `build_type: workflow`, `public: true`, `https_enforced: true`.
- HTTPS verification: root URL — HTTP `200`, `573` bytes; deployed HTML має JS `/capstone-household-service-availability/assets/index-BLNIJOnC.js` і CSS `/capstone-household-service-availability/assets/index-BUUSSPth.css`, без root-relative `/assets/...`. Обидва assets повернули HTTP `200` (JS `201057` bytes, CSS `2290` bytes).
- Browser functional smoke: agent browser binding був недоступний (`agent.browsers.list()` повернув `[]`), тому agent не стверджує browser execution. Користувач фактично підтвердив manual smoke 2026-08-19: `6 / 8 / 2 / 72 h` → `Limited`, `2 h`, `ONT/ONU`, `Internet → ONT/ONU`; `6 / 8 / 8 / 72 h` → `Available`, `8 h`, без limiting dependency і causal path.
- Final local verification: `cmd.exe /d /c "cd apps\web && npm test"` — exit `0`, `53 passed, 0 failed`; `cmd.exe /d /c "cd apps\web && npm run build"` — exit `0`, Vite `8.2.1`; `npm ls --depth=0` — лише `react@19.2.8`, `react-dom@19.2.8`, `vite@8.2.1`; `git diff --check` — exit `0`.
- Scope/no-secret checks: committed `apps/web/dist` відсутній; `git ls-files` secret-pattern check не повернув tracked `.env`, `.pem`, `.key`, `id_rsa` або `token` filenames. README Live demo використовує actual deployment URL.
- Наступна дія: **fresh final Reviewer для Deploy v1**; independently verify Task 1 + unreviewed Task 2 lockfile corrections, workflow/deployment, public assets, README/STATUS, full tests/build, scope and factual manual smoke.
