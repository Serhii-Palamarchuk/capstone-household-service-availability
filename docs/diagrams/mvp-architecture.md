# Архітектура User-facing MVP

```mermaid
flowchart LR
    U["Користувач"]
    ST["Шаблони<br/>сервісів"]
    EP["External Provider<br/>availability"]

    subgraph SPA["React SPA — браузер"]
        direction LR
        UI["UI<br/>4 кроки"]
        V["Нормалізація<br/>та валідація"]
        AE["Availability<br/>Estimator"]
        SA["Scenario.<br/>availability"]
        SE["Simulation<br/>Engine v1"]
        R["Result<br/>статус · час · причини"]

        UI --> V
        V --> AE
        AE --> SA
        SA --> SE
        V -->|граф + сценарій| SE
        SE --> R
    end

    U --> UI
    ST --> V
    EP --> V
```

Схема показує фактичний runtime flow поточного MVP: введення даних → валідація → оцінювання часової доступності Device → Simulation Engine v1 → результат. Backend і база даних у поточному MVP відсутні.

Контракт схеми узгоджений із `docs/specs/user-facing-mvp-v1.md`, `docs/DECISIONS.md` і `docs/STATUS.md`.

Raw Mermaid source: [`mvp-architecture.mmd`](./mvp-architecture.mmd).
