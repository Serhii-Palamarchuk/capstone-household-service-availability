import { useRef, useState } from 'react';
import { BackupStep } from './components/user-mvp/BackupStep.jsx';
import { EquipmentStep } from './components/user-mvp/EquipmentStep.jsx';
import { DeviceCategory } from './user-mvp/constants.js';
import { createInitialUserMvpState } from './user-mvp/form-state.js';

const steps = ['Equipment', 'Backup', 'Services & Scenario', 'Result'];

export function App() {
  const [formState, setFormState] = useState(createInitialUserMvpState);
  const [currentStep, setCurrentStep] = useState(0);
  const nextDeviceNumber = useRef(1);
  const nextSourceNumber = useRef(1);

  function changeDevice(deviceId, field, value) {
    setFormState(current => ({
      ...current,
      devices: current.devices.map(device => (
        device.id === deviceId ? { ...device, [field]: value } : device
      )),
    }));
  }

  function addDevice() {
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
    setFormState(current => {
      const { [deviceId]: removedAssignment, ...remainingAssignments } = (
        current.backupAssignmentsByDeviceId
      );
      void removedAssignment;
      return {
        ...current,
        devices: current.devices.filter(device => device.id !== deviceId),
        backupAssignmentsByDeviceId: remainingAssignments,
      };
    });
  }

  function changeBackupSource(sourceId, field, value) {
    setFormState(current => ({
      ...current,
      backupSources: current.backupSources.map(source => (
        source.id === sourceId ? { ...source, [field]: value } : source
      )),
    }));
  }

  function addBackupSource() {
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
    setFormState(current => ({
      ...current,
      backupAssignmentsByDeviceId: {
        ...current.backupAssignmentsByDeviceId,
        [deviceId]: sourceId,
      },
    }));
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
              className={index === currentStep ? 'current-step' : index > 1 ? 'future-step' : ''}
              key={step}
            >
              <span>{index + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </nav>

      {currentStep === 0 ? (
        <EquipmentStep
          devices={formState.devices}
          onAdd={addDevice}
          onChange={changeDevice}
          onRemove={removeDevice}
          onNext={() => setCurrentStep(1)}
        />
      ) : (
        <BackupStep
          assignments={formState.backupAssignmentsByDeviceId}
          backupSources={formState.backupSources}
          devices={formState.devices}
          onAdd={addBackupSource}
          onAssignmentChange={changeAssignment}
          onBack={() => setCurrentStep(0)}
          onChange={changeBackupSource}
          onRemove={removeBackupSource}
        />
      )}
    </main>
  );
}
