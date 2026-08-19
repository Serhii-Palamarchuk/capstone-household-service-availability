export const INTERNET_DEMO_MODEL = {
  services: [{
    id: 'service-internet',
    name: 'Internet',
    dependencyIds: ['device-router', 'device-ont', 'provider-isp'],
  }],
  devices: [
    { id: 'device-router', name: 'Router' },
    { id: 'device-ont', name: 'ONT/ONU' },
  ],
  externalProviders: [
    { id: 'provider-isp', name: 'Internet Provider' },
  ],
};

export const DEFAULT_INTERNET_DEMO_INPUTS = {
  outageHours: '6',
  routerHours: '8',
  ontHours: '2',
  providerHours: '72',
};

export const DEMO_NODE_NAMES = {
  'service-internet': 'Internet',
  'device-router': 'Router',
  'device-ont': 'ONT/ONU',
  'provider-isp': 'Internet Provider',
};

const inputFields = [
  {
    field: 'outageHours',
    label: 'Outage duration',
    minimum: 0,
  },
  {
    field: 'routerHours',
    label: 'Router availability',
    minimum: 0,
  },
  {
    field: 'ontHours',
    label: 'ONT/ONU availability',
    minimum: 0,
  },
  {
    field: 'providerHours',
    label: 'Internet Provider availability',
    minimum: 0,
  },
];

export function createInternetScenarioFromHours(inputs) {
  const errors = [];
  const minutesByField = {};

  for (const { field, label, minimum } of inputFields) {
    const value = inputs[field];

    if (typeof value !== 'string' || value.trim() === '') {
      errors.push({ field, message: `${label} is required.` });
      continue;
    }

    const hours = Number(value);
    if (!Number.isFinite(hours)) {
      errors.push({ field, message: `${label} must be a finite number of hours.` });
      continue;
    }

    if (hours < minimum || (field === 'outageHours' && hours === 0)) {
      errors.push({
        field,
        message: field === 'outageHours'
          ? 'Outage duration must be greater than 0 hours.'
          : `${label} must be at least 0 hours.`,
      });
      continue;
    }

    const minutes = hours * 60;
    if (!Number.isInteger(minutes)) {
      errors.push({ field, message: `${label} must convert to a whole number of minutes.` });
      continue;
    }

    minutesByField[field] = minutes;
  }

  if (errors.length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    scenario: {
      id: 'scenario-internet-demo',
      name: 'Internet outage demo',
      outageDurationMinutes: minutesByField.outageHours,
      targetServiceIds: ['service-internet'],
      availability: {
        'device-router': minutesByField.routerHours,
        'device-ont': minutesByField.ontHours,
        'provider-isp': minutesByField.providerHours,
      },
    },
  };
}
