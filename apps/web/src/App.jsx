import { useRef, useState } from 'react';
import { BackupStep } from './components/user-mvp/BackupStep.jsx';
import { EquipmentStep } from './components/user-mvp/EquipmentStep.jsx';
import { ServicesScenarioStep } from './components/user-mvp/ServicesScenarioStep.jsx';
import { UserScenarioResult } from './components/user-mvp/UserScenarioResult.jsx';
import { DeviceCategory } from './user-mvp/constants.js';
import {
  backupSourceDisplayLabels,
  deviceDisplayLabels,
  serviceDisplayLabels,
} from './user-mvp/entity-labels.js';
import {
  createInitialUserMvpState,
  normalizeUserMvpForm,
} from './user-mvp/form-state.js';
import { createTranslator } from './user-mvp/i18n.js';
import { invalidateResultState } from './user-mvp/result-state.js';
import { runUserScenario } from './user-mvp/run-user-scenario.js';

const steps = ['Equipment', 'Backup', 'Services & Scenario', 'Result'];

function withoutDependency(services, dependencyId) {
  return services.map(service => ({
    ...service,
    dependencyBindings: Object.fromEntries(
      Object.entries(service.dependencyBindings).map(([roleId, ids]) => [
        roleId,
        ids.filter(id => id !== dependencyId),
      ]),
    ),
  }));
}

export function App() {
  const [language, setLanguage] = useState('en');
  const [formState, setFormState] = useState(createInitialUserMvpState);
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [outcome, setOutcome] = useState(null);
  const [submittedInput, setSubmittedInput] = useState(null);
  const [resultStale, setResultStale] = useState(false);
  const nextDeviceNumber = useRef(1);
  const nextProviderNumber = useRef(1);
  const nextServiceNumber = useRef(1);
  const nextSourceNumber = useRef(1);
  const t = createTranslator(language);
  const deviceLabels = deviceDisplayLabels(formState.devices, t);
  const backupSourceLabels = backupSourceDisplayLabels(formState.backupSources, t);
  const serviceLabels = serviceDisplayLabels(formState.services, t);
  const providerLabels = new Map(formState.externalProviders.map(provider => [
    provider.id,
    provider.name.trim(),
  ]));

  function invalidateResult() {
    const next = invalidateResultState({ outcome, submittedInput, resultStale });
    setOutcome(next.outcome);
    setSubmittedInput(next.submittedInput);
    setResultStale(next.resultStale);
  }

  function changeDevice(deviceId, field, value) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      devices: current.devices.map(device => (
        device.id === deviceId ? { ...device, [field]: value } : device
      )),
    }));
  }

  function addDevice() {
    invalidateResult();
    const id = `device-custom-${nextDeviceNumber.current}`;
    nextDeviceNumber.current += 1;
    setFormState(current => ({
      ...current,
      devices: [...current.devices, {
        id,
        name: '',
        category: DeviceCategory.OTHER_LOAD,
        powerW: '',
        internalBatteryWh: '',
      }],
    }));
  }

  function removeDevice(deviceId) {
    invalidateResult();
    setFormState(current => {
      const { [deviceId]: removedAssignment, ...remainingAssignments } = (
        current.backupAssignmentsByDeviceId
      );
      void removedAssignment;
      return {
        ...current,
        devices: current.devices.filter(device => device.id !== deviceId),
        backupAssignmentsByDeviceId: remainingAssignments,
        services: withoutDependency(current.services, deviceId),
        scenario: {
          ...current.scenario,
          additionalActiveDeviceIds: current.scenario.additionalActiveDeviceIds.filter(
            id => id !== deviceId,
          ),
        },
      };
    });
  }

  function changeBackupSource(sourceId, field, value) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      backupSources: current.backupSources.map(source => (
        source.id === sourceId ? { ...source, [field]: value } : source
      )),
    }));
  }

  function addBackupSource() {
    invalidateResult();
    const id = `source-custom-${nextSourceNumber.current}`;
    nextSourceNumber.current += 1;
    setFormState(current => ({
      ...current,
      backupSources: [...current.backupSources, {
        id,
        name: '',
        type: 'PowerStation',
        usableCapacityWh: '',
        maxOutputPowerW: '',
      }],
    }));
  }

  function removeBackupSource(sourceId) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      backupSources: current.backupSources.filter(source => source.id !== sourceId),
      backupAssignmentsByDeviceId: Object.fromEntries(
        Object.entries(current.backupAssignmentsByDeviceId).map(([deviceId, assignedSourceId]) => [
          deviceId,
          assignedSourceId === sourceId ? '' : assignedSourceId,
        ]),
      ),
    }));
  }

  function changeAssignment(deviceId, sourceId) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      backupAssignmentsByDeviceId: {
        ...current.backupAssignmentsByDeviceId,
        [deviceId]: sourceId,
      },
    }));
  }

  function addService() {
    invalidateResult();
    const id = `service-custom-${nextServiceNumber.current}`;
    nextServiceNumber.current += 1;
    setFormState(current => ({
      ...current,
      services: [...current.services, {
        id,
        name: '',
        templateId: '',
        variantId: '',
        dependencyBindings: {},
      }],
    }));
  }

  function changeService(serviceId, field, value) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      services: current.services.map(service => {
        if (service.id !== serviceId) return service;
        if (field === 'templateId') {
          return {
            ...service,
            templateId: value,
            variantId: '',
            dependencyBindings: {},
          };
        }
        if (field === 'variantId') {
          return { ...service, variantId: value, dependencyBindings: {} };
        }
        return { ...service, [field]: value };
      }),
    }));
  }

  function removeService(serviceId) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      services: withoutDependency(
        current.services.filter(service => service.id !== serviceId),
        serviceId,
      ),
      scenario: {
        ...current.scenario,
        targetServiceIds: current.scenario.targetServiceIds.filter(id => id !== serviceId),
      },
    }));
  }

  function changeRoleBinding(serviceId, roleId, ids) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      services: current.services.map(service => (
        service.id === serviceId
          ? {
            ...service,
            dependencyBindings: { ...service.dependencyBindings, [roleId]: ids },
          }
          : service
      )),
    }));
  }

  function addProvider() {
    invalidateResult();
    const id = `provider-custom-${nextProviderNumber.current}`;
    nextProviderNumber.current += 1;
    setFormState(current => ({
      ...current,
      externalProviders: [...current.externalProviders, { id, name: '' }],
    }));
  }

  function changeProvider(providerId, name) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      externalProviders: current.externalProviders.map(provider => (
        provider.id === providerId ? { ...provider, name } : provider
      )),
    }));
  }

  function removeProvider(providerId) {
    invalidateResult();
    setFormState(current => {
      const { [providerId]: removedAvailability, ...remainingAvailability } = (
        current.scenario.externalProviderAvailability
      );
      void removedAvailability;
      return {
        ...current,
        externalProviders: current.externalProviders.filter(provider => provider.id !== providerId),
        services: withoutDependency(current.services, providerId),
        scenario: {
          ...current.scenario,
          externalProviderAvailability: remainingAvailability,
        },
      };
    });
  }

  function changeProviderAvailability(providerId, value) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      scenario: {
        ...current.scenario,
        externalProviderAvailability: {
          ...current.scenario.externalProviderAvailability,
          [providerId]: value,
        },
      },
    }));
  }

  function changeScenarioList(field, ids) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      scenario: { ...current.scenario, [field]: ids },
    }));
  }

  function changeOutage(value) {
    invalidateResult();
    setFormState(current => ({
      ...current,
      scenario: { ...current.scenario, outageDurationMinutes: value },
    }));
  }

  function submitScenario() {
    const normalized = normalizeUserMvpForm(formState);
    if (!normalized.success) {
      setErrors(normalized.errors);
      setOutcome(null);
      setSubmittedInput(null);
      return;
    }

    setErrors([]);
    setSubmittedInput(normalized);
    setOutcome(runUserScenario(normalized));
    setResultStale(false);
    setCurrentStep(3);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Household outage planner</p>
        <h1>Configure the equipment behind your essential services</h1>
        <p>
          Describe device loads and backup energy first. The system will use them to estimate
          service availability instead of asking you for ready-made availability minutes.
        </p>
      </header>

      <aside className="fixture-notice">
        <strong>Editable example data.</strong>{' '}
        The starting values come from acceptance test AC-12; they are not measured device
        specifications or claims about real-world runtime.
      </aside>

      <nav className="step-navigation" aria-label="Scenario steps">
        <ol>
          {steps.map((step, index) => (
            <li
              className={index === currentStep ? 'current-step' : index > currentStep ? 'future-step' : ''}
              key={step}
            >
              <span>{index + 1}</span>
              {index < currentStep ? (
                <button type="button" onClick={() => setCurrentStep(index)}>{step}</button>
              ) : step}
            </li>
          ))}
        </ol>
      </nav>

      {resultStale && (
        <p className="step-label" role="status">
          {t('result.needsRecalculation', { fallback: 'Result needs recalculation' })}
        </p>
      )}

      {currentStep === 0 && (
        <EquipmentStep
          deviceLabels={deviceLabels}
          devices={formState.devices}
          onAdd={addDevice}
          onChange={changeDevice}
          onRemove={removeDevice}
          onNext={() => setCurrentStep(1)}
          t={t}
        />
      )}
      {currentStep === 1 && (
        <BackupStep
          assignments={formState.backupAssignmentsByDeviceId}
          backupSourceLabels={backupSourceLabels}
          backupSources={formState.backupSources}
          deviceLabels={deviceLabels}
          devices={formState.devices}
          onAdd={addBackupSource}
          onAssignmentChange={changeAssignment}
          onBack={() => setCurrentStep(0)}
          onChange={changeBackupSource}
          onNext={() => setCurrentStep(2)}
          onRemove={removeBackupSource}
          t={t}
        />
      )}
      {currentStep === 2 && (
        <ServicesScenarioStep
          deviceLabels={deviceLabels}
          errors={errors}
          formState={formState}
          onAddProvider={addProvider}
          onAddService={addService}
          onBack={() => setCurrentStep(1)}
          onOutageChange={changeOutage}
          onProviderAvailabilityChange={changeProviderAvailability}
          onProviderChange={changeProvider}
          onProviderRemove={removeProvider}
          onRoleBindingChange={changeRoleBinding}
          onScenarioListChange={changeScenarioList}
          onServiceChange={changeService}
          onServiceRemove={removeService}
          onSubmit={submitScenario}
          providerLabels={providerLabels}
          serviceLabels={serviceLabels}
          t={t}
        />
      )}
      {currentStep === 3 && outcome && submittedInput && (
        <UserScenarioResult
          input={submittedInput}
          outcome={outcome}
          onBack={() => setCurrentStep(2)}
        />
      )}
    </main>
  );
}
