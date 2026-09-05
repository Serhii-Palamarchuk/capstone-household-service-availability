# Поточний стан проєкту

Оновлено: 2026-09-05 (після консультації, фінального pass пояснювальної записки та подання на перевірку).

## Поточний етап

Завершені milestones: `Simulation Engine v1`, `React Demo v1`, `Deploy v1`, `User-facing MVP v1`, `UX Polish v1`.

Live URL: https://serhii-palamarchuk.github.io/capstone-household-service-availability/

Архітектура MVP: React SPA + Vite, client-side runtime, GitHub Pages; backend і БД відсутні. Без окремого рішення не змінювати Simulation Engine v1, Availability Estimator formulas, service-template semantics, status semantics і recommendation logic.

Нові функції до завершення пояснювальної записки та фінального демо не додавати.

## Reporting checkpoint

- Week 2 — accepted.
- Week 3 — accepted 2026-08-21.
- Week 4 — accepted 2026-08-24.
- Week 5 — accepted.
- Week 6 було подано, але домашнє завдання повернуто керівником на доопрацювання через зауваження до пояснювальної записки.
- Feedback керівника від 2026-09-03 опрацьовано; пояснювальну записку виправлено й повторно перевірено.
- `Weekly Capstone Progress Report — Week 6` актуалізовано для повторного подання: 57 сторінок замінено на фактичні 53; додано факт повторного форматувального pass за feedback; уточнено статус comments і повторної PDF-перевірки; план змінено на повторне подання Week 6.
- Week 6 було повторно подано, але 2026-09-04 о 04:05 керівник знову повернув домашнє завдання на доопрацювання з повідомленням: `Завтра на консультації будемо разом правити.`
- 2026-09-04 відбулася спільна консультація; feedback по пояснювальній записці опрацьовано адресно без зміни scope/MVP.
- 2026-09-05 користувач підтвердив, що пояснювальну записку **відправлено на перевірку**.
- Поточний статус: **submission/check in progress**. Результат перевірки, acceptance Week 6/Week 7 або plagiarism report НЕ вважати отриманими без фактичного підтвердження користувача.
- У supervisor-facing звітах без потреби не використовувати ім’я керівника; достатньо нейтральних формулювань `керівник` / `науковий керівник`.
- Фінальне демо ще НЕ проведено. Не приписувати йому результати або feedback до фактичного проведення.

## Explanatory note checkpoint

Робочий Google Doc: https://docs.google.com/document/d/1sWA7sMvRp_X0hZUpSc310kh-wJ_fARo6OipjGoFtLB8/edit?usp=drivesdk

Chapters 1–5, AI declaration, bibliography й Appendix A змістовно заповнені. Нового змісту не додавати без конкретної виявленої прогалини.

### Feedback Week 6 — виправлено 2026-09-03

Усі 9 supervisor comments від 2026-09-03 опрацьовано, перевірено у PDF і після цього закрито:

1. весь текст приведено до чорного кольору;
2. прибрано вбудовані вертикальні відступи;
3. анотація вміщується на одній сторінці — стор. 9;
4. назви підрозділів — 12 pt, bold, вирівнювання ліворуч; назви розділів — 14 pt, bold, по центру;
5. прибрано штучну розрідженість сторінок без додавання штучного тексту;
6. рисунки й таблиці приведено до Шаблону: table caption над таблицею зліва, figure caption під рисунком по центру, чорний Times New Roman, одинарний інтервал у підписах;
7. підписи використовують двокрапку після номера;
8. зайву жирність у звичайному тексті та таблицях прибрано;
9. після кожного рисунка й таблиці є текстове пояснення / аналіз.

Після переверстки PDF має **53 сторінки**. Зміст, список таблиць і список рисунків синхронізовані з фактичною пагінацією. PDF visual QA: без clipping/overlap/broken glyphs у перевіреному експорті; титульна сторінка чорна; основні рисунки/таблиці й сусідні пояснення перевірені.

Scope, MVP та архітектура не змінювалися.

### Consultation + final note pass — 2026-09-04/05

- Опрацьовано feedback 7-ї щотижневої консультації: короткі підсумки після підрозділів, розгорнуті висновки до розділів, narrative style, розмежування analysis/gap у Chapter 2 і власних requirements у Chapter 3, читабельність/оформлення Chapter 4, code listings замість screenshots.
- У робочій записці контрольний стан supervisor comments: **23 total, 0 open**.
- Screenshots коду замінено на `Лістинг 4.1` і `Лістинг 4.2`; наступні рисунки перенумеровано на `Рисунок 4.5` і `Рисунок 4.6`, усі текстові посилання синхронізовано.
- Фінально синхронізовано зміст, список таблиць і список рисунків із фактичною пагінацією; виправлено heading styles, numbering, `рис.` references, лапки/пунктуацію та залишкові великі порожні зони.
- Актуальний PDF checkpoint: **53 сторінки**; bibliography — стор. 51; Appendix A — стор. 53.
- Дати узгоджено: submission date `04.09.2026`; AI declaration period `20.07.2026–04.09.2026`; declaration signature date `04 вересня 2026`.
- 2026-09-05 пояснювальну записку відправлено на перевірку. До отримання результату не робити нових широких змістових правок.

## Verification baseline

- automated suite: `141 passed`, `0 failed`, `0 skipped`;
- Vite `8.2.1` production build: success, `36 modules transformed`;
- `git diff --check`: PASS;
- whole-branch review: initial `2 Major + 2 Minor` fixed; final `ACCEPTED`;
- browser/manual acceptance: PASS;
- post-deploy live smoke: PASS;
- performance baseline: local `runUserScenario`, 1 000 warm-up, 5 × 20 000 measured = 100 000 runs; Node.js `v24.19.0`, Linux x86_64, Xeon E5-2673 v4 @ 2.30 GHz; median `0.026 ms/run`, mean `0.028 ms/run`; calculation loop only, no browser/network/low-end-device claim and no predefined acceptance threshold;
- external usability study and screen-reader evaluation НЕ проводилися.

## Постійні правила редагування записки

- Для нових змістовних правок ChatGPT/Codex за потреби використовувати помаранчеве `#E65900`, щоб Сергій бачив нові зміни.
- Звичайний основний текст зберігати `Justify`.
- Редагувати лише цільовий фрагмент; після структурних змін перевіряти сусідні рисунки/таблиці та page breaks у PDF.
- Назви UI: українська назва першою, точна англійська — у дужках.
- Внутрішні identifiers у прозі спочатку пояснювати українською, точний identifier давати в дужках.
- Після кожного редагування повідомляти розділ/підрозділ і сторінки за поточною пагінацією.
- Не вигадувати usability study, screen-reader results, фінансування, фактичні device measurements або test numbers.

## Source of truth

1. Google Drive `Capstone Project Context — Software Engineering`.
2. `docs/STATUS.md`.
3. `docs/DECISIONS.md` + accepted specs.
4. Working explanatory note in Google Drive.

## Наступна дія

1. Чекати фактичний результат перевірки пояснювальної записки.
2. Після отримання результату зафіксувати acceptance/новий feedback або plagiarism report; за потреби внести лише адресні правки й повторити PDF visual QA.
3. Не змінювати scope/MVP/архітектуру без нового окремого рішення.
4. Після стабілізації записки перейти до фінальної презентації та сценарію захисту/live demo.
