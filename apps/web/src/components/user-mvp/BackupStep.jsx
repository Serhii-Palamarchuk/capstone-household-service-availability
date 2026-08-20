const backupTypes = ['PowerStation', 'UPS', 'Other'];

export function BackupStep({
  assignments,
  backupSourceLabels,
  backupSources,
  deviceLabels,
  devices,
  onAdd,
  onAssignmentChange,
  onBack,
  onChange,
  onNext,
  onRemove,
  t,
}) {
  const sourceCount = backupSources.length;

  return (
    <section className="wizard-panel" aria-labelledby="backup-title">
      <div className="section-heading">
        <div>
          <p className="step-label">{t('step.numberOfTotal', { number: 2, total: 4 })}</p>
          <h2 id="backup-title">{t('step.backup')}</h2>
          <p>{t('helper.backup')}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onAdd}>
          {t('actions.addSource')}
        </button>
      </div>

      <div className="entity-list compact-entity-list">
        {backupSources.map(source => (
          <article className="compact-entity-row" key={source.id}>
            <details className="row-details">
              <summary>
                <span className="compact-row-summary compact-row-summary-source">
                  <strong>{backupSourceLabels.get(source.id)}</strong>
                  <span className="details-label">{t('actions.details')}</span>
                </span>
              </summary>
              <div className="details-fields">
                <label htmlFor={`${source.id}-type`}>
                  {t('field.type')}
                  <select
                    id={`${source.id}-type`}
                    value={source.type}
                    onChange={event => onChange(source.id, 'type', event.target.value)}
                  >
                    {backupTypes.map(type => (
                      <option key={type} value={type}>
                        {t(`backupType.${type}`, { fallback: type })}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor={`${source.id}-capacity`}>
                  {t('field.usableCapacity')}
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
                  <span>
                    {t('field.maximumOutput')}{' '}
                    <span className="optional-label">{t('field.optional')}</span>
                  </span>
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
                <label className="secondary-field" htmlFor={`${source.id}-name`}>
                  <span>
                    {t('field.name')}{' '}
                    <span className="optional-label">{t('field.optional')}</span>
                  </span>
                  <input
                    id={`${source.id}-name`}
                    type="text"
                    value={source.name}
                    onChange={event => onChange(source.id, 'name', event.target.value)}
                  />
                </label>
              </div>
            </details>
            <button
              aria-label={`${t('actions.remove')}: ${backupSourceLabels.get(source.id)}`}
              className="text-button danger-button"
              type="button"
              onClick={() => onRemove(source.id)}
            >
              {t('actions.remove')}
            </button>
          </article>
        ))}
      </div>

      <div className="assignment-section">
        <div>
          <h3>{t('label.deviceAssignments')}</h3>
          <p>{t('helper.assignments')}</p>
        </div>
        {sourceCount === 0 ? (
          <p className="empty-state assignment-empty-state">
            {t('empty.noExternalSource')}
          </p>
        ) : (
          <div className="assignment-list">
            {devices.map(device => {
              const assignedSourceId = assignments[device.id] ?? '';
              const enabled = Boolean(assignedSourceId);
              const toggleId = `${device.id}-external-backup`;

              return (
                <div
                  className={`assignment-row${sourceCount === 1 ? ' assignment-row-single' : ''}`}
                  key={device.id}
                >
                  <strong>{deviceLabels.get(device.id)}</strong>
                  <label className="assignment-toggle" htmlFor={toggleId}>
                    <input
                      checked={enabled}
                      id={toggleId}
                      type="checkbox"
                      onChange={event => onAssignmentChange(
                        device.id,
                        event.target.checked ? backupSources[0].id : '',
                      )}
                    />
                    <span>{t('step.backup')}</span>
                  </label>
                  {sourceCount >= 2 && enabled && (
                    <label className="assignment-source-field" htmlFor={`${device.id}-source`}>
                      <span className="visually-hidden">
                        {t('step.backup')}: {deviceLabels.get(device.id)}
                      </span>
                      <select
                        id={`${device.id}-source`}
                        value={assignedSourceId}
                        onChange={event => onAssignmentChange(device.id, event.target.value)}
                      >
                        {backupSources.map(source => (
                          <option key={source.id} value={source.id}>
                            {backupSourceLabels.get(source.id)}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          {t('actions.backToEquipment')}
        </button>
        <button className="primary-button" type="button" onClick={onNext}>
          {t('actions.continueToServicesScenario')}
        </button>
      </div>
    </section>
  );
}
