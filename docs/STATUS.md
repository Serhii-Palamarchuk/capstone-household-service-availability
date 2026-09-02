# Поточний стан проєкту

Оновлено: 2026-09-03 (після повторного проходу feedback Тетяни та посилення технічної частини пояснювальної записки).

## Поточний етап

Завершені milestones: `Simulation Engine v1`, `React Demo v1`, `Deploy v1`, `User-facing MVP v1`, `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; backend і БД відсутні. Без окремого рішення не змінювати Simulation Engine v1, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic.

Нові функції до завершення пояснювальної записки та фінального демо не додавати.

## Reporting checkpoint

- Week 2 — accepted.
- Week 3 — accepted 2026-08-21.
- Week 4 — accepted Тетяною 2026-08-24.
- Week 5 — accepted; коментар Тетяни: «Вітаю, для тижня 5 добре. В тиждень 6 треба відправити готову пояснювальну записку.»
- Отже результат Week 6 — готова пояснювальна записка, а не чернетка.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Chapters 1–5, AI declaration і Appendix A змістовно заповнені. Поточний пріоритет — завершити лише обґрунтовані змістовні правки за feedback, потім форматування A4 і фінальний PDF QA.

### Повторний supervisor-feedback pass — 2026-09-03

Після повторного проходу транскриптів Тетяни виконано такі релевантні до цього проєкту правки:

- у §2.2 після кожного з рисунків 2.1 NuWatt, 2.2 Wattlix і 2.3 TRN Lite додано окрему текстову інтерпретацію того, що саме ілюстрація підтверджує для аналізу аналогів;
- у «Висновках до другого розділу» прибрано citations; висновки переформульовано як власний синтез уже проаналізованих джерел і рішень;
- у §3.2 додано Таблицю 3.3 «Основні ітерації розробки та способи перевірки»: Simulation Engine v1 → React Demo v1 → Deploy v1 → User-facing MVP v1 → UX Polish v1; колонки `Етап / Основний результат / Перевірка`;
- у §3.5 розширено стратегію тестування фактичними рівнями: unit tests на `node:test` / `node:assert/strict`, інтеграційний pipeline `runUserScenarioCore → Scenario.availability → Simulation Engine`, negative cases і manual/browser acceptance; кількісні результати залишаються в Chapter 4 лише за фактичними runs;
- у §3.6 розширено фактичні виклики: контроль scope, якість/валідація вхідних даних і структурна коректність графа, баланс explainability з простотою UI, межі deterministic W/Wh-моделі;
- у §4.2 додано компактне фактичне дерево `apps/web/src` з `components/user-mvp`, `user-mvp` і `simulation`; source paths перевірено проти актуального `main`, дерево оформлено Courier New 10 pt;
- Section 4.2 уже містить два фактичні code fragments: Availability Estimator shared-load/runtime calculation і Simulation Engine recursive dependency calculation;
- програмний код і product semantics під час цього documentation pass не змінювалися; нового запису в `docs/DECISIONS.md` не потрібно.

### Рисунок 3.2 / Mermaid

Створено Mermaid-source:

`docs/service-availability-evaluation-diagram.md`

Commit створення: `e2906feb41753f9bd39ffd9c8900eec46cb5b9f6`.

Діаграма відображає фактичний pipeline: target services / required dependencies → active devices → BackupSource/shared load → max-output validation → runtime → Device/ExternalProvider availability → `Scenario.availability` → DAG validation → recursive Service calculation → `T=min(...)` → Available/Limited/Unavailable → limiting dependencies / causal paths.

У записці підпис уже змінено на `Рисунок 3.2 — Діаграма алгоритмічної послідовності оцінювання доступності сервісу`. Поточне текстове подання є тимчасовим; Сергій зробить screenshot Mermaid і замінить ним цей блок перед фінальним форматуванням.

### Financial viability checkpoint

- Для поточного public MVP GitHub Free, GitHub Pages і стандартні GitHub-hosted runners для GitHub Actions використовуються безкоштовно в межах чинних умов для публічного репозиторію; це не означає нульову загальну вартість супроводу.
- GitHub Pages не позиціонується як безкоштовний hosting комерційного SaaS.
- Labor planning scenario: DOU median developer salary June 2026 = 3500 дол. США/місяць net, sample 4541 developers; planning assumptions 160 h/month and 8 h support/month → 21.9 дол. США/h → 175 дол. США/month → 2100 дол. США/year. Це сценарна оцінка, не виміряна трудомісткість і не grant rate.
- Точний TAM не заявляється. Як proxy одного Internet-сценарію наведено official NCEC/Ukrstat 2023 fixed-Internet indicator 62 per 100 households із зазначеними джерелом обмеженнями.
- Підтверджених домовленостей про фінансування немає; grants/partners/local-government support залишаються рекомендаціями Future Work.

## Поточний PDF / верстка

Fresh export після supervisor-feedback pass:

- 55 сторінок;
- формат усе ще US Letter `612 × 792 pt`;
- поточні сторінки до переходу на A4: пояснення рис. 2.1–2.3 — 17–19; висновки Chapter 2 — 24; Таблиця 3.3 — 30; Рисунок 3.2 — 35; §3.5 — 36; §3.6 — 37; source tree у §4.2 — 43; code fragments 4.1/4.2 — 44–45; financial block — приблизно 50–51;
- visual QA сторінок 17–19, 24, 30, 35–37, 43–45: видимого clipping/overlap немає;
- після A4/page breaks номери сторінок потрібно визначити повторно.

У змісті ще залишаються `#` замість фінальних номерів сторінок; списки рисунків і таблиць потрібно оновити після остаточної пагінації.

## Supervisor comments in Google Docs

Відкритий один comment: `додати що буде вміти проєкт`. Вимогу вже змістовно враховано у Chapter 1; comment не закривати без рішення Сергія або підтвердження керівника.

## Постійні правила редагування записки

- Усе, що ChatGPT/Codex додає або змістовно змінює, позначати помаранчевим `#E65900`; незмінений текст залишати чорним. Не прибирати orange без прямої команди Сергія.
- Назви UI: українська назва першою, точна англійська — у дужках.
- В академічній прозі український технічний термін подавати першим; exact identifier/path/code залишати без перекладу там, де це природно.
- Після кожного редагування повідомляти розділ/підрозділ і сторінки за поточною пагінацією; якщо пагінація не фінальна — прямо це зазначати.
- Не вигадувати usability study, screen-reader results, фінансування, фактичні device measurements або test numbers.

## Verification baseline

- automated suite: `141 passed`, `0 failed`, `0 skipped`;
- Vite `8.2.1` production build: success, `36 modules transformed`;
- `git diff --check`: PASS;
- whole-branch review: initial `2 Major + 2 Minor` fixed; final `ACCEPTED`;
- browser/manual acceptance: PASS;
- post-deploy live smoke: PASS;
- performance baseline: local `runUserScenario`, 1 000 warm-up, 5 × 20 000 measured = 100 000 runs; Node.js `v24.19.0`, Linux x86_64, Xeon E5-2673 v4 @ 2.30 GHz; median `0.026 ms/run`, mean `0.028 ms/run`; calculation loop only, no browser/network/low-end-device claim and no predefined acceptance threshold;
- external usability study and screen-reader evaluation НЕ проводилися.

## Source of truth

1. Google Drive `Capstone Project Context — Software Engineering`.
2. `docs/STATUS.md`.
3. `docs/DECISIONS.md` + accepted specs.
4. Working explanatory note in Google Drive.

## Наступна дія

1. Сергій робить screenshot Mermaid із `docs/service-availability-evaluation-diagram.md` і замінює ним тимчасовий блок Рисунка 3.2.
2. Перевести записку з US Letter у A4, зберігши поля, і налаштувати фінальні page breaks.
3. Оновити списки рисунків/таблиць та номери сторінок у змісті.
4. Виконати повний PDF visual QA і виправити лише фактичні проблеми верстки.
5. Після прямого підтвердження Сергія прибрати помаранчеве маркування, експортувати фінальний PDF і передати Тетяні готову записку.
6. Після завершення записки підготувати й відрепетирувати 15-хвилинне фінальне демо та Week 6 materials.
