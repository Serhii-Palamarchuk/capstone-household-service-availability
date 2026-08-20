import { DeviceCategory } from '../../user-mvp/constants.js';

const categoryOptions = Object.values(DeviceCategory);

export function EquipmentStep({
  deviceLabels,
  devices,
  onAdd,
  onChange,
  onRemove,
  onNext,
  t,
}) {
  return (
    <section className="wizard-panel" aria-labelledby="equipment-title">
      <div className="section-heading">
        <div>
          <p className="step-label">{t('step.numberOfTotal', { number: 1, total: 4 })}</p>
          <h2 id="equipment-title">{t('step.equipment')}</h2>
          <p>{t('helper.equipment')}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onAdd}>
          {t('actions.addDevice')}
        </button>
      </div>

      <div className="entity-list compact-entity-list">
        {devices.map(device => (
          <article className="compact-entity-row" key={device.id}>
            <details className="row-details">
              <summary>
                <span className="compact-row-summary">
                  <strong>{deviceLabels.get(device.id)}</strong>
                  <span className="compact-row-secondary">
                    {t('field.internalBattery')}: {device.internalBatteryWh
                      ? t('unit.wattHours', { value: device.internalBatteryWh })
                      : '—'}
                  </span>
                  <span className="details-label">{t('actions.details')}</span>
                </span>
              </summary>
              <div className="details-fields">
                <label htmlFor={`${device.id}-category`}>
                  {t('field.category')}
                  <select
                    id={`${device.id}-category`}
                    value={device.category}
                    onChange={event => onChange(device.id, 'category', event.target.value)}
                  >
                    {categoryOptions.map(category => (
                      <option key={category} value={category}>
                        {t(`category.${category}`, { fallback: category })}
                      </option>
                    ))}
                  </select>
                </label>
                <label htmlFor={`${device.id}-power`}>
                  {t('field.power')}
                  <input
                    id={`${device.id}-power`}
                    inputMode="decimal"
                    min="0"
                    step="any"
                    type="number"
                    value={device.powerW}
                    onChange={event => onChange(device.id, 'powerW', event.target.value)}
                  />
                </label>
                <label htmlFor={`${device.id}-battery`}>
                  <span>
                    {t('field.internalBattery')}{' '}
                    <span className="optional-label">{t('field.optional')}</span>
                  </span>
                  <input
                    id={`${device.id}-battery`}
                    inputMode="decimal"
                    min="0"
                    step="any"
                    type="number"
                    value={device.internalBatteryWh}
                    onChange={event => onChange(device.id, 'internalBatteryWh', event.target.value)}
                  />
                </label>
                <label className="secondary-field" htmlFor={`${device.id}-name`}>
                  <span>
                    {t('field.name')}{' '}
                    <span className="optional-label">{t('field.optional')}</span>
                  </span>
                  <input
                    id={`${device.id}-name`}
                    type="text"
                    value={device.name}
                    onChange={event => onChange(device.id, 'name', event.target.value)}
                  />
                </label>
              </div>
            </details>
            <button
              aria-label={`${t('actions.remove')}: ${deviceLabels.get(device.id)}`}
              className="text-button danger-button"
              type="button"
              onClick={() => onRemove(device.id)}
            >
              {t('actions.remove')}
            </button>
          </article>
        ))}
      </div>

      <div className="step-actions step-actions-end">
        <button className="primary-button" type="button" onClick={onNext}>
          {t('actions.continueToBackup')}
        </button>
      </div>
    </section>
  );
}
