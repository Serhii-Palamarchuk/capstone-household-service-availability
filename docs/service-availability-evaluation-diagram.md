# Діаграма алгоритмічної послідовності оцінювання доступності сервісу

Ця Mermaid-діаграма відображає фактичну послідовність обробки сценарію в поточному MVP: модуль оцінювання автономності (Availability Estimator) формує часову доступність локальних пристроїв, після чого модуль симуляції (Simulation Engine v1) поширює часові обмеження через граф функціональних залежностей.

```mermaid
flowchart TB
    A["Цільові сервіси та параметри сценарію"] --> B["Визначити обов'язкові залежності"]
    B --> C["Сформувати набір активних пристроїв Device"]

    subgraph AE["Модуль оцінювання автономності (Availability Estimator)"]
        C --> D["Згрупувати призначені Device за BackupSource"]
        D --> E["totalPowerW = сума powerW активних Device"]
        E --> F{"maxOutputPowerW задано?"}
        F -- "Так" --> G{"totalPowerW <= maxOutputPowerW?"}
        G -- "Ні" --> X["Помилка валідації: симуляцію заблоковано"]
        G -- "Так" --> H["runtimeMinutes = floor(usableCapacityWh / totalPowerW * 60)"]
        F -- "Ні" --> I["Попередження про відсутню maxOutputPowerW"]
        I --> H
        H --> J["Device availability = зовнішнє джерело + внутрішня батарея за ExternalFirst"]
        J --> K["Додати сценарну availability зовнішніх постачальників ExternalProvider"]
        K --> L["Сформувати Scenario.availability"]
    end

    subgraph SE["Модуль симуляції (Simulation Engine v1)"]
        L --> M["Перевірити посилання та відсутність циклів у досяжному DAG"]
        M --> N["Рекурсивно обчислити доступність обов'язкових залежностей Service"]
        N --> O["T = min(тривалості обов'язкових залежностей)"]
        O --> P{"Порівняти T з тривалістю відключення H"}
        P --> Q1["T >= H -> Доступний (Available)"]
        P --> Q2["0 < T < H -> Обмежений (Limited)"]
        P --> Q3["T = 0 -> Недоступний (Unavailable)"]
        Q1 --> R["Сформувати пояснюваний результат сервісу"]
        Q2 --> S["Визначити всі рівнозначні обмежувальні залежності та причинні шляхи"]
        Q3 --> S
        S --> R
    end
```

Канонічні правила розрахунку залишаються у `docs/specs/user-facing-mvp-v1.md`, `docs/SIMULATION.md` та відповідній реалізації в `apps/web/src/user-mvp/` і `apps/web/src/simulation/`.