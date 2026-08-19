import { DeviceCategory } from '../../user-mvp/constants.js';

const categoryOptions = Object.values(DeviceCategory);

export function EquipmentStep({ devices, onAdd, onChange, onRemove, onNext }) {
  return (
    <section className="wizard-panel" aria-labelledby="equipment-title">
      <div className="section-heading">
        <div>
          <p className="step-label">Step 1 of 4</p>
          <h2 id="equipment-title">Equipment</h2>
          <p>Add the devices that support your household services or consume backup power.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onAdd}>
          Add device
        </button>
      </div>

      <div className="entity-list">
        {devices.map((device, index) => (
          <article className="entity-card" key={device.id}>
            <div className="entity-card-heading">
              <h3>Device {index + 1}</h3>
              <button
                className="text-button danger-button"
                type="button"
                onClick={() => onRemove(device.id)}
              >
                Remove
              </button>
            </div>
            <div className="field-grid">
              <label htmlFor={`${device.id}-name`}>
                Name
                <input
                  id={`${device.id}-name`}
                  type="text"
                  value={device.name}
                  onChange={event => onChange(device.id, 'name', event.target.value)}
                />
              </label>
              <label htmlFor={`${device.id}-category`}>
                Category
                <select
                  id={`${device.id}-category`}
                  value={device.category}
                  onChange={event => onChange(device.id, 'category', event.target.value)}
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>
              <label htmlFor={`${device.id}-power`}>
                Power (W)
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
                Internal battery (Wh) <span className="optional-label">Optional</span>
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
            </div>
          </article>
        ))}
      </div>

      <div className="step-actions step-actions-end">
        <button className="primary-button" type="button" onClick={onNext}>
          Continue to backup
        </button>
      </div>
    </section>
  );
}
