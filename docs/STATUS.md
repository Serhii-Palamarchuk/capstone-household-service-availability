# Поточний стан проєкту

## Поточний етап

`Simulation Engine v1` і `React Demo v1` завершено та прийнято після fresh незалежних review.

Розпочато підготовку `Deploy v1` для публічної демонстрації через GitHub Pages.

## Активне завдання

`Deploy v1 / Task 1 — Static build configuration і Pages workflow` готовий до передачі агенту в ролі `Developer`.

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

## Поточні ролі

- `Developer`: немає активного агента; Task 1 готовий до передачі;
- `Reviewer`: немає активного review;
- координація та рішення: користувач + ChatGPT.

## Відкриті питання

Немає.

Можлива one-time runtime escalation під час Task 2: якщо GitHub Pages ще не enabled/configured, користувач має виконати `Settings → Pages → Source → GitHub Actions`. PAT/secrets для автоматичного enablement не використовувати.

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

## Наступна дія

Запустити fresh autonomous coding session через `Autonomous Orchestrator session prompt` і виконувати `docs/plans/deploy-v1.md`.

Orchestrator має пройти Task 1 → fresh Reviewer → Task 2 → final fresh Reviewer. Якщо GitHub Pages не enabled, зупинитися лише для одноразового налаштування Source = GitHub Actions; після цього продовжити deploy plan.
