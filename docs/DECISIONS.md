# Журнал рішень

Цей файл зберігає лише **суттєві рішення**, які впливають на вимоги, предметну модель, алгоритм, архітектуру, scope або погоджений технологічний вибір.

Він не замінює канонічні документи. Поточна істина завжди має бути відображена у відповідному `PROJECT.md`, `DOMAIN_MODEL.md`, `SIMULATION.md`, `TEST_SCENARIOS.md` або іншій погодженій специфікації.

Не додавати сюди дрібні рефакторинги, перейменування локальних функцій, форматування чи звичайні implementation details, якщо вони не змінюють контракт або архітектурне рішення.

## Формат запису

```text
D-XXX — Назва
Date: YYYY-MM-DD
Status: Accepted | Superseded

Context:
...

Alternatives:
1. ...
2. ...

Criteria:
- ...

Decision:
...

Rationale:
...

Affected:
- docs/...
- implementation area
```

Якщо рішення замінене новим, старий запис не видаляється: його `Status` змінюється на `Superseded` із посиланням на новий `D-XXX`.

---

## D-001 — Репозиторій як спільний контекст для AI-агентів

Date: 2026-08-18
Status: Accepted

### Context

У проєкті можуть по черзі працювати ChatGPT, Claude Code, Codex, GitHub Copilot та інші coding agents. Історія одного чату або локальна пам’ять конкретного агента не є надійним способом передачі актуального стану між ними.

### Alternatives

1. Передавати контекст вручну в кожному новому чаті або task prompt.
2. Дублювати повну історію роботи в окремих інструкціях для кожного агента.
3. Використовувати GitHub-репозиторій як спільне джерело актуального контексту.

### Criteria

- однакова інформація для всіх агентів;
- мінімум дублювання;
- можливість відновити контекст у новій сесії;
- чітке розділення поточного стану, поточних правил і історії рішень;
- придатність для публічного репозиторію.

### Decision

Використовувати репозиторій як спільний контекст:

- `AGENTS.md` — стабільні правила роботи;
- `docs/STATUS.md` — короткий поточний operational snapshot, який перезаписується;
- канонічні `docs/*.md` — актуальні вимоги й технічні правила;
- `docs/DECISIONS.md` — append-only журнал суттєвих рішень і причин;
- `docs/plans/` — погоджені плани конкретних реалізацій;
- інструмент-специфічні instruction files повинні бути короткими bridge-файлами до спільного контексту, а не копіями правил.

Якщо під час реалізації виникає невизначеність, що потребує нового суттєвого рішення, Developer не вирішує її мовчки: фіксує `Q-XXX` у `STATUS.md`, призупиняє відповідну частину роботи та передає питання користувачу. Після рішення оновлюються `DECISIONS.md`, відповідний канонічний документ і `STATUS.md`.

### Rationale

Ця схема дозволяє різним агентам працювати послідовно без залежності від приватної історії конкретного чату та не перетворює `STATUS.md` на великий журнал.

### Affected

- `AGENTS.md`
- `docs/STATUS.md`
- `docs/DECISIONS.md`
- `docs/specs/repository-workflow.md`
- `.github/copilot-instructions.md`

---

## D-002 — GitHub Pages для Deploy v1

Date: 2026-08-19
Status: Accepted

### Context

`Simulation Engine v1` і `React Demo v1` завершені та прийняті. Для демонстрації керівнику потрібна публічна робоча версія без додавання backend або нової серверної інфраструктури.

Користувач підтвердив, що GitHub Pages проходився в межах навчальної програми.

### Alternatives

1. GitHub Pages через GitHub Actions.
2. Окремий static hosting provider (наприклад, Vercel/Netlify/Render).
3. Не робити deploy і демонструвати тільки локальний запуск.

### Criteria

- мінімальна нова інфраструктура;
- відповідність поточній статичній React/Vite архітектурі;
- публічний HTTPS URL;
- автоматичний build/deploy із `main`;
- відсутність backend і secrets;
- простота пояснення на захисті;
- технологія підтверджена користувачем як пройдена в навчальній програмі.

### Decision

Використати **GitHub Pages** як hosting для `Deploy v1` і **GitHub Actions** як build/deploy mechanism.

Vite repository base path:

`/capstone-household-service-availability/`

Deployment source:

`main → GitHub Actions → GitHub Pages`.

### Rationale

Поточний React Demo є повністю статичним і вже збирається Vite у `dist`, тому GitHub Pages вирішує конкретну вимогу публічної демонстрації без додавання серверної частини. Офіційна документація Vite прямо описує GitHub Pages deployment для Vite build, а GitHub підтримує Pages deployment через custom GitHub Actions workflow.

### Evidence

- Vite Documentation, **Deploying a Static Site — GitHub Pages**, accessed 2026-08-19: https://vite.dev/guide/static-deploy.html
- GitHub Docs, **Using custom workflows with GitHub Pages**, accessed 2026-08-19: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- GitHub Docs, **Deploying your website automatically**, accessed 2026-08-19: https://docs.github.com/en/get-started/start-your-journey/deploying-your-website-automatically

### Affected

- `docs/specs/deploy-v1.md`
- `docs/plans/deploy-v1.md`
- `apps/web/vite.config.js`
- `.github/workflows/deploy-pages.yml`
- `README.md`

---

## D-003 — Користувацький рівень введення після React Demo v1

Date: 2026-08-19
Status: Accepted

### Context

`React Demo v1` перевіряє `UI → simulate() → result`, але вимагає готові години availability Router, ONT/ONU та Internet Provider. Це підходить для vertical slice, але не для цільової ментальної моделі побутового користувача.

### Alternatives

1. Залишити пряме введення availability як фінальну UX-модель.
2. Додати configurator, але залишити ручне введення availability кожного Device.
3. Додати окремий user-facing layer обладнання та резервного живлення, який готує часові входи для engine.

### Criteria

- відповідність ментальній моделі кінцевого користувача;
- збереження перевіреного `Simulation Engine v1`;
- розділення energy estimation і service simulation;
- реалістичний scope;
- окреме тестування двох шарів.

### Decision

Поточний deployed Internet demo залишається першим vertical slice. Наступна user-facing ітерація будується за flow:

```text
Equipment + backup-power characteristics
                ↓
      availability estimation
                ↓
Services + functional dependencies
                ↓
        Simulation Engine v1
                ↓
availability + status + limiting cause + causal path
```

`ExternalProvider` може залишатися сценарним входом. Week 2 report, `React Demo v1` і `Deploy v1` не переписуються заднім числом.

### Rationale

Користувач працює з власним обладнанням і резервним живленням, а новий layer перетворює ці дані у часові inputs для вже протестованого engine.

### Affected

- `docs/PROJECT.md`
- `docs/STATUS.md`
- наступна user-facing spec/plan

---

## D-004 — User-facing MVP v1 contract

Date: 2026-08-19
Status: Accepted

### Context

Після D-003 потрібно було визначити точний мінімальний contract availability estimation, структуру сервісів, validation і межі наступної user-facing ітерації.

### Alternatives

1. Залишити availability Device ручним input.
2. Побудувати детальний електричний симулятор із динамічними навантаженнями та втратами.
3. Використати детерміновану W/Wh-модель з обмеженим набором параметрів і predefined service templates.

### Criteria

- зрозумілість для побутового користувача;
- достатня реалістичність для головної гіпотези;
- пояснюваний deterministic calculation;
- збереження `Simulation Engine v1`;
- невеликий індивідуальний scope;
- можливість unit/integration testing.

### Decision

Прийнято `docs/specs/user-facing-mvp-v1.md` як contract наступної MVP ітерації.

Ключові рішення:

- Device: `powerW` + optional internal battery `usableCapacityWh`;
- BackupSource: `usableCapacityWh` + optional `maxOutputPowerW`;
- shared BackupSource runtime рахується за сумою активних навантажень;
- один Device має максимум одне зовнішнє джерело в Scenario;
- strategy v1: `ExternalFirst`;
- Device availability передається у незмінений `Simulation Engine v1`;
- ExternalProvider availability задається вручну;
- predefined service templates замість довільного graph editor;
- target services автоматично визначають mandatory loads;
- TV, lamp та інші необов’язкові пристрої моделюються як additional loads;
- автоматична оптимізація, dynamic load scheduling і детальна електрична модель поза scope.

### Rationale

Модель W/Wh додає практичний user-facing input без перетворення диплома на окремий електротехнічний симулятор і зберігає центральну цінність проєкту — аналіз service dependencies та причин обмеження.

### Affected

- `docs/specs/user-facing-mvp-v1.md`
- `docs/PROJECT.md`
- `docs/DOMAIN_MODEL.md`
- `docs/STATUS.md`
- майбутні `docs/TEST_SCENARIOS.md` і implementation plan
