# Поточний стан проєкту

## Поточний етап

Реалізація `Simulation Engine v1`.

## Активне завдання

`Task 1 — Runtime harness і constants` реалізовано Developer (Claude Code) та прийнято після незалежного review (Codex).

Наступний крок — передати `Task 2 — Model index і structural Scenario validation` окремому агенту в ролі `Developer`.

## Останнє завершене

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено й самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано спільний контекст для ChatGPT, Claude Code, Codex і GitHub Copilot;
- синхронізовано `docs/specs/repository-workflow.md`;
- реалізовано й прийнято після незалежного review `Task 1 — Runtime harness і constants` (`apps/web/package.json`, `apps/web/src/simulation/constants.js`, `apps/web/test/simulation/constants.test.js`).

## Поточні ролі

- `Developer`: немає (Task 2 очікує призначення);
- `Reviewer`: немає (Task 1 прийнято);
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

## Остання перевірка

Незалежний review Task 1: `accepted`, відкритих findings немає.

`node --version` → `v24.18.0`.

Повторний запуск package script у `apps/web` через `cmd.exe /d /c npm test` → exit code `0`, `1 passed, 0 failed`. Прямий виклик `npm test` у PowerShell не запустив tests через локальну execution policy для `npm.ps1`.

## Актуальна база

- план: `docs/plans/simulation-engine-v1.md`;
- commit плану: `2f08425e004a5ccfb91533e075c114acf8198e9e`;
- implementation commit Task 1: `c78de11`;
- рішення про спільний контекст: `D-001` у `docs/DECISIONS.md`;
- правила синхронізації: `docs/specs/repository-workflow.md`.

## Наступна дія

Передати `Task 2 — Model index і structural Scenario validation` окремому `Developer`.
