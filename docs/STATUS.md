# Поточний стан проєкту

## Поточний етап

Завершено й прийнято:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- дизайн `User-facing MVP v1`;
- acceptance scenarios `AC-01…AC-14`;
- implementation plan `docs/plans/user-facing-mvp-v1.md`;
- implementation tasks 1–6 `User-facing MVP v1` із task-level review.

Live demo: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

`main` і live deployment не змінювалися під час реалізації `User-facing MVP v1`.

## Supervisor checkpoint

Weekly Capstone Progress Report — Week 2 відправлено Тетяні через LMS; у Slack надіслано report + live demo.

Статус: **submitted → awaiting supervisor feedback**.

## User-facing MVP v1 — verification candidate

Feature branch:

`feature/user-facing-mvp-v1`

Implementation candidate:

`d856e90aa2c3cdab886b1d1ff8245520ee4cf97c` (`feat: complete user-facing outage scenario flow`)

Реалізований flow:

```text
Equipment → Backup → Services & Scenario → Result
```

Ключове:

- Device вводиться через category, `powerW` і optional internal battery без ручного `availabilityMinutes`;
- BackupSource має usable capacity, optional max output і assignments;
- target services визначають mandatory loads, additional loads задаються окремо;
- ExternalProvider availability вводиться вручну;
- `Simulation Engine v1` не змінювався.

## Task 7 — фактична verification

2026-08-20 у локальному Browser walkthrough (HTTP `200`) перевірено AC-12 fixture:

- Home backup: `80 W`, `360 min (6 h)`;
- Router / ONT/ONU: по `360 min`; Laptop: `480 min` (`360` external + `120` internal);
- Remote Work: `Limited`, `360 min`; limiting dependencies — ONT/ONU і Router; обидва expected causal paths показані;
- warning `MISSING_BACKUP_SOURCE_MAX_OUTPUT` та відсутність deterministic recommendation показані;
- rerun без reload після зміни provider availability `600 → 300` замінив outcome на `300 min`, limiting provider і відповідне пояснення про local battery.

Також пройдено negative UI smoke без synthetic partial result:

- `powerW = 0` → `INVALID_POSITIVE_NUMBER`;
- active load `80 W` > known max output `50 W` → `BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED` + `No partial result is shown.`;
- missing provider availability → `MISSING_EXTERNAL_PROVIDER_AVAILABILITY` + `No partial result is shown.`;
- missing required Router role → `TEMPLATE_ROLE_CARDINALITY`.

Fresh automated verification у `apps/web`:

- `cmd.exe /d /c npm test` — exit `0`; `97 passed`, `0 failed`, `0 cancelled`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm run build` — exit `0`; Vite `8.2.1`, `32` modules transformed.

Task 7 scope/hygiene audit:

- `git diff origin/main...HEAD -- apps/web/src/simulation` — empty;
- dependency diff for `apps/web/package.json` and `apps/web/package-lock.json` — exit `0`, empty;
- worktree and branch `git diff --check` — exit `0`;
- implemented-path TODO/placeholder scan — `0` matches;
- branch-diff secret-pattern heuristic — `0` matches.

## Branch review state

Завдання 1–6 завершили свої task-level review cycles. Final whole-branch review **ще не** виконано; цей STATUS не заявляє про final whole-branch acceptance. Deferred task-level Minor findings залишаються контекстом для final reviewer.

## Source of truth

- Google Drive `Capstone Project Context — Software Engineering` — canonical cross-chat context;
- `docs/STATUS.md` — поточний operational snapshot;
- `docs/specs/user-facing-mvp-v1.md` — accepted contract;
- `docs/specs/user-facing-mvp-v1-acceptance.md` — accepted AC-01…AC-14;
- `docs/plans/user-facing-mvp-v1.md` — implementation plan;
- `docs/specs/repository-workflow.md` — agent workflow.

## Наступна дія

Запустити fresh final whole-branch Reviewer для `feature/user-facing-mvp-v1`; не merge у `main`, не deploy і не змінювати live demo без окремого рішення користувача.
