export function createInternetModel() {
  return {
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
}

export function createInternetScenario() {
  return {
    id: 'scenario-1',
    name: '6-hour outage',
    outageDurationMinutes: 360,
    targetServiceIds: ['service-internet'],
    availability: {
      'device-router': 480,
      'device-ont': 120,
      'provider-isp': 4320,
    },
  };
}
