import { DeviceCategory } from './constants.js';

function uiError(code, field, message) {
  return { code, field, message };
}

function requiredText(value, field, label, errors) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(uiError('REQUIRED_FIELD', field, `${label} is required.`));
    return '';
  }

  return value.trim();
}

function positiveNumber(value, field, label, errors, optional = false) {
  const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim();

  if (text === '') {
    if (!optional) {
      errors.push(uiError('REQUIRED_POSITIVE_NUMBER', field, `${label} is required.`));
    }
    return undefined;
  }

  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) {
    errors.push(uiError('INVALID_POSITIVE_NUMBER', field, `${label} must be greater than zero.`));
    return undefined;
  }

  return number;
}

function normalizeDevice(device, index, errors) {
  const prefix = `devices.${index}`;
  const id = requiredText(device.id, `${prefix}.id`, 'Device id', errors);
  const name = requiredText(device.name, `${prefix}.name`, 'Device name', errors);
  const category = requiredText(device.category, `${prefix}.category`, 'Device category', errors);
  const powerW = positiveNumber(device.powerW, `${prefix}.powerW`, 'Device power', errors);
  const internalBatteryWh = positiveNumber(
    device.internalBatteryWh,
    `${prefix}.internalBatteryWh`,
    'Internal battery capacity',
    errors,
    true,
  );

  return {
    id,
    name,
    category,
    powerW,
    ...(internalBatteryWh === undefined
      ? {}
      : { internalBattery: { usableCapacityWh: internalBatteryWh } }),
  };
}

function normalizeBackupSource(source, index, errors) {
  const prefix = `backupSources.${index}`;
  const id = requiredText(source.id, `${prefix}.id`, 'Backup source id', errors);
  const name = requiredText(source.name, `${prefix}.name`, 'Backup source name', errors);
  const type = requiredText(source.type, `${prefix}.type`, 'Backup source type', errors);
  const usableCapacityWh = positiveNumber(
    source.usableCapacityWh,
    `${prefix}.usableCapacityWh`,
    'Usable capacity',
    errors,
  );
  const maxOutputPowerW = positiveNumber(
    source.maxOutputPowerW,
    `${prefix}.maxOutputPowerW`,
    'Maximum output power',
    errors,
    true,
  );

  return {
    id,
    name,
    type,
    usableCapacityWh,
    ...(maxOutputPowerW === undefined ? {} : { maxOutputPowerW }),
  };
}

export function createInitialUserMvpState() {
  return {
    devices: [
      {
        id: 'device-router',
        name: 'Router',
        category: DeviceCategory.ROUTER,
        powerW: '10',
        internalBatteryWh: '',
      },
      {
        id: 'device-ont',
        name: 'ONT/ONU',
        category: DeviceCategory.ONT_ONU,
        powerW: '10',
        internalBatteryWh: '',
      },
      {
        id: 'device-laptop',
        name: 'Laptop',
        category: DeviceCategory.LAPTOP_DESKTOP,
        powerW: '60',
        internalBatteryWh: '120',
      },
    ],
    backupSources: [{
      id: 'source-home',
      name: 'Home backup',
      type: 'PowerStation',
      usableCapacityWh: '480',
      maxOutputPowerW: '',
    }],
    backupAssignmentsByDeviceId: {
      'device-router': 'source-home',
      'device-ont': 'source-home',
      'device-laptop': 'source-home',
    },
    services: [],
    externalProviders: [],
    scenario: {
      targetServiceIds: [],
      additionalActiveDeviceIds: [],
      externalProviderAvailability: {},
    },
  };
}

export function normalizeUserMvpForm(state) {
  const errors = [];
  const devices = state.devices.map((device, index) => normalizeDevice(device, index, errors));
  const backupSources = state.backupSources.map(
    (source, index) => normalizeBackupSource(source, index, errors),
  );
  const sourceIds = new Set(backupSources.map(({ id }) => id));
  const backupAssignments = [];

  for (const device of devices) {
    const backupSourceId = state.backupAssignmentsByDeviceId[device.id];
    if (!backupSourceId) continue;

    if (!sourceIds.has(backupSourceId)) {
      errors.push(uiError(
        'BACKUP_ASSIGNMENT_SOURCE_NOT_FOUND',
        `backupAssignmentsByDeviceId.${device.id}`,
        'Choose an available backup source.',
      ));
      continue;
    }

    backupAssignments.push({ deviceId: device.id, backupSourceId });
  }

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    model: {
      services: [...state.services],
      devices,
      externalProviders: [...state.externalProviders],
    },
    backupSources,
    scenario: {
      ...state.scenario,
      backupAssignments,
      powerStrategy: 'ExternalFirst',
    },
  };
}
