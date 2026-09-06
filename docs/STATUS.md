# Поточний стан проєкту

Оновлено: 2026-09-06 (Week 7 accepted; допуск керівника до plagiarism check / підготовка до захисту).

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
- Week 6 — **accepted**. Користувач підтвердив це скриншотом LMS 2026-09-05 (`Завдання прийнято`).
- Week 7 — **accepted**. Користувач підтвердив це скриншотом LMS 2026-09-06 (`Завдання прийнято`). У feedback керівника зазначено, що роботу прийнято й допущено до перевірки на плагіат; керівник також повідомив, що може допустити роботу до захисту.
- Feedback керівника від 2026-09-03 і консультації 2026-09-04 опрацьовано адресно без зміни scope/MVP.
- `Weekly Capstone Progress Report — Week 6` актуалізовано: фактичні 53 сторінки, форматувальний pass, синхронізація comments і повторна PDF-перевірка.
- Пояснювальну записку відправлено на перевірку; 2026-09-05 виявлено новий відкритий supervisor comment щодо недостатньої кількості джерел.
- Bibliography feedback опрацьовано адресно: додано джерела `[27]–[38]`, і загальна кількість фактично оформлених джерел становить **38**.
- Нові джерела реально використано в §2.1 і §2.3 для підтвердження W/Wh-співвідношень, характеристик накопичувачів/BESS, деградації батарей, інфраструктурних взаємозалежностей, каскадних ефектів, water-power dependency, NIST resilience guidance і fault-tree analysis.
- Усі нові фрагменти, нові citations `[27]–[38]`, нові bibliography entries і скориговані page numbers позначені помаранчевим `#E65900` для review користувачем.
- Після додаткового змістового доповнення висновків до Розділу 2 PDF має **56 сторінок**; bibliography починається на стор. **53**; Appendix A — стор. **56**. Стор. 26 заповнено змістовним підсумком без штучного filler; Розділ 3 починається зі стор. 27. Зміст, список таблиць і список рисунків повторно синхронізовано; PDF visual QA стор. 26–27 — без clipping/overlap.
- Supervisor comment щодо кількості джерел поки **не закривати**, доки Сергій не перегляне помаранчеві зміни.
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
- 2026-09-05 пояснювальну записку відправлено на перевірку. Після цього виявлено 1 новий відкритий supervisor comment: `мало джерел, треба хоча б 35-40; додайте може документації ще, або наукових статей по вашій темі; книги про електрику (формули)`.
- Поточний стан comments станом на 2026-09-05: **30 total, 0 open**. Feedback щодо bibliography опрацьовано до 38 джерел. Scope/MVP/архітектуру не змінювали.

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

1. Week 7 accepted; роботу допущено керівником до перевірки на плагіат. Не заявляти результат plagiarism check, доки його фактично не отримано.
2. Виконати фінальну репетицію доповіді до 7 хвилин і підготувати live demo / резервні скриншоти.
3. Провести остаточний PDF visual QA та перевірити фінальні файли перед захистом.
4. Не змінювати scope/MVP/архітектуру без нового окремого рішення.
5. Фінальне live demo ще не проведено; feedback після нього не вигадувати.
