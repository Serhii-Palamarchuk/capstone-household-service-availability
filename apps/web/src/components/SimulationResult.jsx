import { createResultView } from '../demo/result-view.js';

export function SimulationResult({ outcome }) {
  const view = createResultView(outcome);

  if (view.kind === 'failure') {
    return (
      <section role="alert" className="result-card result-failure">
        <h2>Simulation could not run</h2>
        <ul>
          {view.errors.map(({ code, message }, index) => (
            <li key={`${code}-${index}`}>
              <strong>{code}</strong>: {message}
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const hasCauses = view.limitingDependencyNames.length > 0;
  const hasPaths = view.causalPathTexts.length > 0;

  return (
    <section className="result-card" aria-labelledby="simulation-result-title">
      <h2 id="simulation-result-title">Simulation result</h2>
      <dl className="result-summary">
        <div>
          <dt>Service</dt>
          <dd>{view.serviceName}</dd>
        </div>
        <div>
          <dt>Availability</dt>
          <dd>{view.availabilityText}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`status-badge status-${view.status.toLowerCase()}`}>
              {view.status}
            </span>
          </dd>
        </div>
      </dl>
      {hasCauses && (
        <div className="result-detail">
          <h3>
            {view.limitingDependencyNames.length === 1
              ? 'Limiting dependency'
              : 'Limiting dependencies'}
          </h3>
          <ul>
            {view.limitingDependencyNames.map(name => <li key={name}>{name}</li>)}
          </ul>
        </div>
      )}
      {hasPaths && (
        <div className="result-detail">
          <h3>{view.causalPathTexts.length === 1 ? 'Causal path' : 'Causal paths'}</h3>
          <ul>
            {view.causalPathTexts.map(path => <li key={path}>{path}</li>)}
          </ul>
        </div>
      )}
      {view.status === 'Available' && (
        <p className="availability-explanation">
          Internet remains available for the full outage scenario.
        </p>
      )}
    </section>
  );
}
