# Архітектура User-facing MVP

Ця схема фіксує фактичну архітектуру поточного MVP після `User-facing MVP v1` та `UX Polish v1`.

```mermaid
flowchart TB
    U["Користувач"]
    EP["External Provider availability<br/>ручний параметр сценарію"]

    subgraph SPA["React SPA — виконується у браузері"]
        UI["4-кроковий UI<br/>Equipment → Backup → Services & Scenario → Result"]
        ST["Service templates<br/>і dependency bindings"]
        V["Нормалізація та валідація<br/>обладнання, backup, services і scenario"]
        AE["Availability Estimator<br/>powerW + usableCapacityWh → Device availability"]
        SA["Scenario.availability<br/>часова доступність Device"]
        SE["Simulation Engine v1<br/>DAG → T → status → limiting dependencies → causal paths"]
        R["Result<br/>availability / status / warnings / deterministic recommendations"]

        UI --> V
        ST --> V
        V --> AE
        AE --> SA
        SA --> SE
        V -->|service graph + outage scenario| SE
        SE --> R
    end

    U <--> UI
    EP --> V

    subgraph DEPLOY["Розгортання статичного застосунку"]
        GH["GitHub main"] --> GA["GitHub Actions"] --> GP["GitHub Pages"]
    end

    GP -. "deployed SPA" .-> UI
```

## Що показує схема

- Користувач працює з 4-кроковим React UI: `Equipment → Backup → Services & Scenario → Result`.
- `Service templates` задають дозволену структуру залежностей; довільного редактора графа в MVP немає.
- Нормалізація та валідація перевіряють користувацьку конфігурацію перед розрахунком.
- `Availability Estimator` перетворює `powerW` і доступну енергоємність у часову доступність `Device` та формує `Scenario.availability`.
- `Simulation Engine v1` отримує валідовану модель сервісів, outage scenario та `Scenario.availability`, після чого розраховує тривалість доступності сервісів, статус, обмежувальні залежності й причинні шляхи.
- `External Provider availability` залишається ручним параметром сценарію.
- Результат містить availability/status, warnings і лише детерміновані рекомендації, що прямо випливають із моделі.
- Backend і база даних у поточному MVP відсутні; застосунок збирається з `main` через GitHub Actions і розгортається на GitHub Pages.

## Source of truth

Контракт схеми узгоджений із:

- `docs/specs/user-facing-mvp-v1.md`;
- `docs/DECISIONS.md` — D-002, D-003, D-004, D-005;
- `docs/STATUS.md`.

Raw Mermaid source: [`mvp-architecture.mmd`](./mvp-architecture.mmd).
