import { useState } from 'react';

import {
  translateRecommendation,
  translateStatus,
  translateValidationError,
  translateWarning,
} from '../../user-mvp/i18n.js';

function formatDuration(minutes) {
  const hours = minutes / 60;
  const hoursText = Number.isInteger(hours) ? String(hours) : hours.toFixed(2).replace(/0+$/, '');
  return `${minutes} min (${hoursText} h)`;
}

function ResultErrors({ errors, id, t }) {
  if (errors.length === 0) return null;

  return (
    <ul className="quick-edit-errors" id={id} role="alert">
      {errors.map((error, index) => (
        <li key={`${error.code}-${error.field ?? error.sourceId ?? 'global'}-${index}`}>
          {translateValidationError(error, t)}
        </li>
      ))}
    </ul>
  );
}

function SourceQuickEdit({ editor, nameFor, onCancel, onRecalculate, setEditor, t }) {
  const sourceLabel = nameFor(editor.sourceId);
  const capacityInvalid = editor.errors.some(error => (
    error.field?.endsWith('.usableCapacityWh')
    || error.code === 'INVALID_BACKUP_SOURCE_CAPACITY'
  ));
  const maximumOutputInvalid = editor.errors.some(error => (
    error.field?.endsWith('.maxOutputPowerW')
    || error.code === 'INVALID_BACKUP_SOURCE_MAX_OUTPUT'
    || error.code === 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED'
  ));

  function change(field, value) {
    setEditor(current => ({ ...current, [field]: value, errors: [] }));
  }

  function submit(event) {
    event.preventDefault();
    onRecalculate({
      sourceId: editor.sourceId,
      usableCapacityWh: editor.usableCapacityWh,
      maxOutputPowerW: editor.maxOutputPowerW,
    });
  }

  return (
    <div
      aria-labelledby="source-quick-edit-title"
      aria-modal="true"
      className="quick-edit-dialog"
      role="dialog"
    >
      <p className="step-label">{t('result.quickEdit', { fallback: 'Quick edit' })}</p>
      <h3 id="source-quick-edit-title">
        {t('result.editBackupSource', {
          fallback: 'Edit backup source: {source}',
          source: sourceLabel,
        })}
      </h3>
      <form noValidate onSubmit={submit}>
        <div className="quick-edit-fields">
          <label htmlFor="quick-edit-source-capacity">
            {t('field.usableCapacity')}
            <input
              aria-describedby={editor.errors.length > 0 ? 'source-quick-edit-errors' : undefined}
              aria-invalid={capacityInvalid || undefined}
              id="quick-edit-source-capacity"
              inputMode="decimal"
              min="0"
              step="any"
              type="number"
              value={editor.usableCapacityWh}
              onChange={event => change('usableCapacityWh', event.target.value)}
            />
          </label>
          <label htmlFor="quick-edit-source-max-output">
            {t('field.maximumOutput')} <span className="optional-label">{t('field.optional')}</span>
            <input
              aria-describedby={editor.errors.length > 0 ? 'source-quick-edit-errors' : undefined}
              aria-invalid={maximumOutputInvalid || undefined}
              id="quick-edit-source-max-output"
              inputMode="decimal"
              min="0"
              step="any"
              type="number"
              value={editor.maxOutputPowerW}
              onChange={event => change('maxOutputPowerW', event.target.value)}
            />
          </label>
        </div>
        <ResultErrors errors={editor.errors} id="source-quick-edit-errors" t={t} />
        <div className="quick-edit-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            {t('actions.cancel', { fallback: 'Cancel' })}
          </button>
          <button className="primary-button" type="submit">
            {t('actions.recalculate')}
          </button>
        </div>
      </form>
    </div>
  );
}

function OutageQuickEdit({ editor, onCancel, onRecalculate, setEditor, t }) {
  const outageInvalid = editor.errors.length > 0;

  function submit(event) {
    event.preventDefault();
    onRecalculate({ outageDurationMinutes: editor.outageDurationMinutes });
  }

  return (
    <div
      aria-labelledby="outage-quick-edit-title"
      aria-modal="true"
      className="quick-edit-dialog"
      role="dialog"
    >
      <p className="step-label">{t('result.quickEdit', { fallback: 'Quick edit' })}</p>
      <h3 id="outage-quick-edit-title">
        {t('result.editOutage', { fallback: 'Edit outage duration' })}
      </h3>
      <form noValidate onSubmit={submit}>
        <div className="quick-edit-fields quick-edit-fields-single">
          <label htmlFor="quick-edit-outage-duration">
            {t('field.outageDuration')}
            <input
              aria-describedby={outageInvalid ? 'outage-quick-edit-errors' : undefined}
              aria-invalid={outageInvalid || undefined}
              id="quick-edit-outage-duration"
              inputMode="numeric"
              min="1"
              step="1"
              type="number"
              value={editor.outageDurationMinutes}
              onChange={event => setEditor(current => ({
                ...current,
                outageDurationMinutes: event.target.value,
                errors: [],
              }))}
            />
          </label>
        </div>
        <ResultErrors errors={editor.errors} id="outage-quick-edit-errors" t={t} />
        <div className="quick-edit-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            {t('actions.cancel', { fallback: 'Cancel' })}
          </button>
          <button className="primary-button" type="submit">
            {t('actions.recalculate')}
          </button>
        </div>
      </form>
    </div>
  );
}

export function UserScenarioResult({
  backupSourceLabels,
  deviceLabels,
  input,
  onBack,
  onQuickRecalculate,
  outcome,
  providerLabels,
  serviceLabels,
  t,
}) {
  const [editor, setEditor] = useState(null);

  if (!outcome.success) {
    return (
      <section className="wizard-panel result-failure" role="alert">
        <p className="step-label">{t('step.numberOfTotal', { number: 4, total: 4 })}</p>
        <h2>{t('result.failureTitle')}</h2>
        <p>{t('result.failureDescription')}</p>
        <ul>
          {outcome.errors.map((error, index) => (
            <li key={`${error.code}-${index}`}>
              <strong>{error.code}</strong>: {translateValidationError(error, t)}
            </li>
          ))}
        </ul>
        <div className="step-actions">
          <button className="secondary-button" type="button" onClick={onBack}>
            {t('actions.backToServicesScenario')}
          </button>
        </div>
      </section>
    );
  }

  const allEntities = [
    ...input.model.services,
    ...input.model.devices,
    ...input.model.externalProviders,
    ...input.backupSources,
  ];
  const submittedNamesById = new Map(allEntities.map(entity => [entity.id, entity.name]));
  const labelMaps = [serviceLabels, deviceLabels, providerLabels, backupSourceLabels];
  const nameFor = id => (
    labelMaps.find(labels => labels?.has(id))?.get(id)
    ?? submittedNamesById.get(id)
    ?? id
  );
  const warnings = outcome.estimation.warnings;
  const recommendations = outcome.recommendations;
  const outageDuration = formatDuration(input.scenario.outageDurationMinutes);

  function openSourceEditor(sourceId) {
    const source = input.backupSources.find(item => item.id === sourceId);
    setEditor({
      type: 'source',
      sourceId,
      usableCapacityWh: String(source.usableCapacityWh),
      maxOutputPowerW: source.maxOutputPowerW === undefined
        ? ''
        : String(source.maxOutputPowerW),
      errors: [],
    });
  }

  function openOutageEditor() {
    setEditor({
      type: 'outage',
      outageDurationMinutes: String(input.scenario.outageDurationMinutes),
      errors: [],
    });
  }

  function recalculate(patch) {
    const result = onQuickRecalculate(patch);
    if (result.success) {
      setEditor(null);
      return;
    }
    setEditor(current => ({ ...current, errors: result.errors }));
  }

  return (
    <section className="wizard-panel result-panel" aria-labelledby="user-result-title">
      <p className="step-label">{t('step.numberOfTotal', { number: 4, total: 4 })}</p>
      <h2 id="user-result-title">{t('result.heading')}</h2>
      <p>{t('helper.result')}</p>

      <section className="result-section result-primary" aria-labelledby="target-results-title">
        <div className="result-section-heading">
          <div>
            <h3 id="target-results-title">{t('label.targetServices')}</h3>
            <p>
              {t('result.outageSummary', {
                fallback: 'Outage: {outage}',
                outage: outageDuration,
              })}
            </p>
          </div>
          <button className="text-button" type="button" onClick={openOutageEditor}>
            {t('actions.editOutage', { fallback: 'Edit outage' })}
          </button>
        </div>
        <div className="target-result-list">
          {outcome.simulation.targetResults.map(target => (
            <article className="target-result-row" key={target.serviceId}>
              <div className="target-result-summary">
                <h4>{nameFor(target.serviceId)}</h4>
                <span className={`status-badge status-${target.status.toLowerCase()}`}>
                  {translateStatus(target.status, t)}
                </span>
                <p>
                  <strong>{formatDuration(target.availabilityDurationMinutes)}</strong>{' '}
                  {t('result.availableOfOutage', {
                    fallback: 'available of {outage} outage',
                    outage: outageDuration,
                  })}
                </p>
              </div>
              <div className="target-causes">
                <div>
                  <h5>
                    {target.limitingDependencyIds.length === 1
                      ? t('label.limitingDependency')
                      : t('label.limitingDependencies')}
                  </h5>
                  {target.limitingDependencyIds.length === 0 ? (
                    <p className="empty-state">{t('empty.noneWithinOutage')}</p>
                  ) : (
                    <p>{target.limitingDependencyIds.map(nameFor).join(', ')}</p>
                  )}
                </div>
                <div>
                  <h5>
                    {target.causalPaths.length === 1
                      ? t('label.causalPath')
                      : t('label.causalPaths')}
                  </h5>
                  {target.causalPaths.length === 0 ? (
                    <p className="empty-state">{t('empty.noLimitingPath')}</p>
                  ) : (
                    <ul className="causal-paths">
                      {target.causalPaths.map(path => (
                        <li key={path.join('\u0000')}>{path.map(nameFor).join(' → ')}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
        {editor?.type === 'outage' && (
          <OutageQuickEdit
            editor={editor}
            onCancel={() => setEditor(null)}
            onRecalculate={recalculate}
            setEditor={setEditor}
            t={t}
          />
        )}
      </section>

      <section className="result-section" aria-labelledby="source-results-title">
        <h3 id="source-results-title">{t('label.usedBackupSources')}</h3>
        {outcome.estimation.sourceResults.length === 0 ? (
          <p className="empty-state">{t('empty.noBackupSourceUsed')}</p>
        ) : (
          <div className="compact-result-list">
            {outcome.estimation.sourceResults.map(source => (
              <article className="compact-result-row" key={source.sourceId}>
                <strong>{nameFor(source.sourceId)}</strong>
                <span>{t('label.totalActiveLoad')}: {source.totalPowerW} W</span>
                <span>{t('label.runtime')}: {formatDuration(source.runtimeMinutes)}</span>
                <button
                  aria-label={`${t('actions.edit', { fallback: 'Edit' })}: ${nameFor(source.sourceId)}`}
                  className="text-button"
                  type="button"
                  onClick={() => openSourceEditor(source.sourceId)}
                >
                  {t('actions.edit', { fallback: 'Edit' })}
                </button>
              </article>
            ))}
          </div>
        )}
        {editor?.type === 'source' && (
          <SourceQuickEdit
            editor={editor}
            nameFor={nameFor}
            onCancel={() => setEditor(null)}
            onRecalculate={recalculate}
            setEditor={setEditor}
            t={t}
          />
        )}
      </section>

      <section className="result-section" aria-labelledby="device-results-title">
        <h3 id="device-results-title">{t('label.deviceAvailability')}</h3>
        <div className="compact-result-list device-result-list">
          {outcome.estimation.deviceResults.map(device => (
            <article className="compact-result-row device-result-row" key={device.deviceId}>
              <strong>{nameFor(device.deviceId)}</strong>
              <span>{t('label.total')}: {formatDuration(device.availabilityMinutes)}</span>
              <span>
                {t('label.external')}: {formatDuration(device.externalRuntimeMinutes)} ·{' '}
                {t('label.internal')}: {formatDuration(device.internalRuntimeMinutes)}
              </span>
            </article>
          ))}
        </div>
      </section>

      {warnings.length > 0 && (
        <section className="result-section result-messages" aria-labelledby="warning-results-title">
          <h3 id="warning-results-title">{t('label.warnings')}</h3>
          <ul>
            {warnings.map((warning, index) => (
              <li key={`${warning.code}-${warning.sourceId ?? index}`}>
                {translateWarning(warning, t, nameFor)}
              </li>
            ))}
          </ul>
        </section>
      )}

      {recommendations.length > 0 && (
        <section
          className="result-section result-messages"
          aria-labelledby="recommendation-results-title"
        >
          <h3 id="recommendation-results-title">{t('label.recommendations')}</h3>
          <ul>
            {recommendations.map((recommendation, index) => (
              <li key={`${recommendation.type}-${recommendation.entityId}-${index}`}>
                {translateRecommendation(recommendation, t, nameFor)}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          {t('actions.backToServicesScenario')}
        </button>
      </div>
    </section>
  );
}
