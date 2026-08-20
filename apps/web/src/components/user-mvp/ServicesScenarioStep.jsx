import { getRoleBindingOptions } from '../../user-mvp/form-state.js';
import { getServiceTemplate, serviceTemplates } from '../../user-mvp/service-templates.js';

function labelForIdentifier(value) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .replace(/^./, character => character.toUpperCase());
}

function toggleId(ids, id, checked) {
  return checked ? [...ids, id] : ids.filter(currentId => currentId !== id);
}

function FormErrors({ errors }) {
  if (errors.length === 0) return null;

  return (
    <section className="input-errors" role="alert" aria-labelledby="form-errors-title">
      <h2 id="form-errors-title">Correct the scenario before running it</h2>
      <ul>
        {errors.map((error, index) => (
          <li key={`${error.code}-${error.field ?? 'global'}-${index}`}>
            <strong>{error.code}</strong>: {error.message ?? 'Check this value.'}
          </li>
        ))}
      </ul>
    </section>
  );
}

function ServiceRole({ formState, onChange, role, service, serviceIndex }) {
  const options = getRoleBindingOptions(role, formState, serviceIndex);
  const selectedIds = service.dependencyBindings[role.id] ?? [];
  const label = labelForIdentifier(role.id);

  if (role.cardinality === '1') {
    return (
      <label htmlFor={`${service.id}-${role.id}`}>
        {label} <span className="role-type">{role.entityType}</span>
        <select
          id={`${service.id}-${role.id}`}
          value={selectedIds[0] ?? ''}
          onChange={event => onChange(
            service.id,
            role.id,
            event.target.value ? [event.target.value] : [],
          )}
        >
          <option value="">Choose one</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {option.name || 'Unnamed item'}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <fieldset className="role-group">
      <legend>
        {label} <span className="role-type">{role.entityType}, one or more</span>
      </legend>
      {options.length === 0 ? (
        <p className="empty-state">No compatible items are available.</p>
      ) : (
        <div className="checkbox-grid">
          {options.map(option => (
            <label key={option.id}>
              <input
                type="checkbox"
                checked={selectedIds.includes(option.id)}
                onChange={event => onChange(
                  service.id,
                  role.id,
                  toggleId(selectedIds, option.id, event.target.checked),
                )}
              />
              <span>{option.name || 'Unnamed item'}</span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function ServicesScenarioStep({
  errors,
  formState,
  onAddProvider,
  onAddService,
  onBack,
  onProviderAvailabilityChange,
  onProviderChange,
  onProviderRemove,
  onRoleBindingChange,
  onScenarioListChange,
  onServiceChange,
  onServiceRemove,
  onSubmit,
  onOutageChange,
}) {
  return (
    <section className="wizard-panel" aria-labelledby="services-title">
      <div className="section-heading">
        <div>
          <p className="step-label">Step 3 of 4</p>
          <h2 id="services-title">Services &amp; Scenario</h2>
          <p>
            Build services from predefined templates, choose targets, and describe the outage.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onAddService}>
          Add service
        </button>
      </div>

      <FormErrors errors={errors} />

      <div className="entity-list">
        {formState.services.map((service, serviceIndex) => {
          const template = serviceTemplates.find(item => item.id === service.templateId);
          const selectedTemplate = getServiceTemplate(
            service.templateId,
            service.variantId || undefined,
          );

          return (
            <article className="entity-card" key={service.id}>
              <div className="entity-card-heading">
                <h3>Service {serviceIndex + 1}</h3>
                <button
                  className="text-button danger-button"
                  type="button"
                  onClick={() => onServiceRemove(service.id)}
                >
                  Remove
                </button>
              </div>
              <div className="field-grid">
                <label htmlFor={`${service.id}-name`}>
                  Name
                  <input
                    id={`${service.id}-name`}
                    type="text"
                    value={service.name}
                    onChange={event => onServiceChange(service.id, 'name', event.target.value)}
                  />
                </label>
                <label htmlFor={`${service.id}-template`}>
                  Template
                  <select
                    id={`${service.id}-template`}
                    value={service.templateId}
                    onChange={event => onServiceChange(
                      service.id,
                      'templateId',
                      event.target.value,
                    )}
                  >
                    <option value="">Choose a template</option>
                    {serviceTemplates.map(option => (
                      <option key={option.id} value={option.id}>
                        {labelForIdentifier(option.id)}
                      </option>
                    ))}
                  </select>
                </label>
                {template?.variants && (
                  <label htmlFor={`${service.id}-variant`}>
                    Variant
                    <select
                      id={`${service.id}-variant`}
                      value={service.variantId ?? ''}
                      onChange={event => onServiceChange(
                        service.id,
                        'variantId',
                        event.target.value,
                      )}
                    >
                      <option value="">Choose a variant</option>
                      {template.variants.map(variant => (
                        <option key={variant.id} value={variant.id}>
                          {labelForIdentifier(variant.id)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              {selectedTemplate && (
                <div className="service-roles">
                  <h4>Required roles</h4>
                  <div className="field-grid">
                    {selectedTemplate.roles.map(role => (
                      <ServiceRole
                        formState={formState}
                        key={role.id}
                        onChange={onRoleBindingChange}
                        role={role}
                        service={service}
                        serviceIndex={serviceIndex}
                      />
                    ))}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      <section className="scenario-section" aria-labelledby="providers-title">
        <div className="subsection-heading">
          <div>
            <h3 id="providers-title">External providers</h3>
            <p>Add providers used by service roles and enter their outage availability.</p>
          </div>
          <button className="secondary-button" type="button" onClick={onAddProvider}>
            Add provider
          </button>
        </div>
        <div className="entity-list compact-list">
          {formState.externalProviders.map(provider => (
            <article className="entity-card provider-row" key={provider.id}>
              <label htmlFor={`${provider.id}-name`}>
                Provider name
                <input
                  id={`${provider.id}-name`}
                  type="text"
                  value={provider.name}
                  onChange={event => onProviderChange(provider.id, event.target.value)}
                />
              </label>
              <label htmlFor={`${provider.id}-availability`}>
                Availability (minutes)
                <input
                  id={`${provider.id}-availability`}
                  inputMode="numeric"
                  min="0"
                  step="1"
                  type="number"
                  value={formState.scenario.externalProviderAvailability[provider.id] ?? ''}
                  onChange={event => onProviderAvailabilityChange(
                    provider.id,
                    event.target.value,
                  )}
                />
              </label>
              <button
                className="text-button danger-button"
                type="button"
                onClick={() => onProviderRemove(provider.id)}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="scenario-section" aria-labelledby="scenario-title">
        <div>
          <h3 id="scenario-title">Outage scenario</h3>
          <p>Targets create mandatory loads. Additional loads only consume shared energy.</p>
        </div>
        <div className="scenario-fields">
          <label htmlFor="outage-duration">
            Outage duration (minutes)
            <input
              id="outage-duration"
              inputMode="numeric"
              min="1"
              step="1"
              type="number"
              value={formState.scenario.outageDurationMinutes}
              onChange={event => onOutageChange(event.target.value)}
            />
          </label>
          <fieldset className="role-group">
            <legend>Target services</legend>
            <div className="checkbox-grid">
              {formState.services.map(service => (
                <label key={service.id}>
                  <input
                    type="checkbox"
                    checked={formState.scenario.targetServiceIds.includes(service.id)}
                    onChange={event => onScenarioListChange(
                      'targetServiceIds',
                      toggleId(
                        formState.scenario.targetServiceIds,
                        service.id,
                        event.target.checked,
                      ),
                    )}
                  />
                  <span>{service.name || 'Unnamed service'}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset className="role-group">
            <legend>Additional device loads</legend>
            <div className="checkbox-grid">
              {formState.devices.map(device => (
                <label key={device.id}>
                  <input
                    type="checkbox"
                    checked={formState.scenario.additionalActiveDeviceIds.includes(device.id)}
                    onChange={event => onScenarioListChange(
                      'additionalActiveDeviceIds',
                      toggleId(
                        formState.scenario.additionalActiveDeviceIds,
                        device.id,
                        event.target.checked,
                      ),
                    )}
                  />
                  <span>{device.name || 'Unnamed device'}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          Back to backup
        </button>
        <button className="primary-button" type="button" onClick={onSubmit}>
          Run scenario
        </button>
      </div>
    </section>
  );
}
