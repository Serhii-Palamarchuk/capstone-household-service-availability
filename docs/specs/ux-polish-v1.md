# UX Polish v1 — design specification

Status: **Accepted — 2026-08-20**  
Date: 2026-08-20

## 1. Purpose

Improve the usability and visual density of the deployed User-facing MVP v1 without changing its simulation semantics or expanding the MVP domain scope.

The iteration addresses a concrete usability problem observed during the live walkthrough: current card-heavy forms and result sections consume excessive vertical space, repeat labels, and force unnecessary scrolling for a household user.

Primary design goal:

> Keep the existing four-step mental model, but make the default desktop experience compact, readable, and fast to revise.

## 2. Scope boundary

UX Polish v1 changes presentation, navigation, user-facing naming, and quick-edit workflow.

It does **not** change:

- `Simulation Engine v1`;
- Availability Estimator formulas;
- service-template semantics or role rules;
- status semantics;
- recommendation logic;
- ExternalProvider modelling;
- the accepted W/Wh simplifications in `user-facing-mvp-v1.md`.

No backend, database, cloud service, optimizer, dynamic load model, or new domain entity is introduced.

## 3. Design alternatives considered

### A. Fully tabular UI

Use dense tables for Equipment, Backup, Services, and Result.

Advantages:
- maximum density;
- easy comparison across rows.

Disadvantages:
- risks making the household-oriented product look like an administrative data editor;
- service dependencies and result explanations become harder to scan.

### B. Compact rows + progressive details — selected

Use one-row summaries for the common case and reveal secondary fields/details only when requested.

Advantages:
- high information density without losing the four-step flow;
- preserves readable service/dependency explanations;
- keeps optional fields visually secondary;
- supports the target no-scroll desktop baseline.

Disadvantages:
- requires explicit summary-label rules and collapsed/expanded states.

### C. Single-page dashboard/configurator

Place equipment, backup, services, scenario and results on one screen.

Advantages:
- fewer page transitions.

Disadvantages:
- substantially higher cognitive load for a first-time household user;
- larger structural change than required for the current MVP.

### Decision

Use **B: compact rows + progressive details** while preserving the existing four-step wizard.

## 4. Desktop acceptance baseline

The primary UX acceptance viewport is a **CSS viewport of 1920 × 1080**.

Baseline configuration for density testing:

- 5 Devices;
- 2 BackupSources;
- 3 ServiceInstances;
- 2 ExternalProviders.

For Step 4 density verification, the controlled valid fixture selects all 3 ServiceInstances as target services.

In the default/collapsed state, each of the four steps must fit within this viewport **without vertical page scrolling**.

The no-scroll requirement applies to the normal collapsed state. Expanded `Details`, dropdown menus, dialogs/modals, validation states with multiple messages, or unusually long user-entered names may use local or page scrolling when necessary.

Smaller viewports remain functional and readable, but UX Polish v1 does not require zero vertical scrolling below the acceptance viewport.

## 5. Shared entity-label rules

### 5.1 User-visible custom names

Custom `Name` is optional and visually secondary for:

- Device;
- BackupSource;
- ServiceInstance.

The internal/domain `name` remains non-empty. When the user does not provide a custom name, normalization generates a deterministic non-empty fallback from the entity's technical attributes.

`id` remains internal and is never entered by the user.

### 5.2 Device label

Default technical label:

```text
<Category> · <powerW> W
```

Examples:

```text
Router · 15 W
Laptop/Desktop · 60 W
```

With a meaningful custom name:

```text
Bedroom router (Router · 15 W)
```

If the custom name duplicates the category or generated default label after trimming/case normalization, the duplicate text is suppressed.

If two unnamed Devices would otherwise have the same visible label, the UI adds a compact ordinal only for disambiguation, e.g. `Router · 15 W #1`, `Router · 15 W #2`.

### 5.3 BackupSource label

Default technical label:

```text
<Type> · <usableCapacityWh> Wh
```

If maximum output is provided:

```text
<Type> · <usableCapacityWh> Wh · <maxOutputPowerW> W max
```

Example with custom name:

```text
EcoFlow (Power station · 1000 Wh · 1200 W max)
```

A duplicate custom name is suppressed by the same rule as for Device.

### 5.4 Service label

Default technical label uses template and optional variant:

```text
Internet · Fiber
Remote Work
```

With a meaningful custom name:

```text
Home internet (Internet · Fiber)
```

### 5.5 ExternalProvider

ExternalProvider keeps an explicit user-visible name because the current model has no separate provider type/category that can safely replace it.

## 6. Step 1 — Equipment

Replace large Device cards with compact one-row entries.

The collapsed row prioritizes:

- generated/display label;
- category;
- power;
- internal-battery summary;
- `Details`;
- remove action.

`Name` is not shown as the first or primary field. It is edited inside `Details` and clearly marked optional.

Internal battery capacity remains part of the accepted Device model. The row may show a compact summary such as `120 Wh battery` or `No battery`.

`Add device` remains visible near the section heading.

## 7. Step 2 — Backup

### 7.1 BackupSource rows

Replace large BackupSource cards with compact rows.

Primary information:

- technical/display label;
- type;
- usable capacity;
- maximum-output summary when present;
- `Details`;
- remove action.

Custom `Name` is optional and edited in `Details`.

`maxOutputPowerW` remains optional. Existing validation/warning semantics remain unchanged.

### 7.2 Device assignments

The assignment interaction adapts to the number of configured external sources:

- **0 sources:** no source selector is shown; Devices simply have no external assignment;
- **1 source:** each Device gets a simple external-backup on/off control; turning it on assigns the only source;
- **2+ sources:** each Device keeps the on/off control; when on, a compact source selector is shown.

Turning external backup off does not disable an existing internal battery. A Device may still be internal-battery-only, exactly as in the accepted estimator contract.

Assignment rows use the shared Device display label and avoid repeated `Name`/category text.

## 8. Step 3 — Services & Scenario

### 8.1 Service rows

Each ServiceInstance is represented by one compact collapsed row.

The collapsed row shows:

- service technical/display label;
- short dependency summary;
- target toggle/state;
- `Details`;
- remove action.

Example:

```text
Internet · Fiber — Router, ONT/ONU, Internet provider   Target ○   Details
Remote Work — Internet, Laptop                         Target ●   Details
```

Custom Service `Name` is optional and edited in `Details`.

Template, variant and dependency-role editing are available through `Details`. The accepted role cardinality/category restrictions remain unchanged.

Target selection is presented with the Service row so the user can see the service and its scenario importance together. The underlying `targetServiceIds` model is unchanged.

### 8.2 External providers

External providers use compact rows:

```text
Internet provider · 600 min
```

Provider name remains required. Availability remains scenario input in integer minutes as in User-facing MVP v1.

### 8.3 Outage scenario

Outage duration remains a visible primary scenario field.

Additional loads remain separate from mandatory service dependencies and use compact controls. Existing semantics are unchanged.

## 9. Step 4 — Result dashboard

Result is reordered by decision value rather than by internal subsystem.

### 9.1 Primary target result

The top area answers first:

- which target service;
- status;
- available duration versus outage duration;
- limiting dependency/dependencies.

Example:

```text
REMOTE WORK    LIMITED
6 h available / 8 h outage
Limiting: Router, ONT/ONU
```

### 9.2 Causal explanation

Causal paths remain visible but compact, for example:

```text
Remote Work → Internet → Router
Remote Work → Internet → ONT/ONU
```

Large nested result cards are not required for each path.

### 9.3 Backup summary

Each used BackupSource shows a compact summary:

- display label;
- active load;
- runtime;
- `Edit` action.

### 9.4 Device availability

Device results use a compact row/table-like presentation instead of separate large cards.

Primary value is total availability. External/internal breakdown may be shown inline when compact or behind `Details`.

### 9.5 Warnings and recommendations

Empty warnings/recommendations must not consume large dedicated blocks.

If present, they are rendered as compact, readable messages. Existing warning/recommendation semantics are unchanged.

## 10. Quick edit from Result

The user must be able to compare a revised backup/outage scenario without navigating two steps backward for common adjustments.

Supported quick edits:

### BackupSource

From a specific source summary:

- `usableCapacityWh`;
- `maxOutputPowerW`.

The quick editor does **not** change:

- source type;
- source assignments;
- Device configuration;
- service structure.

### Outage

Quick edit supports:

- outage duration.

### Recalculation

Quick edits are applied through an explicit `Recalculate` action. The same normalization, estimator, validation, engine, warning and recommendation pipeline is used; no alternate calculation path is introduced.

## 11. Wizard navigation

The four-step wizard remains:

```text
1 Equipment → 2 Backup → 3 Services & Scenario → 4 Result
```

The top stepper becomes interactive for direct backward navigation:

- from Step 2, Step 1 is clickable;
- from Step 3, Steps 1 and 2 are clickable;
- from Step 4, Steps 1, 2 and 3 are clickable;
- navigating backward never discards current form data;
- stepper controls are keyboard accessible.

Forward navigation remains explicit through the existing context actions such as `Continue` and `Run scenario`; UX Polish v1 does not require clickable forward jumps in the stepper.

A compact `Back` button remains as a secondary action because it is a familiar and explicit navigation affordance. The stepper is a faster alternative, not the only way back.

When the user changes upstream data after a result has been calculated, the previous Result is marked stale and must not be presented as current. A fresh `Run scenario`/`Recalculate` is required before Result becomes current again.

Primary bottom actions remain context-specific, e.g. `Continue`, `Run scenario`, `Recalculate`.

## 12. Language switch — UA / EN

UA/EN is included in UX Polish v1 as a second priority after the compact redesign.

Requirements:

- visible compact language switch in the application header;
- switching language does not reset form data, current step, assignments or current valid result;
- labels, helper text, validation errors, warnings, recommendation text, statuses and action buttons are translated consistently;
- underlying status values, error codes and recommendation identifiers remain unchanged;
- no automatic locale detection is required for v1;
- preserve English as the initial/default language unless changed by the user;
- no persistence across browser sessions is required for v1.

No new third-party i18n dependency is introduced without separate user approval. The minimal implementation may use local translation dictionaries and React state/context only.

## 13. Validation and error handling

All existing validation behavior remains authoritative.

UX changes must ensure:

- validation errors remain associated with the relevant entity/field even when the field is inside `Details`;
- when an error concerns a collapsed detail, the UI makes the error discoverable and can expose/highlight the affected detail area;
- quick edit uses the same validation rules as the corresponding wizard inputs;
- no synthetic/partial Result is shown after a validation error, preserving the current accepted behavior.

## 14. Accessibility and interaction requirements

At minimum:

- interactive stepper items are keyboard reachable;
- `Details` controls expose expanded/collapsed state;
- form labels remain programmatically associated with inputs;
- status is not communicated only by visual styling;
- dialogs/modals, if used for quick edit, support keyboard operation and a clear cancel/close path.

This iteration does not claim formal WCAG conformance unless separately tested.

## 15. Testing strategy

Use the existing project test setup and browser verification workflow; do not add a new testing framework solely for this iteration without separate approval.

Required coverage categories:

- label-generation and duplicate-suppression unit tests;
- optional custom-name normalization tests;
- one-source and multi-source assignment behavior tests;
- navigation/stale-result state tests;
- quick-edit integration tests through the existing normalization → estimator → engine pipeline;
- language-switch state-preservation tests;
- regression tests proving accepted estimator/engine outputs remain unchanged;
- manual browser acceptance at 1920 × 1080 for the density baseline.

Numerical results must continue to come from actual test executions or controlled test fixtures, not invented measurements.

## 16. Success criterion

UX Polish v1 succeeds when a household user can configure, inspect, revise and rerun the accepted User-facing MVP flow with substantially less visual clutter and unnecessary navigation, while the accepted simulation semantics remain unchanged.

The measurable desktop criterion is: with 5 Devices, 2 BackupSources, 3 ServiceInstances and 2 ExternalProviders, each default/collapsed wizard step fits within a 1920 × 1080 viewport without vertical page scrolling; the Step 4 density fixture uses all 3 ServiceInstances as targets.
