const backupTypes = [
  { value: 'PowerStation', label: 'Power station' },
  { value: 'UPS', label: 'UPS' },
  { value: 'Other', label: 'Other' },
];

export function BackupStep({
  backupSources,
  devices,
  assignments,
  onAdd,
  onAssignmentChange,
  onBack,
  onChange,
  onRemove,
}) {
  return (
    <section className="wizard-panel" aria-labelledby="backup-title">
      <div className="section-heading">
        <div>
          <p className="step-label">Step 2 of 4</p>
          <h2 id="backup-title">Backup</h2>
          <p>Describe available energy and connect each device to at most one external source.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onAdd}>
          Add source
        </button>
      </div>

      <div className="entity-list">
        {backupSources.map((source, index) => (
          <article className="entity-card" key={source.id}>
            <div className="entity-card-heading">
              <h3>Backup source {index + 1}</h3>
              <button
                className="text-button danger-button"
                type="button"
                onClick={() => onRemove(source.id)}
              >
                Remove
              </button>
            </div>
            <div className="field-grid">
              <label htmlFor={`${source.id}-name`}>
                Name
                <input
                  id={`${source.id}-name`}
                  type="text"
                  value={source.name}
                  onChange={event => onChange(source.id, 'name', event.target.value)}
                />
              </label>
              <label htmlFor={`${source.id}-type`}>
                Type
                <select
                  id={`${source.id}-type`}
                  value={source.type}
                  onChange={event => onChange(source.id, 'type', event.target.value)}
                >
                  {backupTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>
              <label htmlFor={`${source.id}-capacity`}>
                Usable capacity (Wh)
                <input
                  id={`${source.id}-capacity`}
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="number"
                  value={source.usableCapacityWh}
                  onChange={event => onChange(source.id, 'usableCapacityWh', event.target.value)}
                />
              </label>
              <label htmlFor={`${source.id}-max-output`}>
                Maximum output (W) <span className="optional-label">Optional</span>
                <input
                  id={`${source.id}-max-output`}
                  inputMode="decimal"
                  min="0"
                  step="any"
                  type="number"
                  value={source.maxOutputPowerW}
                  onChange={event => onChange(source.id, 'maxOutputPowerW', event.target.value)}
                />
              </label>
            </div>
          </article>
        ))}
      </div>

      <div className="assignment-section">
        <div>
          <h3>Device assignments</h3>
          <p>A source may power several devices, but each device can use only one source.</p>
        </div>
        <div className="assignment-list">
          {devices.map(device => (
            <label className="assignment-row" htmlFor={`${device.id}-source`} key={device.id}>
              <span>
                <strong>{device.name || 'Unnamed device'}</strong>
                <small>{device.powerW ? `${device.powerW} W` : 'Power not set'}</small>
              </span>
              <select
                id={`${device.id}-source`}
                value={assignments[device.id] ?? ''}
                onChange={event => onAssignmentChange(device.id, event.target.value)}
              >
                <option value="">No external source</option>
                {backupSources.map(source => (
                  <option key={source.id} value={source.id}>
                    {source.name || 'Unnamed source'}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Back to equipment
        </button>
        <p className="next-step-note">Services &amp; Scenario continues in the next implementation task.</p>
      </div>
    </section>
  );
}
