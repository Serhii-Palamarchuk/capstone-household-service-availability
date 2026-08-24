# Поточний стан проєкту

## Поточний етап

Завершено й прийнято:

- `Simulation Engine v1`;
- `React Demo v1`;
- `Deploy v1`;
- `User-facing MVP v1` — design, `AC-01…AC-14`, implementation, review/cleanup, merge, deployment і post-deploy live smoke;
- `UX Polish v1` — accepted design, `UX-01…UX-30`, implementation, review, merge у `main`, deployment і post-deploy live smoke.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Поточний deployed flow:

```text
Equipment → Backup → Services & Scenario → Result
```

`Simulation Engine v1`, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic залишаються незмінними відносно accepted User-facing MVP v1 contract.

## Supervisor / reporting checkpoint

Weekly Capstone Progress Report — Week 2 прийнятий Тетяною; окремих текстових коментарів або нового feedback після прийняття не зафіксовано.

Weekly Capstone Progress Report — Week 3 прийнятий Тетяною в LMS 2026-08-21. Окремого текстового feedback, зауважень або нових вимог після прийняття не зафіксовано.

Week 3 reporting checkpoint закритий як accepted. Звітна межа зберігається: Week 3 report охоплює User-facing MVP v1, його testing/deploy/live smoke та підготовку UX Polish v1. Реалізація, verification, merge/deploy і live smoke UX Polish v1 належать до Week 4 report.

Підготовлено робочу чернетку `Weekly Capstone Progress Report — Week 4`: https://docs.google.com/document/d/1GC0L-_VHXMbJqyynj_lUVf2aCitn8hfnef8pvYpJUK8/edit?usp=drivesdk.

### Second demo / supervisor feedback — 2026-08-24

Під час п’ятої щотижневої зустрічі проведено фактичне друге демо актуального User-facing MVP. Транскрипт: https://docs.google.com/document/d/1AxMOqf5KXgdL1n7CVNgkIssgTTQKqNSgtjoOiLBE8kQ/edit?tab=t.0. Сегмент користувача починається приблизно з `22:51`; попередня частина зустрічі стосується іншого студента й не повинна приписуватися цьому проєкту.

Ключовий feedback Тетяни:

- ідею та поточний стан проєкту оцінено позитивно; після live demo концепція зрозуміла;
- поточний мінімальний функціональний scope достатній для MVP; нових обов’язкових функцій не вимагалося;
- React SPA без окремого backend допустима для поточного MVP, оскільки немає user cabinet/auth/history або даних, що потребують серверного зберігання; backend слід додавати лише за появи конкретної вимоги;
- основний пріоритет тепер — суттєво деталізувати пояснювальну записку, а не ускладнювати реалізацію;
- назви підрозділів мають бути специфічними до теми, а не копіювати placeholder-назви методички;
- Розділ 2 потрібно розширити теорією, науковими публікаціями, поясненням оцінювання автономності, детальнішим аналізом аналогів, скриншотами за доречності й текстовою інтерпретацією таблиць; gap залишати тільки за достатньої доказовості;
- Розділ 3: пояснювати таблиці вимог у прозі, явно описати межі MVP, деталізувати фактичні ітерації розробки, обґрунтувати клієнтську архітектуру/React і додати формули/деталі Availability Estimator та Simulation Engine;
- рекомендовано об’єднати поточні 3.3 і 3.4 у змістовний підрозділ на кшталт `Обґрунтування архітектури та технологічного стеку проєкту`;
- Розділ 4 має документувати фактичний результат: UI screenshots, технічну реалізацію, структуру/фрагменти коду за потреби, validation/calculation details і реальні test results;
- для висновків/захисту потрібно продумати масштабування та базову модель підтримки/фінансування; можливі гранти/фонди/держава/місцеві органи або інші моделі, але будь-які числові оцінки повинні спиратися на реальні джерела/розрахунки;
- AI use у пояснювальній записці потрібно явно задекларувати з поясненням де і для чого він застосовувався;
- форматування: перевірити 12 pt, 1.5 line spacing і прибрати зайві bold/italic виділення; фінальне форматування можна робити після наповнення;
- озвучена дата подання — `2026-09-14`;
- до наступної зустрічі принести готові Розділи 1–4; Розділ 5 — якщо дозволить час.

Чернетку Week 4 report після demo оновлено фактичним feedback; second demo більше не pending. Week 4 report ще не зафіксований як submitted/accepted.

## UX Polish v1 — accepted contract

Accepted docs:

- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md` (`UX-01…UX-30`);
- `docs/DECISIONS.md` — D-005;
- `docs/plans/ux-polish-v1.md` — 8-task implementation plan.

Ключовий contract:

- compact rows + progressive details;
- 4-step wizard із backward stepper та окремою `Back`-кнопкою;
- desktop acceptance viewport `1920 × 1080` і no-scroll baseline для density fixture;
- optional custom `Name` для Device / BackupSource / Service з deterministic fallback;
- adaptive backup assignment;
- compact Services і decision-first Result;
- quick edit `usableCapacityWh`, `maxOutputPowerW` та outage duration через standard normalization → estimator → simulation pipeline;
- stale-result protection;
- UA/EN без third-party i18n dependency;
- ExternalProvider name лишається required;
- без змін engine/estimator/template/recommendation semantics.

## Week 4 — UX Polish v1 verification та integration

Фінальна verification evidence до merge:

- full suite: `140 passed`, `0 failed`, `0 skipped`;
- production build: Vite `8.2.1`, `36 modules transformed`, успішно;
- `git diff --check` — без помилок;
- whole-branch review: початкові `2 Major` і `2 Minor` виправлено; нових `Critical` / `Major` / `Minor` findings немає; verdict `ACCEPTED`;
- browser/manual acceptance: desktop density, navigation/state retention, stale Result, validation discoverability, quick edit, rerun без reload, UA/EN state retention, keyboard acceptance — `PASS`;
- scope audit: без змін у `Simulation Engine v1`, Availability Estimator formulas, service templates, recommendations і dependency manifests.

Integration:

- feature branch синхронізовано з `origin/main` без rebase/переписування history;
- merge-ready remote HEAD: `0d6e383c0ae71c12b1497efe21f0a47ec80e068c`;
- локальний `main` fast-forward merged до `0d6e383c…`;
- перед push у `main` повторно запущено full suite: `140 passed`, `0 failed`, `0 skipped`;
- повторний production build: Vite `8.2.1`, `36 modules transformed`, успішно;
- повторні `git diff --check` і clean worktree — PASS;
- `main` push виконано; remote `main` і `feature/ux-polish-v1` після push були `identical` на `0d6e383c…`;
- GitHub Pages deployment для цього push завершився успішно за підтвердженням користувача.

## Post-deploy live smoke — UX Polish v1

Користувач фактично перевірив live GitHub Pages після deployment:

- новий compact Step 1 відкривається, EN/UA control видимий — PASS;
- EN → UA → EN зберігає current step і введені дані — PASS;
- backward stepper повертає на попередній step без втрати змінених values — PASS;
- Result запускається без page reload; backup quick edit + `Recalculate` оновлює result — PASS;
- після upstream зміни старий Result не подається як актуальний і потрібен новий run/recalculation — PASS.

Цей smoke підтверджує ключові live UX flows після deployment. Він не замінює окреме screen-reader testing; такого результату не зафіксовано.

## Source of truth

- `docs/STATUS.md` — current operational snapshot;
- `docs/DECISIONS.md` — accepted суттєві рішення;
- `docs/specs/user-facing-mvp-v1.md`;
- `docs/specs/user-facing-mvp-v1-acceptance.md`;
- `docs/specs/ux-polish-v1.md`;
- `docs/specs/ux-polish-v1-acceptance.md`;
- `docs/plans/ux-polish-v1.md`;
- `docs/specs/repository-workflow.md`.

## Наступна дія

Second demo completed; UX Polish v1 milestone залишається закритим як implemented → verified → merged → deployed → live-smoked.

Безпосередній пріоритет — довести пояснювальну записку до контрольної точки, яку попросила Тетяна: готові Розділи 1–4, а Розділ 5 — якщо дозволить час. Не розширювати MVP новими функціями без конкретної вимоги. Послідовність: (1) конкретизувати headings і посилити Chapter 1; (2) суттєво розширити Chapter 2 джерелами/теорією/аналізом аналогів; (3) деталізувати Chapter 3 та обґрунтувати client-side architecture; (4) написати Chapter 4 з фактичними screenshots/code/test evidence; (5) сформувати evidence-based future development / funding model для Chapter 5 і захисту; (6) після цього фіналізувати й подати Week 4 report.
