function formatDuration(minutes) {
  const hours = minutes / 60;
  const hoursText = Number.isInteger(hours) ? String(hours) : hours.toFixed(2).replace(/0+$/, '');
  return `${minutes} min (${hoursText} h)`;
}

function errorDescription(error) {
  if (error.message) return error.message;

  const details = Object.entries(error)
    .filter(([key]) => key !== 'code')
    .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' → ') : value}`)
    .join(', ');
  return details || 'Review the scenario input.';
}

function recommendationText(recommendation, nameFor) {
  const name = nameFor(recommendation.entityId);
  if (recommendation.type === 'ADD_BACKUP') {
    return `Add backup power for ${name}.`;
  }
  if (recommendation.type === 'EXTERNAL_PROVIDER_LIMIT') {
    return `${name} is limiting availability; increasing local battery capacity does not remove this provider limit.`;
  }
  if (recommendation.type === 'DISABLE_ADDITIONAL_LOAD') {
    return `Disabling ${name} improves every selected target by at least ${formatDuration(recommendation.improvementMinutes)}.`;
  }
  return recommendation.type;
}

export function UserScenarioResult({ input, onBack, outcome }) {
  if (!outcome.success) {
    return (
      <section className="wizard-panel result-failure" role="alert">
        <p className="step-label">Step 4 of 4</p>
        <h2>Scenario could not run</h2>
        <p>Correct these errors and run the scenario again. No partial result is shown.</p>
        <ul>
          {outcome.errors.map((error, index) => (
            <li key={`${error.code}-${index}`}>
              <strong>{error.code}</strong>: {errorDescription(error)}
            </li>
          ))}
        </ul>
        <div className="step-actions">
          <button className="secondary-button" type="button" onClick={onBack}>
            Back to services &amp; scenario
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
  const namesById = new Map(allEntities.map(entity => [entity.id, entity.name]));
  const nameFor = id => namesById.get(id) ?? id;
  const warnings = outcome.estimation.warnings;
  const recommendations = outcome.recommendations;

  return (
    <section className="wizard-panel result-panel" aria-labelledby="user-result-title">
      <p className="step-label">Step 4 of 4</p>
      <h2 id="user-result-title">Availability result</h2>
      <p>The values below come from this submitted scenario and its deterministic model.</p>

      <section className="result-section" aria-labelledby="source-results-title">
        <h3 id="source-results-title">Used backup sources</h3>
        {outcome.estimation.sourceResults.length === 0 ? (
          <p className="empty-state">No external backup source was used by active devices.</p>
        ) : (
          <div className="result-grid">
            {outcome.estimation.sourceResults.map(source => (
              <article className="result-item" key={source.sourceId}>
                <h4>{nameFor(source.sourceId)}</h4>
                <dl>
                  <div><dt>Total active load</dt><dd>{source.totalPowerW} W</dd></div>
                  <div><dt>Runtime</dt><dd>{formatDuration(source.runtimeMinutes)}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="result-section" aria-labelledby="device-results-title">
        <h3 id="device-results-title">Device availability</h3>
        <div className="result-grid">
          {outcome.estimation.deviceResults.map(device => (
            <article className="result-item" key={device.deviceId}>
              <h4>{nameFor(device.deviceId)}</h4>
              <dl>
                <div><dt>Total</dt><dd>{formatDuration(device.availabilityMinutes)}</dd></div>
                <div><dt>External</dt><dd>{formatDuration(device.externalRuntimeMinutes)}</dd></div>
                <div><dt>Internal</dt><dd>{formatDuration(device.internalRuntimeMinutes)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section" aria-labelledby="target-results-title">
        <h3 id="target-results-title">Target services</h3>
        <div className="result-grid target-result-grid">
          {outcome.simulation.targetResults.map(target => (
            <article className="result-item" key={target.serviceId}>
              <div className="target-heading">
                <h4>{nameFor(target.serviceId)}</h4>
                <span className={`status-badge status-${target.status.toLowerCase()}`}>
                  {target.status}
                </span>
              </div>
              <p><strong>Availability:</strong> {formatDuration(target.availabilityDurationMinutes)}</p>
              <div className="result-detail">
                <h5>
                  {target.limitingDependencyIds.length === 1
                    ? 'Limiting dependency'
                    : 'Limiting dependencies'}
                </h5>
                {target.limitingDependencyIds.length === 0 ? (
                  <p className="empty-state">None within the outage duration.</p>
                ) : (
                  <ul>
                    {target.limitingDependencyIds.map(id => <li key={id}>{nameFor(id)}</li>)}
                  </ul>
                )}
              </div>
              <div className="result-detail">
                <h5>{target.causalPaths.length === 1 ? 'Causal path' : 'Causal paths'}</h5>
                {target.causalPaths.length === 0 ? (
                  <p className="empty-state">No limiting path for an Available service.</p>
                ) : (
                  <ul>
                    {target.causalPaths.map(path => (
                      <li key={path.join('\u0000')}>{path.map(nameFor).join(' → ')}</li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="result-section" aria-labelledby="warning-results-title">
        <h3 id="warning-results-title">Warnings</h3>
        {warnings.length === 0 ? (
          <p className="empty-state">No estimator warnings.</p>
        ) : (
          <ul>
            {warnings.map((warning, index) => (
              <li key={`${warning.code}-${warning.sourceId ?? index}`}>
                <strong>{warning.code}</strong>
                {warning.code === 'MISSING_BACKUP_SOURCE_MAX_OUTPUT'
                  ? `: Maximum output is not set for ${nameFor(warning.sourceId)}; overload was not checked.`
                  : ''}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="result-section" aria-labelledby="recommendation-results-title">
        <h3 id="recommendation-results-title">Recommendations</h3>
        {recommendations.length === 0 ? (
          <p className="empty-state">No deterministic recommendation follows from this scenario.</p>
        ) : (
          <ul>
            {recommendations.map((recommendation, index) => (
              <li key={`${recommendation.type}-${recommendation.entityId}-${index}`}>
                {recommendationText(recommendation, nameFor)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Back to services &amp; scenario
        </button>
      </div>
    </section>
  );
}
