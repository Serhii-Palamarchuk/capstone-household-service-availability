import { DeviceCategory } from '../../user-mvp/constants.js';
import { translateValidationError } from '../../user-mvp/i18n.js';

const categoryOptions = Object.values(DeviceCategory);

function errorsForPrefix(errors, prefix) {
  return errors.filter(error => (
    error.field === prefix || error.field?.startsWith(`${prefix}.`)
  ));
}

function errorsForField(errors, field) {
  return errors.filter(error => error.field === field);
}

function validationAttributes(errors, errorId) {
  if (errors.length === 0) return {};
  return {
    'aria-describedby': errorId,
    'aria-invalid': true,
  };
}

function RowErrors({ errors, id, t }) {
  if (errors.length === 0) return null;

  return (
    <ul className="row-errors" id={id} role="status">
      {errors.map((error, index) => (
        <li key={`${error.code}-${error.field ?? 'global'}-${index}`}>
          {translateValidationError(error, t)}
        </li>
      ))}
    </ul>
  );
}

export function EquipmentStep({
  deviceLabels,
  devices,
  errors = [],
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
        {devices.map((device, deviceIndex) => {
          const deviceErrors = errorsForPrefix(errors, `devices.${deviceIndex}`);
          const errorId = `${device.id}-errors`;
          const hasErrors = deviceErrors.length > 0;
          const nameErrors = errorsForField(errors, `devices.${deviceIndex}.name`);
          const categoryErrors = errorsForField(errors, `devices.${deviceIndex}.category`);
          const powerErrors = errorsForField(errors, `devices.${deviceIndex}.powerW`);
          const batteryErrors = errorsForField(
            errors,
            `devices.${deviceIndex}.internalBatteryWh`,
          );

          return (
            <article
            className={`compact-entity-row${hasErrors ? ' has-errors' : ''}`}
            key={device.id}
          >
              <details
              className={`row-details${hasErrors ? ' has-errors' : ''}`}
              open={hasErrors || undefined}
            >
                <summary aria-describedby={hasErrors ? errorId : undefined}>
                  <span className="compact-row-summary">
                    <strong>{deviceLabels.get(device.id)}</strong>
                    <span className="compact-row-secondary">
                      {t('field.internalBattery')}: {device.internalBatteryWh
                        ? t('unit.wattHours', { value: device.internalBatteryWh })
                        : '—'}
                    </span>
                    <span className="details-label">
                      {t('actions.details')}
                      {hasErrors && <span className="error-badge">{deviceErrors.length}</span>}
                    </span>
                  </span>
                </summary>
                <RowErrors errors={deviceErrors} id={errorId} t={t} />
                <div className="details-fields">
                <label htmlFor={`${device.id}-category`}>
                  {t('field.category')}
                  <select
                    id={`${device.id}-category`}
                    value={device.category}
                    onChange={event => onChange(device.id, 'category', event.target.value)}
                    {...validationAttributes(categoryErrors, errorId)}
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
                    {...validationAttributes(powerErrors, errorId)}
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
                    {...validationAttributes(batteryErrors, errorId)}
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
                    {...validationAttributes(nameErrors, errorId)}
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
          );
        })}
      </div>

      <div className="step-actions step-actions-end">
        <button className="primary-button" type="button" onClick={onNext}>
          {t('actions.continueToBackup')}
        </button>
      </div>
    </section>
  );
}
