import { getRoleBindingOptions } from '../../user-mvp/form-state.js';
import { translateValidationError } from '../../user-mvp/i18n.js';
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

function dependencyLabel(entityType, id, {
  deviceLabels,
  providerLabels,
  serviceLabels,
}) {
  const labelsByType = {
    Device: deviceLabels,
    ExternalProvider: providerLabels,
    ServiceInstance: serviceLabels,
  };
  const label = labelsByType[entityType]?.get(id);
  return typeof label === 'string' && label.trim() ? label : null;
}

function dependencySummary(service, selectedTemplate, labelMaps, t) {
  if (!selectedTemplate) return t('empty.incomplete');

  const labels = [];
  let incomplete = false;

  for (const role of selectedTemplate.roles) {
    const selectedIds = service.dependencyBindings?.[role.id] ?? [];
    const hasRequiredCardinality = role.cardinality === '1'
      ? selectedIds.length === 1
      : selectedIds.length >= 1;
    if (!hasRequiredCardinality) incomplete = true;

    for (const id of selectedIds) {
      const label = dependencyLabel(role.entityType, id, labelMaps);
      if (label) labels.push(label);
      else incomplete = true;
    }
  }

  if (incomplete) labels.push(t('empty.incomplete'));
  return labels.join(', ') || t('empty.incomplete');
}

function FormErrors({ errors, nameFor, t }) {
  if (errors.length === 0) return null;

  return (
    <section className="input-errors" role="alert" aria-labelledby="form-errors-title">
      <h2 id="form-errors-title">{t('formErrors.heading')}</h2>
      <ul>
        {errors.map((error, index) => (
          <li key={`${error.code}-${error.field ?? 'global'}-${index}`}>
            {translateValidationError(error, t, nameFor)}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RowErrors({ errors, id, nameFor, t }) {
  if (errors.length === 0) return null;

  return (
    <ul className="row-errors" id={id} role="status">
      {errors.map((error, index) => (
        <li key={`${error.code}-${error.field ?? 'global'}-${index}`}>
          {translateValidationError(error, t, nameFor)}
        </li>
      ))}
    </ul>
  );
}

function ServiceRole({
  errors,
  errorId,
  formState,
  labelMaps,
  onChange,
  role,
  service,
  serviceIndex,
  t,
}) {
  const options = getRoleBindingOptions(role, formState, serviceIndex);
  const selectedIds = service.dependencyBindings?.[role.id] ?? [];
  const label = t(`role.${role.id}`, { fallback: labelForIdentifier(role.id) });
  const entityType = t(`entityType.${role.entityType}`, { fallback: role.entityType });
  const field = `services.${serviceIndex}.dependencyBindings.${role.id}`;
  const roleErrors = errorsForField(errors, field);
  const aria = validationAttributes(roleErrors, errorId);

  if (role.cardinality === '1') {
    return (
      <label htmlFor={`${service.id}-${role.id}`}>
        {label} <span className="role-type">{entityType}</span>
        <select
          id={`${service.id}-${role.id}`}
          value={selectedIds[0] ?? ''}
          onChange={event => onChange(
            service.id,
            role.id,
            event.target.value ? [event.target.value] : [],
          )}
          {...aria}
        >
          <option value="">{t('empty.chooseOne')}</option>
          {options.map(option => (
            <option key={option.id} value={option.id}>
              {dependencyLabel(role.entityType, option.id, labelMaps) || t('empty.unnamedItem')}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <fieldset className="role-group" {...aria}>
      <legend>
        {label}{' '}
        <span className="role-type">{entityType}, {t('role.oneOrMore')}</span>
      </legend>
      {options.length === 0 ? (
        <p className="empty-state">{t('empty.noCompatibleItems')}</p>
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
              <span>
                {dependencyLabel(role.entityType, option.id, labelMaps)
                  || t('empty.unnamedItem')}
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function ServicesScenarioStep({
  backupSourceLabels,
  deviceLabels,
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
  providerLabels,
  serviceLabels,
  t,
}) {
  const labelMaps = { deviceLabels, providerLabels, serviceLabels };
  const nameFor = id => (
    backupSourceLabels?.get(id)
    ?? deviceLabels.get(id)
    ?? providerLabels.get(id)
    ?? serviceLabels.get(id)
    ?? id
  );
  const outageErrors = errorsForField(errors, 'scenario.outageDurationMinutes');

  return (
    <section className="wizard-panel" aria-labelledby="services-title">
      <div className="section-heading">
        <div>
          <p className="step-label">{t('step.numberOfTotal', { number: 3, total: 4 })}</p>
          <h2 id="services-title">{t('step.servicesScenario')}</h2>
          <p>{t('helper.servicesScenario')}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onAddService}>
          {t('actions.addService')}
        </button>
      </div>

      <FormErrors errors={errors} nameFor={nameFor} t={t} />

      <div className="entity-list compact-service-list">
        {formState.services.map((service, serviceIndex) => {
          const template = serviceTemplates.find(item => item.id === service.templateId);
          const selectedTemplate = getServiceTemplate(
            service.templateId,
            service.variantId || undefined,
          );
          const serviceErrors = errorsForPrefix(errors, `services.${serviceIndex}`);
          const errorId = `${service.id}-errors`;
          const hasErrors = serviceErrors.length > 0;
          const serviceLabel = serviceLabels.get(service.id);
          const summary = dependencySummary(service, selectedTemplate, labelMaps, t);
          const nameErrors = errorsForField(errors, `services.${serviceIndex}.name`);
          const templateErrors = errorsForField(errors, `services.${serviceIndex}.templateId`);
          const variantErrors = errorsForField(errors, `services.${serviceIndex}.variantId`);

          return (
            <article
              className={`compact-service-row${hasErrors ? ' has-errors' : ''}`}
              id={`${service.id}-row`}
              key={service.id}
            >
              <div className="compact-service-row-main">
                <div className="service-row-identity">
                  <strong>{serviceLabel}</strong>
                  <span className="dependency-summary">{summary}</span>
                </div>
                <label
                  aria-label={`${t('scenario.target')}: ${serviceLabel}`}
                  className="target-toggle"
                  htmlFor={`${service.id}-target`}
                >
                  <input
                    id={`${service.id}-target`}
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
                  <span>{t('scenario.target')}</span>
                </label>
                <details
                  className={`row-details service-row-details${hasErrors ? ' has-errors' : ''}`}
                  id={`${service.id}-details`}
                  open={hasErrors || undefined}
                >
                  <summary aria-describedby={hasErrors ? errorId : undefined}>
                    <span className="details-label">{t('actions.details')}</span>
                    {hasErrors && <span className="error-badge">{serviceErrors.length}</span>}
                  </summary>
                  <RowErrors errors={serviceErrors} id={errorId} nameFor={nameFor} t={t} />
                  <div className="details-fields service-details-fields">
                    <label className="secondary-field" htmlFor={`${service.id}-name`}>
                      <span>
                        {t('field.name')}{' '}
                        <span className="optional-label">{t('field.optional')}</span>
                      </span>
                      <input
                        id={`${service.id}-name`}
                        type="text"
                        value={service.name}
                        onChange={event => onServiceChange(
                          service.id,
                          'name',
                          event.target.value,
                        )}
                        {...validationAttributes(nameErrors, errorId)}
                      />
                    </label>
                    <label htmlFor={`${service.id}-template`}>
                      {t('field.template')}
                      <select
                        id={`${service.id}-template`}
                        value={service.templateId}
                        onChange={event => onServiceChange(
                          service.id,
                          'templateId',
                          event.target.value,
                        )}
                        {...validationAttributes(templateErrors, errorId)}
                      >
                        <option value="">{t('empty.chooseTemplate')}</option>
                        {serviceTemplates.map(option => (
                          <option key={option.id} value={option.id}>
                            {t(`template.${option.id}`, {
                              fallback: labelForIdentifier(option.id),
                            })}
                          </option>
                        ))}
                      </select>
                    </label>
                    {template?.variants && (
                      <label htmlFor={`${service.id}-variant`}>
                        {t('field.variant')}
                        <select
                          id={`${service.id}-variant`}
                          value={service.variantId ?? ''}
                          onChange={event => onServiceChange(
                            service.id,
                            'variantId',
                            event.target.value,
                          )}
                          {...validationAttributes(variantErrors, errorId)}
                        >
                          <option value="">{t('empty.chooseVariant')}</option>
                          {template.variants.map(variant => (
                            <option key={variant.id} value={variant.id}>
                              {t(`variant.${variant.id}`, {
                                fallback: labelForIdentifier(variant.id),
                              })}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>

                  {selectedTemplate && (
                    <div className="service-roles compact-service-roles">
                      <h4>{t('label.requiredRoles')}</h4>
                      <div className="field-grid">
                        {selectedTemplate.roles.map(role => (
                          <ServiceRole
                            errorId={errorId}
                            errors={errors}
                            formState={formState}
                            key={role.id}
                            labelMaps={labelMaps}
                            onChange={onRoleBindingChange}
                            role={role}
                            service={service}
                            serviceIndex={serviceIndex}
                            t={t}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </details>
                <button
                  aria-label={`${t('actions.remove')}: ${serviceLabel}`}
                  className="text-button danger-button service-remove-button"
                  type="button"
                  onClick={() => onServiceRemove(service.id)}
                >
                  {t('actions.remove')}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <section className="scenario-section" aria-labelledby="providers-title">
        <div className="subsection-heading">
          <div>
            <h3 id="providers-title">{t('label.externalProviders')}</h3>
            <p>{t('helper.providers')}</p>
          </div>
          <button className="secondary-button" type="button" onClick={onAddProvider}>
            {t('actions.addProvider')}
          </button>
        </div>
        <div className="entity-list compact-list">
          {formState.externalProviders.map((provider, providerIndex) => {
            const nameErrors = errorsForField(
              errors,
              `externalProviders.${providerIndex}.name`,
            );
            const availabilityErrors = errorsForField(
              errors,
              `scenario.externalProviderAvailability.${provider.id}`,
            ).concat(errors.filter(error => error.providerId === provider.id));
            const providerErrors = errors.filter(error => (
              error.field === `externalProviders.${providerIndex}`
              || error.field?.startsWith(`externalProviders.${providerIndex}.`)
              || error.field === `scenario.externalProviderAvailability.${provider.id}`
              || error.providerId === provider.id
            ));
            const errorId = `${provider.id}-errors`;
            const hasErrors = providerErrors.length > 0;

            return (
              <article
                className={`compact-provider-row${hasErrors ? ' has-errors' : ''}`}
                id={`${provider.id}-row`}
                key={provider.id}
              >
                <label htmlFor={`${provider.id}-name`}>
                  {t('field.providerName')}
                  <input
                    id={`${provider.id}-name`}
                    type="text"
                    value={provider.name}
                    onChange={event => onProviderChange(provider.id, event.target.value)}
                    {...validationAttributes(nameErrors, errorId)}
                  />
                </label>
                <label htmlFor={`${provider.id}-availability`}>
                  {t('field.availability')}
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
                    {...validationAttributes(availabilityErrors, errorId)}
                  />
                </label>
                <button
                  aria-label={`${t('actions.remove')}: ${providerLabels.get(provider.id)}`}
                  className="text-button danger-button"
                  type="button"
                  onClick={() => onProviderRemove(provider.id)}
                >
                  {t('actions.remove')}
                </button>
                <RowErrors errors={providerErrors} id={errorId} nameFor={nameFor} t={t} />
              </article>
            );
          })}
        </div>
      </section>

      <section className="scenario-section" aria-labelledby="scenario-title">
        <div>
          <h3 id="scenario-title">{t('label.outageScenario')}</h3>
          <p>{t('helper.outageScenario')}</p>
        </div>
        <div className="scenario-fields">
          <div className={`outage-field${outageErrors.length > 0 ? ' has-errors' : ''}`}>
            <label htmlFor="outage-duration">
              {t('field.outageDuration')}
              <input
                id="outage-duration"
                inputMode="numeric"
                min="1"
                step="1"
                type="number"
                value={formState.scenario.outageDurationMinutes}
                onChange={event => onOutageChange(event.target.value)}
                {...validationAttributes(outageErrors, 'outage-duration-errors')}
              />
            </label>
            <RowErrors errors={outageErrors} id="outage-duration-errors" t={t} />
          </div>
          <fieldset className="role-group additional-loads">
            <legend>{t('label.additionalDeviceLoads')}</legend>
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
                  <span>{deviceLabels.get(device.id)}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <div className="step-actions">
        <button className="secondary-button" type="button" onClick={onBack}>
          {t('actions.backToBackup')}
        </button>
        <button className="primary-button" type="button" onClick={onSubmit}>
          {t('actions.runScenario')}
        </button>
      </div>
    </section>
  );
}
