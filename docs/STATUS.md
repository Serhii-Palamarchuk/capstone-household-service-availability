# Поточний стан проєкту

Цей файл є коротким **операційним знімком** для синхронізації ChatGPT, Claude Code, Codex, GitHub Copilot та інших coding agents.

Він не є історичним журналом. Під час переходу до нового завдання застарілі значення замінюються актуальними. Історія суттєвих рішень зберігається в `docs/DECISIONS.md`, а поточні правила — у відповідних канонічних документах.

## Current phase

Підготовка до реалізації `Simulation Engine v1`.

## Active task

Немає активного Developer task. Наступний крок — передати `Task 1` з `docs/plans/simulation-engine-v1.md` агенту в ролі `Developer`.

## Last completed

- затверджено `docs/DOMAIN_MODEL.md`;
- затверджено `docs/SIMULATION.md`;
- сформовано `docs/TEST_SCENARIOS.md` з acceptance-сценаріями;
- підготовлено і самоперевірено `docs/plans/simulation-engine-v1.md`.

## Current roles

- Developer: none
- Reviewer: none
- Orchestration / decisions: ChatGPT + user

Ролі не закріплюються за конкретним агентом постійно.

## Open questions

Немає.

Якщо під час розробки виникає питання, яке потребує зміни вимоги, предметної моделі, алгоритму, архітектури, scope або погодженої технології, його потрібно додати сюди як `Q-XXX` і зупинити відповідну частину реалізації до рішення користувача.

Формат:

```text
Q-XXX — <коротка назва>
Task: <task id>
Question: <що саме невизначено>
Affected docs: <files>
Status: OPEN
```

Після рішення питання видаляється з цього розділу; якщо рішення суттєве, воно додається до `docs/DECISIONS.md`, а канонічний документ оновлюється.

## Last verification

Код simulation engine ще не реалізований, тому фактичні code tests не запускалися.

Остання перевірка: self-review плану `docs/plans/simulation-engine-v1.md` на відповідність `DOMAIN_MODEL.md`, `SIMULATION.md` і `TEST_SCENARIOS.md`.

## Relevant implementation baseline

- Plan: `docs/plans/simulation-engine-v1.md`
- Plan commit before multi-agent protocol setup: `2f08425e004a5ccfb91533e075c114acf8198e9e`

## Next action

1. Призначити одного агента `Developer` для `Simulation Engine v1 / Task 1`.
2. Після реалізації та фактичної перевірки оновити цей файл.
3. Передати результат іншому агенту в ролі `Reviewer`.

## Правило розміру

`STATUS.md` має залишатися коротким поточним знімком, орієнтовно до 50–80 рядків. Не накопичувати тут хронологію завершених задач.