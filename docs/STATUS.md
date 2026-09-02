# Поточний стан проєкту

Оновлено: 2026-09-03 (після уточнення технічних ілюстрацій і нумерації рисунків у Розділі 4).

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
- у §3.5 розширено стратегію тестування фактичними рівнями: unit tests на `node:test` / `node:assert/strict`, інтеграційний ланцюг від нормалізованих користувацьких даних через основну функцію інтеграційного модуля (`runUserScenarioCore`) до карти часової доступності компонентів сценарію (`Scenario.availability`), далі до Simulation Engine; також описано negative cases і manual/browser acceptance;
- у §3.6 розширено фактичні виклики: контроль scope, якість/валідація вхідних даних і структурна коректність графа, баланс explainability з простотою UI, межі deterministic W/Wh-моделі;
- у §4.2 додано фактичне дерево `apps/web/src`; на рівні каталогів прямо підписано їхню роль: `components/user-mvp` — інтерфейс кроків 1–4, `user-mvp` — підготовка сценарію й оцінювання, `simulation` — перевірка графа й симуляція. Після дерева додано пояснення розподілу відповідальностей між UI, user-facing calculation layer і незалежним simulation core;
- два ключові фрагменти коду в §4.2 оформлено як читабельні screenshot-рисунки із syntax highlighting: Рисунок 4.5 — shared-load/runtime calculation Availability Estimator; Рисунок 4.6 — recursive dependency calculation Simulation Engine. Пояснення після них прив’язує реалізацію до FR-05/FR-06 та FR-08/FR-09/NFR-03;
- evidence-рисунки тестування та deployment перенумеровано відповідно до порядку появи: Рисунок 4.7 — automated tests; Рисунок 4.8 — GitHub Actions build/deploy;
- програмний код і product semantics під час цього documentation pass не змінювалися; нового запису в `docs/DECISIONS.md` не потрібно.

### Рисунок 3.2 / Mermaid

Канонічний Mermaid-source:

`docs/diagrams/service-availability-evaluation-diagram.md`

Попередній файл `docs/service-availability-evaluation-diagram.md` видалено з remote main.

Діаграму скорочено до чотирьох основних блоків: вхідні дані → оцінювання автономності → симуляція залежностей → пояснюваний результат. Детальні внутрішні гілки валідації залишені в §3.4 та canonical specs, щоб рисунок був читабельним на одній сторінці.

У записці вже використано screenshot компактної версії з підписом `Рисунок 3.2 — Діаграма оцінювання доступності сервісу`.

### Financial viability checkpoint

- Для поточного public MVP GitHub Free, GitHub Pages і стандартні GitHub-hosted runners для GitHub Actions використовуються безкоштовно в межах чинних умов для публічного репозиторію; це не означає нульову загальну вартість супроводу.
- GitHub Pages не позиціонується як безкоштовний hosting комерційного SaaS.
- Labor planning scenario: DOU median developer salary June 2026 = 3500 дол. США/місяць net, sample 4541 developers; planning assumptions 160 h/month and 8 h support/month → 21.9 дол. США/h → 175 дол. США/month → 2100 дол. США/year. Це сценарна оцінка, не виміряна трудомісткість і не grant rate.
- Точний TAM не заявляється. Як proxy одного Internet-сценарію наведено official NCEC/Ukrstat 2023 fixed-Internet indicator 62 per 100 households із зазначеними джерелом обмеженнями.
- Підтверджених домовленостей про фінансування немає; grants/partners/local-government support залишаються рекомендаціями Future Work.

## Поточний PDF / верстка

Fresh export після останніх правок:

- 55 сторінок;
- формат усе ще US Letter `612 × 792 pt`;
- §3.5 із поясненим інтеграційним ланцюгом — стор. 36;
- структура репозиторію — стор. 43;
- Рисунок 4.5 (Availability Estimator code screenshot) — стор. 44;
- Рисунок 4.6 (recursive Simulation Engine code screenshot) — стор. 45;
- Рисунок 4.7 (automated tests) — стор. 46;
- Рисунок 4.8 (GitHub Actions build/deploy) — стор. 47;
- visual QA стор. 44–45: screenshots читабельні, clipping/overlap не виявлено;
- після A4/page breaks номери сторінок потрібно визначити повторно.

У змісті ще залишаються `#` замість фінальних номерів сторінок; списки рисунків і таблиць потрібно оновити після остаточної пагінації.

## Supervisor comments in Google Docs

Відкритий один comment: `додати що буде вміти проєкт`. Вимогу вже змістовно враховано у Chapter 1; comment не закривати без рішення Сергія або підтвердження керівника.

## Постійні правила редагування записки

- Усе, що ChatGPT/Codex додає або змістовно змінює, позначати помаранчевим `#E65900`; незмінений текст залишати чорним. Не прибирати orange без прямої команди Сергія.
- Назви UI: українська назва першою, точна англійська — у дужках.
- В академічній прозі український технічний термін подавати першим; exact identifier/path/code залишати без перекладу там, де це природно.
- Внутрішні програмні назви не використовувати як «магічні» терміни. Для функцій, об’єктів, полів і внутрішніх контрактів спочатку пояснювати українською їхній зміст/роль, а точний identifier давати в дужках. Приклади: `основна функція інтеграційного модуля (runUserScenarioCore)`, `карта часової доступності компонентів сценарію (Scenario.availability)`.
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

1. Перевести записку з US Letter у A4, зберігши поля, і налаштувати фінальні page breaks.
2. Оновити списки рисунків/таблиць та номери сторінок у змісті.
3. Виконати повний PDF visual QA і виправити лише фактичні проблеми верстки.
4. Після прямого підтвердження Сергія прибрати помаранчеве маркування, експортувати фінальний PDF і передати Тетяні готову записку.
5. Після завершення записки підготувати й відрепетирувати 15-хвилинне фінальне демо та Week 6 materials.
