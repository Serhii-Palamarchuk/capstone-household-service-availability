# UX Polish v1 — acceptance criteria

Status: **Draft for final user review**  
Date: 2026-08-20

This document verifies `docs/specs/ux-polish-v1.md`. It adds UX acceptance only; accepted User-facing MVP v1 calculation semantics remain unchanged.

## UX-01 — Desktop density baseline

**Given** a CSS viewport of `1920 × 1080`  
**And** a valid configuration containing 5 Devices, 2 BackupSources, 3 ServiceInstances and 2 ExternalProviders  
**When** the user opens each wizard step in its default/collapsed state  
**Then** the page has no vertical page scroll on Step 1, Step 2, Step 3 or Step 4.

Expanded `Details`, dialogs/modals, dropdown menus, long validation lists and unusually long custom names are excluded from the no-scroll requirement.

For Result density verification, the controlled fixture should exercise multiple target summaries, preferably all three valid ServiceInstances, so the criterion is not satisfied only by a single-result happy path.

## UX-02 — Equipment compact rows

**Given** multiple Devices  
**When** Step 1 is displayed  
**Then** each Device is represented primarily as one compact row rather than a large standalone card  
**And** category, power and battery summary are readable without opening details  
**And** optional custom `Name` is not presented as the primary required field.

## UX-03 — Optional Device name

**Given** a Device with valid category and power but empty custom `Name`  
**When** the form is normalized and the scenario is valid  
**Then** empty custom `Name` does not produce a required-name validation error  
**And** the resulting domain entity still receives a deterministic non-empty internal name/fallback.

## UX-04 — Device technical label

**Given** a Router with `powerW = 15` and no custom name  
**Then** its user-visible label is equivalent to:

```text
Router · 15 W
```

**Given** the same Device with custom name `Bedroom router`  
**Then** its label is equivalent to:

```text
Bedroom router (Router · 15 W)
```

## UX-05 — Duplicate label suppression and disambiguation

**Given** a custom Device name equal to its category or generated technical label after trim/case normalization  
**Then** the UI does not render duplicated text such as `Router (Router · 15 W)` when the custom value adds no information.

**Given** two unnamed Devices that otherwise resolve to the same visible label  
**Then** the UI adds a compact deterministic disambiguator such as `#1` / `#2`.

## UX-06 — BackupSource compact rows and optional name

**Given** a BackupSource with type `Power station`, `usableCapacityWh = 1000`, `maxOutputPowerW = 1200`, and no custom name  
**Then** its technical label is equivalent to:

```text
Power station · 1000 Wh · 1200 W max
```

**And** empty custom `Name` does not block normalization/simulation  
**And** a deterministic non-empty domain fallback is still available.

**Given** custom name `EcoFlow`  
**Then** its user-visible label is equivalent to:

```text
EcoFlow (Power station · 1000 Wh · 1200 W max)
```

## UX-07 — Single-source assignment simplification

**Given** exactly one BackupSource  
**When** Step 2 is displayed  
**Then** each Device uses a simple external-backup on/off control  
**And** no redundant source dropdown is required  
**And** turning backup on assigns the single source  
**And** turning backup off removes the external assignment without removing an internal battery.

## UX-08 — Multi-source assignment

**Given** two or more BackupSources  
**When** external backup is enabled for a Device  
**Then** a compact source selector is available  
**And** the Device can still have at most one external source in the scenario.

**When** external backup is disabled  
**Then** no external assignment is included for that Device.

## UX-09 — Existing backup validation semantics preserved

**Given** a used BackupSource without `maxOutputPowerW`  
**When** the scenario runs  
**Then** calculation is allowed and the existing missing-max-output warning is still produced.

**Given** a known max output lower than active assigned load  
**Then** the existing overload validation error still prevents simulation.

## UX-10 — Service compact rows

**Given** multiple ServiceInstances  
**When** Step 3 is displayed in collapsed state  
**Then** each service is primarily represented by one compact row  
**And** the row shows template/variant identity, dependency summary, target state and a `Details` action  
**And** required role editors are not all expanded by default.

## UX-11 — Optional Service name

**Given** a valid ServiceInstance template/variant/bindings and empty custom `Name`  
**When** the form is normalized  
**Then** empty custom `Name` does not produce a required-name validation error  
**And** the ServiceInstance still receives a deterministic non-empty internal fallback.

Example default labels include:

```text
Internet · Fiber
Remote Work
```

## UX-12 — ExternalProvider naming remains explicit

**Given** an ExternalProvider  
**Then** provider name remains an explicit required user-facing field  
**Because** the current model has no independent provider category/type that can safely generate an equivalent label.

## UX-13 — Target selection integrated with service row

**Given** a ServiceInstance on Step 3  
**When** the user changes its target state  
**Then** `scenario.targetServiceIds` reflects the change  
**And** the underlying target/mandatory-load semantics remain unchanged.

## UX-14 — Progressive details

**Given** a collapsed Device, BackupSource or Service row  
**When** the user activates `Details`  
**Then** secondary/editing fields become available  
**And** the control exposes expanded/collapsed state accessibly  
**And** collapsing the row does not discard entered values.

## UX-15 — Validation inside collapsed details remains discoverable

**Given** an invalid field that is currently inside collapsed `Details`  
**When** validation runs  
**Then** the user can identify which entity/field is invalid  
**And** the affected details area is exposed or clearly marked  
**And** the error is not silently hidden by the compact layout.

## UX-16 — Result information hierarchy

**Given** a successful scenario  
**When** Step 4 is shown  
**Then** target service status, availability versus outage duration, and limiting dependency/dependencies appear before subsystem detail  
**And** causal paths remain readable  
**And** BackupSource and Device results use compact summaries rather than one large card per item.

## UX-17 — Empty warnings/recommendations do not create large blank sections

**Given** zero warnings or zero recommendations  
**Then** the corresponding empty state does not reserve a large card/block of vertical space.

**Given** warnings or recommendations exist  
**Then** their existing semantics and text meaning remain available in a compact readable presentation.

## UX-18 — Quick edit BackupSource

**Given** a successful Result with at least one used BackupSource  
**When** the user chooses `Edit` for a specific source  
**Then** the user can change only:

- `usableCapacityWh`;
- `maxOutputPowerW`.

**And** source type, assignments, Devices and service structure are not edited in this quick editor.

**When** the user confirms `Recalculate`  
**Then** the standard normalization → estimator → simulation pipeline runs again.

## UX-19 — Quick edit outage duration

**Given** a successful Result  
**When** the user changes outage duration through quick edit and selects `Recalculate`  
**Then** the scenario is recalculated through the standard pipeline  
**And** the new Result uses the changed outage duration  
**And** no full page reload is required.

## UX-20 — Quick-edit validation

**Given** an invalid quick-edit capacity, max output or outage duration  
**When** the user attempts recalculation  
**Then** the same validation rules as the wizard are applied  
**And** no synthetic or partial Result is shown as current.

## UX-21 — Interactive backward stepper

**Given** the user is on Step 3  
**Then** Step 1 and Step 2 in the stepper are interactive.

**Given** the user is on Step 4  
**Then** Step 1, Step 2 and Step 3 are interactive.

**When** the user clicks an earlier completed step  
**Then** the wizard navigates there without discarding form data.

## UX-22 — Back button retained

**Given** Step 2, Step 3 or Step 4  
**Then** a compact secondary `Back` action remains available in addition to stepper navigation.

## UX-23 — Stepper keyboard accessibility

**Given** keyboard-only navigation  
**Then** interactive completed stepper items are focusable and activatable without a pointing device.

## UX-24 — Stale Result protection

**Given** a successful Result exists  
**When** the user returns to an earlier step and changes upstream scenario/configuration data  
**Then** the prior Result is marked stale/not-current  
**And** it must not be presented as a current calculated result  
**And** a fresh `Run scenario` or `Recalculate` is required.

**Given** the user navigates backward and makes no changes  
**Then** previously valid entered data is preserved.

## UX-25 — UA/EN switch preserves state

**Given** the user has entered Devices, BackupSources, assignments, services and scenario data  
**When** the user switches between English and Ukrainian  
**Then** current form values, assignments, current step and current valid Result are preserved  
**And** no page reload/reset is required.

## UX-26 — Translation coverage

**When** UA is selected  
**Then** visible application labels, helper text, action buttons, validation messages, warnings, recommendations and statuses have Ukrainian UI text.

**When** EN is selected  
**Then** the equivalent content is presented in English.

Technical identifiers used only for debugging/internal diagnostics do not need to replace the user-facing message.

## UX-27 — Language implementation scope

**Then** UX Polish v1 does not add a new third-party i18n dependency without separate user approval  
**And** English remains the initial/default language for v1  
**And** locale autodetection and cross-session language persistence are not required.

## UX-28 — Simulation regression protection

Using existing accepted controlled fixtures, including AC-12:

**When** only UX presentation/navigation changes are introduced  
**Then** estimator and Simulation Engine numerical outputs remain unchanged for identical normalized inputs.

For the accepted AC-12 fixture this includes the previously established controlled expectations such as Home backup `80 W / 360 min` and Remote Work `Limited / 360 min`; these are test-fixture values, not real autonomy measurements.

## UX-29 — No domain-scope expansion

A UX Polish v1 implementation is not accepted if it requires changing:

- Availability Estimator formulas;
- Simulation Engine status/dependency logic;
- service-template role semantics;
- recommendation rules;
- accepted domain scope.

Any such requirement must be treated as a separate design decision rather than silently bundled into UX polish.

## UX-30 — Browser verification evidence

Before merge/deploy, record factual verification using the existing project workflow:

- full existing test suite result;
- production build result;
- focused UX tests added for this iteration;
- manual `1920 × 1080` density walkthrough for all four steps;
- navigation + stale-result walkthrough;
- quick-edit rerun walkthrough;
- UA/EN state-preservation walkthrough;
- browser console observations if checked.

Do not report a pass, performance figure or usability result unless it was actually observed/tested.
