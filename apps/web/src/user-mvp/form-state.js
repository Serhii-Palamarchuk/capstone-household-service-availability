import { DeviceCategory } from './constants.js';
import { createServiceInstance } from './service-builder.js';

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

function integerNumber(value, field, label, errors, { allowZero = false, optional = false } = {}) {
  const text = typeof value === 'string' ? value.trim() : String(value ?? '').trim();

  if (text === '') {
    if (!optional) {
      errors.push(uiError(
        allowZero ? 'REQUIRED_NON_NEGATIVE_INTEGER' : 'REQUIRED_POSITIVE_INTEGER',
        field,
        `${label} is required.`,
      ));
    }
    return undefined;
  }

  const number = Number(text);
  const isValid = Number.isInteger(number) && (allowZero ? number >= 0 : number > 0);
  if (!isValid) {
    errors.push(uiError(
      allowZero ? 'INVALID_NON_NEGATIVE_INTEGER' : 'INVALID_POSITIVE_INTEGER',
      field,
      `${label} must be ${allowZero ? 'zero or more' : 'greater than zero'} whole minutes.`,
    ));
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

function normalizeExternalProvider(provider, index, errors) {
  const prefix = `externalProviders.${index}`;

  return {
    id: requiredText(provider.id, `${prefix}.id`, 'External provider id', errors),
    name: requiredText(provider.name, `${prefix}.name`, 'External provider name', errors),
  };
}

function serviceErrorField(index, builderError) {
  if (builderError.roleId) {
    return `services.${index}.dependencyBindings.${builderError.roleId}`;
  }
  if (builderError.code === 'TEMPLATE_NOT_FOUND') return `services.${index}.templateId`;
  if (builderError.code === 'TEMPLATE_VARIANT_NOT_FOUND') return `services.${index}.variantId`;
  return `services.${index}`;
}

function serviceErrorMessage(code) {
  if (code === 'TEMPLATE_NOT_FOUND') return 'Choose a predefined service template.';
  if (code === 'TEMPLATE_VARIANT_NOT_FOUND') return 'Choose a predefined service variant.';
  if (code === 'TEMPLATE_ROLE_REQUIRED' || code === 'TEMPLATE_ROLE_CARDINALITY') {
    return 'Complete this required service role.';
  }
  if (code === 'TEMPLATE_DEPENDENCY_NOT_FOUND') return 'Choose an available dependency.';
  if (code === 'TEMPLATE_ROLE_NOT_FOUND') {
    return 'Remove bindings not supported by this service template.';
  }
  return 'Choose dependencies allowed by this service role.';
}

function normalizeServices(serviceForms, context, errors) {
  const services = [];
  const serviceReferences = [];

  for (const [index, serviceForm] of serviceForms.entries()) {
    const id = requiredText(serviceForm.id, `services.${index}.id`, 'Service id', errors);
    const name = requiredText(serviceForm.name, `services.${index}.name`, 'Service name', errors);
    const templateId = requiredText(
      serviceForm.templateId,
      `services.${index}.templateId`,
      'Service template',
      errors,
    );
    const variantText = typeof serviceForm.variantId === 'string'
      ? serviceForm.variantId.trim()
      : serviceForm.variantId;
    const input = {
      id,
      name,
      templateId,
      ...(variantText ? { variantId: variantText } : {}),
      dependencyBindings: Object.fromEntries(
        Object.entries(serviceForm.dependencyBindings ?? {}).map(([roleId, ids]) => [
          roleId,
          Array.isArray(ids) ? [...ids] : ids,
        ]),
      ),
    };
    const result = createServiceInstance(input, { ...context, services: serviceReferences });

    if (!result.success) {
      for (const builderError of result.errors) {
        errors.push(uiError(
          builderError.code,
          serviceErrorField(index, builderError),
          serviceErrorMessage(builderError.code),
        ));
      }
      if (id) serviceReferences.push({ id, name });
      continue;
    }

    services.push(result.service);
    serviceReferences.push(result.service);
  }

  return services;
}

export function getRoleBindingOptions(role, state, serviceIndex = state.services.length) {
  if (role.entityType === 'Device') {
    return state.devices.filter(device => (
      !role.allowedCategories || role.allowedCategories.includes(device.category)
    ));
  }
  if (role.entityType === 'ServiceInstance') {
    return state.services.slice(0, serviceIndex);
  }
  if (role.entityType === 'ExternalProvider') {
    return state.externalProviders;
  }

  return [];
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
    services: [
      {
        id: 'service-internet-home',
        name: 'Internet — Home',
        templateId: 'Internet',
        variantId: 'Fiber',
        dependencyBindings: {
          router: ['device-router'],
          ontOnu: ['device-ont'],
          provider: ['provider-internet'],
        },
      },
      {
        id: 'service-remote-work',
        name: 'Remote Work',
        templateId: 'RemoteWork',
        dependencyBindings: {
          internetService: ['service-internet-home'],
          workDevices: ['device-laptop'],
        },
      },
    ],
    externalProviders: [{
      id: 'provider-internet',
      name: 'Internet provider',
    }],
    scenario: {
      outageDurationMinutes: '480',
      targetServiceIds: ['service-remote-work'],
      additionalActiveDeviceIds: [],
      externalProviderAvailability: {
        'provider-internet': '600',
      },
    },
  };
}

export function normalizeUserMvpForm(state) {
  const errors = [];
  const devices = state.devices.map((device, index) => normalizeDevice(device, index, errors));
  const backupSources = state.backupSources.map(
    (source, index) => normalizeBackupSource(source, index, errors),
  );
  const externalProviders = state.externalProviders.map(
    (provider, index) => normalizeExternalProvider(provider, index, errors),
  );
  const services = normalizeServices(state.services, { devices, externalProviders }, errors);
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

  const outageDurationMinutes = integerNumber(
    state.scenario.outageDurationMinutes,
    'scenario.outageDurationMinutes',
    'Outage duration',
    errors,
  );
  const externalProviderAvailability = {};

  for (const provider of externalProviders) {
    const value = state.scenario.externalProviderAvailability?.[provider.id];
    const availabilityMinutes = integerNumber(
      value,
      `scenario.externalProviderAvailability.${provider.id}`,
      `${provider.name || 'External provider'} availability`,
      errors,
      { allowZero: true, optional: true },
    );
    if (availabilityMinutes !== undefined) {
      externalProviderAvailability[provider.id] = availabilityMinutes;
    }
  }

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    model: {
      services,
      devices,
      externalProviders,
    },
    backupSources,
    scenario: {
      outageDurationMinutes,
      targetServiceIds: [...state.scenario.targetServiceIds],
      backupAssignments,
      additionalActiveDeviceIds: [...state.scenario.additionalActiveDeviceIds],
      externalProviderAvailability,
      powerStrategy: 'ExternalFirst',
    },
  };
}
