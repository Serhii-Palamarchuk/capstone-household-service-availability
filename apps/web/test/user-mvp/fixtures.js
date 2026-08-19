import { DeviceCategory } from '../../src/user-mvp/constants.js';
import { createServiceInstance } from '../../src/user-mvp/service-builder.js';

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

function serviceModel(devices, externalProviders = [], dependencyIds = devices.map((device) => device.id)) {
  return {
    services: [{
      id: 'service-target',
      name: 'Target service',
      dependencyIds,
    }],
    devices,
    externalProviders,
  };
}

function source(id, usableCapacityWh, maxOutputPowerW) {
  return {
    id,
    name: id,
    type: 'Power station',
    usableCapacityWh,
    ...(maxOutputPowerW === undefined ? {} : { maxOutputPowerW }),
  };
}

function scenario(overrides = {}) {
  return {
    targetServiceIds: ['service-target'],
    backupAssignments: [],
    additionalActiveDeviceIds: [],
    externalProviderAvailability: {},
    ...overrides,
  };
}

export function singleDeviceFixture({ wh, watts }) {
  const device = { id: 'device-1', name: 'Device 1', powerW: watts };

  return {
    model: serviceModel([device]),
    backupSources: [source('source-1', wh, 100)],
    scenario: scenario({
      backupAssignments: [{ deviceId: 'device-1', backupSourceId: 'source-1' }],
    }),
  };
}

export function sharedSourceFixture() {
  const devices = [
    { id: 'device-router', name: 'Router', powerW: 20 },
    { id: 'device-ont', name: 'ONT', powerW: 10 },
    { id: 'device-laptop', name: 'Laptop', powerW: 70 },
  ];

  return {
    model: serviceModel(devices),
    backupSources: [source('source-1', 600, 150)],
    scenario: scenario({
      backupAssignments: devices.map((device) => ({ deviceId: device.id, backupSourceId: 'source-1' })),
    }),
  };
}

export function internalOnlyFixture() {
  const device = {
    id: 'device-laptop',
    name: 'Laptop',
    powerW: 60,
    internalBattery: { usableCapacityWh: 120 },
  };

  return {
    model: serviceModel([device]),
    backupSources: [],
    scenario: scenario(),
  };
}

export function externalPlusInternalFixture() {
  const input = internalOnlyFixture();

  return {
    ...input,
    backupSources: [source('source-1', 300, 100)],
    scenario: scenario({
      backupAssignments: [{ deviceId: 'device-laptop', backupSourceId: 'source-1' }],
    }),
  };
}

export function noBackupFixture() {
  return {
    model: serviceModel([{ id: 'device-1', name: 'Device 1', powerW: 10 }]),
    backupSources: [],
    scenario: scenario(),
  };
}

export function providerFixture(overrides = {}) {
  const provider = { id: 'provider-isp', name: 'Internet provider' };

  return {
    model: serviceModel([], [provider], [provider.id]),
    backupSources: [],
    scenario: scenario({
      externalProviderAvailability: { [provider.id]: 600 },
      ...overrides,
    }),
  };
}

function buildService(input, context) {
  const result = createServiceInstance(input, context);

  if (!result.success) {
    throw new Error(`Invalid integration fixture: ${JSON.stringify(result.errors)}`);
  }

  return result.service;
}

function internetService(devices, externalProviders) {
  return buildService({
    id: 'service-internet-home',
    name: 'Internet — Home',
    templateId: 'Internet',
    variantId: 'Fiber',
    dependencyBindings: {
      router: ['device-router'],
      ontOnu: ['device-ont'],
      provider: ['provider-internet'],
    },
  }, { services: [], devices, externalProviders });
}

export function additionalLoadInternetFixture(includeTv = false) {
  const devices = [
    { id: 'device-router', name: 'Router', category: DeviceCategory.ROUTER, powerW: 20 },
    { id: 'device-ont', name: 'ONT/ONU', category: DeviceCategory.ONT_ONU, powerW: 10 },
    { id: 'device-tv', name: 'TV', category: DeviceCategory.OTHER_LOAD, powerW: 70 },
  ];
  const externalProviders = [{ id: 'provider-internet', name: 'Internet provider' }];

  return {
    model: {
      services: [internetService(devices, externalProviders)],
      devices,
      externalProviders,
    },
    backupSources: [source('source-home', 600, 150)],
    scenario: {
      outageDurationMinutes: 600,
      targetServiceIds: ['service-internet-home'],
      backupAssignments: devices.map((device) => ({
        deviceId: device.id,
        backupSourceId: 'source-home',
      })),
      additionalActiveDeviceIds: includeTv ? ['device-tv'] : [],
      externalProviderAvailability: { 'provider-internet': 2000 },
    },
  };
}

export function sharedInternetRemoteWorkFixture() {
  const devices = [
    { id: 'device-router', name: 'Router', category: DeviceCategory.ROUTER, powerW: 20 },
    { id: 'device-ont', name: 'ONT/ONU', category: DeviceCategory.ONT_ONU, powerW: 10 },
    {
      id: 'device-laptop-a',
      name: 'Laptop A',
      category: DeviceCategory.LAPTOP_DESKTOP,
      powerW: 60,
      internalBattery: { usableCapacityWh: 2400 },
    },
    {
      id: 'device-laptop-b',
      name: 'Laptop B',
      category: DeviceCategory.LAPTOP_DESKTOP,
      powerW: 60,
      internalBattery: { usableCapacityWh: 2400 },
    },
  ];
  const externalProviders = [{ id: 'provider-internet', name: 'Internet provider' }];
  const internet = internetService(devices, externalProviders);
  const serviceContext = { services: [internet], devices, externalProviders };
  const remoteWorkA = buildService({
    id: 'service-remote-work-a',
    name: 'Remote Work — A',
    templateId: 'RemoteWork',
    dependencyBindings: {
      internetService: [internet.id],
      workDevices: ['device-laptop-a'],
    },
  }, serviceContext);
  const remoteWorkB = buildService({
    id: 'service-remote-work-b',
    name: 'Remote Work — B',
    templateId: 'RemoteWork',
    dependencyBindings: {
      internetService: [internet.id],
      workDevices: ['device-laptop-b'],
    },
  }, serviceContext);

  return {
    model: {
      services: [internet, remoteWorkA, remoteWorkB],
      devices,
      externalProviders,
    },
    backupSources: [source('source-home', 600, 100)],
    scenario: {
      outageDurationMinutes: 1440,
      targetServiceIds: [remoteWorkA.id, remoteWorkB.id],
      backupAssignments: [
        { deviceId: 'device-router', backupSourceId: 'source-home' },
        { deviceId: 'device-ont', backupSourceId: 'source-home' },
      ],
      additionalActiveDeviceIds: [],
      externalProviderAvailability: { 'provider-internet': 2000 },
    },
  };
}

export function endToEndRemoteWorkFixture() {
  const devices = [
    { id: 'device-router', name: 'Router', category: DeviceCategory.ROUTER, powerW: 10 },
    { id: 'device-ont', name: 'ONT/ONU', category: DeviceCategory.ONT_ONU, powerW: 10 },
    {
      id: 'device-laptop',
      name: 'Laptop',
      category: DeviceCategory.LAPTOP_DESKTOP,
      powerW: 60,
      internalBattery: { usableCapacityWh: 120 },
    },
  ];
  const externalProviders = [{ id: 'provider-internet', name: 'Internet provider' }];
  const internet = internetService(devices, externalProviders);
  const remoteWork = buildService({
    id: 'service-remote-work',
    name: 'Remote Work',
    templateId: 'RemoteWork',
    dependencyBindings: {
      internetService: [internet.id],
      workDevices: ['device-laptop'],
    },
  }, { services: [internet], devices, externalProviders });

  return {
    model: {
      services: [internet, remoteWork],
      devices,
      externalProviders,
    },
    backupSources: [source('source-home', 480, 100)],
    scenario: {
      outageDurationMinutes: 480,
      targetServiceIds: [remoteWork.id],
      backupAssignments: devices.map((device) => ({
        deviceId: device.id,
        backupSourceId: 'source-home',
      })),
      additionalActiveDeviceIds: [],
      externalProviderAvailability: { 'provider-internet': 600 },
    },
  };
}
