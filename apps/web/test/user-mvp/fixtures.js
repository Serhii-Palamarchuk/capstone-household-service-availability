import { DeviceCategory } from '../../src/user-mvp/constants.js';

export function templateContext() {
  return {
    services: [
      { id: 'service-internet-home', name: 'Internet — Home' },
    ],
    devices: [
      { id: 'device-router', name: 'Router', category: DeviceCategory.ROUTER },
      { id: 'device-modem', name: 'Modem', category: DeviceCategory.MODEM },
      { id: 'device-ont', name: 'ONT/ONU', category: DeviceCategory.ONT_ONU },
      { id: 'device-laptop', name: 'Laptop', category: DeviceCategory.LAPTOP_DESKTOP },
      { id: 'device-monitor-1', name: 'Monitor 1', category: DeviceCategory.MONITOR },
      { id: 'device-monitor-2', name: 'Monitor 2', category: DeviceCategory.MONITOR },
      { id: 'device-refrigerator', name: 'Refrigerator', category: DeviceCategory.REFRIGERATOR },
      { id: 'device-freezer', name: 'Freezer', category: DeviceCategory.FREEZER },
      { id: 'device-gas-boiler', name: 'Gas boiler', category: DeviceCategory.GAS_BOILER },
      { id: 'device-electric-boiler', name: 'Electric boiler', category: DeviceCategory.ELECTRIC_HEATER_BOILER },
      { id: 'device-heat-pump', name: 'Heat pump', category: DeviceCategory.HEAT_PUMP },
      { id: 'device-water-pump', name: 'Water pump', category: DeviceCategory.WATER_PUMP },
    ],
    externalProviders: [
      { id: 'provider-internet', name: 'Internet provider' },
      { id: 'provider-gas', name: 'Gas supply' },
      { id: 'provider-heating', name: 'Centralized heating' },
      { id: 'provider-water', name: 'Water provider' },
    ],
  };
}

export function remoteWorkInput(overrides = {}) {
  return {
    id: 'service-remote-work-a',
    name: 'Remote Work — A',
    templateId: 'RemoteWork',
    dependencyBindings: {
      internetService: ['service-internet-home'],
      workDevices: ['device-laptop', 'device-monitor-1', 'device-monitor-2'],
    },
    ...overrides,
  };
}

export function remoteWorkWithRefrigerator() {
  return remoteWorkInput({
    dependencyBindings: {
      internetService: ['service-internet-home'],
      workDevices: ['device-refrigerator'],
    },
  });
}

export function validCatalogInputs() {
  return [
    {
      id: 'service-internet-fiber',
      templateId: 'Internet',
      variantId: 'Fiber',
      dependencyBindings: {
        router: ['device-router'],
        ontOnu: ['device-ont'],
        provider: ['provider-internet'],
      },
    },
    {
      id: 'service-internet-router',
      templateId: 'Internet',
      variantId: 'RouterOnly',
      dependencyBindings: {
        routerOrModem: ['device-modem'],
        provider: ['provider-internet'],
      },
    },
    remoteWorkInput({ id: 'service-remote-work' }),
    {
      id: 'service-refrigeration',
      templateId: 'Refrigeration',
      dependencyBindings: { coolingDevices: ['device-refrigerator', 'device-freezer'] },
    },
    {
      id: 'service-heating-gas',
      templateId: 'Heating',
      variantId: 'GasBoiler',
      dependencyBindings: { heatingUnit: ['device-gas-boiler'], gasSupply: ['provider-gas'] },
    },
    {
      id: 'service-heating-electric',
      templateId: 'Heating',
      variantId: 'Electric',
      dependencyBindings: { heatingDevices: ['device-electric-boiler', 'device-heat-pump'] },
    },
    {
      id: 'service-heating-centralized',
      templateId: 'Heating',
      variantId: 'Centralized',
      dependencyBindings: { heatingProvider: ['provider-heating'] },
    },
    {
      id: 'service-water-centralized',
      templateId: 'WaterSupply',
      variantId: 'Centralized',
      dependencyBindings: { waterProvider: ['provider-water'] },
    },
    {
      id: 'service-water-well',
      templateId: 'WaterSupply',
      variantId: 'PrivateWell',
      dependencyBindings: { waterPump: ['device-water-pump'] },
    },
    {
      id: 'service-water-pumped',
      templateId: 'WaterSupply',
      variantId: 'PumpedSystem',
      dependencyBindings: { waterProvider: ['provider-water'], waterPump: ['device-water-pump'] },
    },
  ];
}
