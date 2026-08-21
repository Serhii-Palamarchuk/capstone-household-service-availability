# Архітектура User-facing MVP

Ця схема фіксує фактичний runtime flow поточного MVP після `User-facing MVP v1` та `UX Polish v1`.

```mermaid
flowchart TB
    U["Користувач"]
    ST["Шаблони сервісів<br/>і прив’язки залежностей"]
    EP["Доступність External Provider<br/>ручний параметр сценарію"]

    subgraph SPA["React SPA — виконується у браузері"]
        UI["4-кроковий UI<br/>Equipment → Backup → Services & Scenario → Result"]
        V["Нормалізація та валідація<br/>обладнання, резервного живлення,<br/>сервісів і сценарію"]
        AE["Availability Estimator<br/>powerW + usableCapacityWh → доступність Device"]
        SA["Scenario.availability<br/>часова доступність Device"]
        SE["Simulation Engine v1<br/>DAG → T → status → limiting dependencies → causal paths"]
        R["Представлення результату — крок 4 UI<br/>availability / status / warnings /<br/>детерміновані рекомендації"]

        UI --> V
        V --> AE
        AE --> SA
        SA --> SE
        V -->|граф сервісів + сценарій відключення| SE
        SE --> R
    end

    U --> UI
    ST --> V
    EP --> V
```

## Що показує схема

- Користувач вводить дані через 4-кроковий React UI: `Equipment → Backup → Services & Scenario → Result`.
- Шаблони сервісів задають дозволену структуру залежностей; довільного редактора графа в MVP немає.
- Нормалізація та валідація перевіряють користувацьку конфігурацію перед розрахунком.
- `Availability Estimator` перетворює `powerW` і доступну енергоємність у часову доступність `Device` та формує `Scenario.availability`.
- `Simulation Engine v1` отримує валідовану модель сервісів, сценарій відключення та `Scenario.availability`, після чого розраховує тривалість доступності сервісів, статус, обмежувальні залежності й причинні шляхи.
- Доступність `External Provider` залишається ручним параметром сценарію.
- Представлення результату є частиною четвертого кроку UI й показує availability/status, warnings та лише детерміновані рекомендації, що прямо випливають із моделі.
- Backend і база даних у поточному MVP відсутні. Deployment окремо зафіксований у D-002: `main → GitHub Actions → GitHub Pages`.

## Source of truth

Контракт схеми узгоджений із:

- `docs/specs/user-facing-mvp-v1.md`;
- `docs/DECISIONS.md` — D-002, D-003, D-004, D-005;
- `docs/STATUS.md`.

Raw Mermaid source: [`mvp-architecture.mmd`](./mvp-architecture.mmd).
