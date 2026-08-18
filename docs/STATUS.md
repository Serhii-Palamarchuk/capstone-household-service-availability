# Поточний стан проєкту

Цей файл є коротким **операційним знімком** для синхронізації ChatGPT, Claude Code, Codex, GitHub Copilot та інших coding agents.

Він не є історичним журналом. Застарілі значення замінюються актуальними. Історія суттєвих рішень зберігається в `docs/DECISIONS.md`, а поточні правила — у відповідних канонічних документах.

## Current phase

Підготовка до реалізації `Simulation Engine v1`.

## Active task

Немає активного Developer task. Наступний крок — передати `Task 1` з `docs/plans/simulation-engine-v1.md` одному агенту в ролі `Developer`.

## Last completed

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md`;
- підготовлено і самоперевірено `docs/plans/simulation-engine-v1.md`;
- налаштовано multi-agent synchronization protocol через `AGENTS.md`, `STATUS.md`, `DECISIONS.md` і `.github/copilot-instructions.md`;
- синхронізовано `docs/specs/repository-workflow.md`.

## Current roles

- Developer: none
- Reviewer: none
- Orchestration / decisions: ChatGPT + user

Ролі не закріплюються за конкретним агентом постійно.

## Open questions

Немає.

Якщо під час розробки виникає питання, яке потребує зміни вимоги, предметної моделі, алгоритму, архітектури, scope або погодженої технології, його потрібно додати сюди як `Q-XXX` і призупинити залежну частину реалізації до рішення користувача.

Формат:

```text
Q-XXX — <коротка назва>
Task: <task id>
Question: <що саме невизначено>
Affected docs: <files>
Status: OPEN
```

Після рішення питання прибирається з поточного snapshot; якщо рішення суттєве, воно додається до `docs/DECISIONS.md`, а відповідний канонічний документ оновлюється.

## Last verification

Код simulation engine ще не реалізований, тому фактичні code tests не запускалися.

Остання перевірка: fresh-read multi-agent protocol після створення/оновлення файлів; перевірено, що порядок читання, `Q-XXX`, `D-XXX`, Developer → Reviewer handoff і обмеження розміру `STATUS.md` визначені однозначно.

## Relevant baseline

- Active plan: `docs/plans/simulation-engine-v1.md`
- Plan commit: `2f08425e004a5ccfb91533e075c114acf8198e9e`
- Multi-agent decision: `D-001` in `docs/DECISIONS.md`

## Next action

1. Призначити одного агента `Developer` для `Simulation Engine v1 / Task 1`.
2. Developer читає `AGENTS.md` → `STATUS.md` → active plan → relevant canonical docs.
3. Після реалізації та фактичних tests/checks Developer оновлює `STATUS.md` і передає task іншому агенту в ролі `Reviewer`.

## Правило розміру

`STATUS.md` має залишатися коротким поточним знімком, орієнтовно до 50–80 рядків. Не накопичувати тут хронологію завершених задач.