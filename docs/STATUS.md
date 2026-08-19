# Поточний стан проєкту

## Поточний етап

Завершено й прийнято:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- `User-facing MVP v1`: design, acceptance scenarios `AC-01…AC-14`, implementation plan і final whole-branch review.

Feature branch: `feature/user-facing-mvp-v1`.

Релевантний accepted implementation commit:

`f1d0a9293c8484d0f7468caa7177e75a559baf9c` (`fix: enforce Remote Work Internet role`)

Branch збережено для окремого рішення користувача. `main`, live demo та deployment не змінювалися; push, merge і deploy не виконувалися.

## Supervisor checkpoint

Weekly Capstone Progress Report — Week 2 відправлено Тетяні через LMS; у Slack надіслано report + live demo.

Статус: **submitted → awaiting supervisor feedback**.

## User-facing MVP v1 — accepted branch state

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

## Task 7 — browser acceptance

Локальний Browser walkthrough (HTTP `200`) підтвердив AC-12: Home backup `80 W` / `360 min`, Router і ONT/ONU по `360 min`, Laptop `480 min` (`360` external + `120` internal), Remote Work `Limited` / `360 min`, limiting dependencies Router + ONT/ONU та обидва causal paths.

Також перевірено:

- rerun без reload після provider `600 → 300`: Remote Work `300 min`, limiting Internet provider і відповідне пояснення;
- TV (`Other Load`, `70 W`) додано окремо й вибрано як additional load: `150 W`, `192 min`, TV не став service dependency, а вимкнення TV покращує кожен selected target щонайменше на `168 min (2.8 h)`;
- negative UI smoke без synthetic partial result: `INVALID_POSITIVE_NUMBER`, `BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED`, `MISSING_EXTERNAL_PROVIDER_AVAILABILITY`, `TEMPLATE_ROLE_CARDINALITY`.

## Final verification — 2026-08-20

На `f1d0a92` controller виконав:

- `cmd.exe /d /c npm test` у `apps/web` — exit `0`; `100 passed`, `0 failed`, `0 cancelled`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm run build` — exit `0`; Vite `8.2.1`, `32` modules transformed;
- worktree був чистим перед цим STATUS update;
- worktree і branch `git diff --check` — exit `0`;
- branch diff від merge base `6a18be4` під `apps/web/src/simulation` — `0` lines;
- dependency diff для `apps/web/package.json` і `apps/web/package-lock.json` — exit `0`, empty;
- implemented placeholder scan і branch-diff secret-pattern heuristic — по `0` matches.

До цього STATUS update branch містив `13` implementation/documentation commits.

## Final whole-branch review

Reviewer перевірив range `6a18be4..b8a027d` і повернув `CHANGES REQUESTED` для одного Major: `Remote Work` приймав `ServiceInstance`, що не є Internet. Єдина fix wave у `f1d0a92` додала metadata-driven allowed-template constraint, незалежне builder enforcement, UI/form filtering і regressions.

Scoped re-review: Major **ADDRESSED**, нових Critical/Major/Minor breakage немає. Final verdict: **All findings addressed, no new Critical/Major breakage**. Final whole-branch review accepted at `f1d0a92`.

Неblocking follow-up context:

- AC-07 test використовує equivalent models замість exact same model;
- AC-12 integration test не має direct assertions `totalPowerW === 80` і nested Internet `360`;
- повторені same-code/same-field React validation errors можуть мати duplicate keys;
- `docs/specs/repository-workflow.md` містить stale W/Wh-out-of-scope prose. Його не змінювати без окремого user approval; accepted user-facing spec залишається binding.

Попередній Minor щодо blank `maxOutputPowerW` закрито: current test прямо перевіряє omission.

## Source of truth

- `docs/STATUS.md` — поточний operational snapshot;
- `docs/specs/user-facing-mvp-v1.md` — accepted contract;
- `docs/specs/user-facing-mvp-v1-acceptance.md` — accepted AC-01…AC-14;
- `docs/specs/repository-workflow.md` — agent workflow.

## Наступна дія

Потрібне окреме рішення користувача перед merge у `main` або deployment. Optional Minor cleanup і рішення щодо stale workflow documentation виконувати лише в окремому погодженому scope.
