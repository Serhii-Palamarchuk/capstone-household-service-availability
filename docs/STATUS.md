# Поточний стан проєкту

## Поточний етап

Завершено й прийнято:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- `User-facing MVP v1`: design, acceptance scenarios `AC-01…AC-14`, implementation, final whole-branch review, cleanup, merge у `main`, deployment і post-deploy live smoke.

User-facing MVP feature branch `feature/user-facing-mvp-v1` fast-forward merged у `main`. Після push remote `main` і feature branch були ідентичні на commit `cd150c679cd38c92759affc308a1bea794e5ea59`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

2026-08-20 користувач підтвердив, що live deployment відкривається після merge/push. Post-deploy browser smoke основного accepted flow AC-12 також пройдено на live deployment.

## Supervisor checkpoint

Weekly Capstone Progress Report — Week 2 відправлено Тетяні через LMS; у Slack надіслано report + live demo.

Статус: **submitted → awaiting supervisor feedback**.

## User-facing MVP v1 — deployed state

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

Після cleanup у `2fb38d0` controller підтвердив:

- `cmd.exe /d /c npm test` у `apps/web` — exit `0`; `100 passed`, `0 failed`, `0 cancelled`, `0 skipped`, `0 todo`;
- `cmd.exe /d /c npm run build` — exit `0`; Vite `8.2.1`, `32` modules transformed;
- browser smoke повторених validation errors — passed; обидві помилки відрендерилися, console warnings/errors — `0`;
- focused cleanup tests — `5/5 passed`, exit `0`;
- `git diff --check` — exit `0`;
- branch diff від merge base `6a18be4` під `apps/web/src/simulation` — `0` lines;
- dependency diff для `apps/web/package.json` і `apps/web/package-lock.json` — exit `0`, empty;
- implemented placeholder scan і branch-diff secret-pattern heuristic — по `0` matches.

Після fast-forward merge у локальний `main` користувач повторно виконав перевірку:

- `npm test` — `100 passed`, `0 failed`;
- `npm run build` — Vite `8.2.1`, `32` modules transformed, build successful;
- working tree був clean перед push;
- `main` push-нуто до GitHub;
- live deployment після push відкривається.

Post-deploy live browser smoke AC-12 підтвердив на GitHub Pages:

- Home backup: `80 W`, runtime `360 min`;
- Router: `360 min` external, `360 min` total;
- ONT/ONU: `360 min` external, `360 min` total;
- Laptop: `360 min` external + `120 min` internal = `480 min` total;
- target `Remote Work`: availability `360 min`, status `Limited`;
- limiting dependencies: `ONT/ONU` і `Router`;
- causal paths: `Remote Work → Internet — Home → ONT/ONU` та `Remote Work → Internet — Home → Router`;
- warning `MISSING_BACKUP_SOURCE_MAX_OUTPUT` відображено очікувано, оскільки optional max output не задавався.

Ці значення є контрольними test fixtures accepted AC-12, а не результатами реальних вимірювань автономності.

## Final whole-branch review

Reviewer перевірив range `6a18be4..b8a027d` і повернув `CHANGES REQUESTED` для одного Major: `Remote Work` приймав `ServiceInstance`, що не є Internet. Єдина fix wave у `f1d0a92` додала metadata-driven allowed-template constraint, незалежне builder enforcement, UI/form filtering і regressions.

Scoped re-review: Major **ADDRESSED**, нових Critical/Major/Minor breakage немає. Final verdict: **All findings addressed, no new Critical/Major breakage**. Final whole-branch review accepted at `f1d0a92`.

Усі чотири non-blocking Minor follow-ups закрито у `2fb38d0`: посилено AC-07 і AC-12 tests, виправлено React keys для повторених validation errors та актуалізовано product-scope text у `docs/specs/repository-workflow.md`. Scoped cleanup Reviewer verdict: **ACCEPTED**, Critical/Major/Minor findings немає.

## Source of truth

- `docs/STATUS.md` — поточний operational snapshot;
- `docs/specs/user-facing-mvp-v1.md` — accepted contract;
- `docs/specs/user-facing-mvp-v1-acceptance.md` — accepted AC-01…AC-14;
- `docs/specs/repository-workflow.md` — agent workflow.

## Наступна дія

Milestone `User-facing MVP v1` повністю інтегрований, deployed і перевірений на live accepted flow. Далі — Week 3: зафіксувати фактичний feedback Тетяни після перегляду актуального live demo та, лише якщо feedback не змінює напрям, продовжити первинне тестування/UX-polish без розширення scope.