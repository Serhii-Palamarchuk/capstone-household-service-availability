import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialUserMvpState,
  getRoleBindingOptions,
  normalizeUserMvpForm,
} from '../../src/user-mvp/form-state.js';
import { getServiceTemplate } from '../../src/user-mvp/service-templates.js';

test('AC-12 fixture normalizes equipment numbers while preserving stable ids', () => {
  const state = createInitialUserMvpState();
  const original = structuredClone(state);

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, true);
  assert.deepEqual(result.model.devices, [
    {
      id: 'device-router',
      name: 'Router',
      category: 'Router',
      powerW: 10,
    },
    {
      id: 'device-ont',
      name: 'ONT/ONU',
      category: 'ONT/ONU',
      powerW: 10,
    },
    {
      id: 'device-laptop',
      name: 'Laptop',
      category: 'Laptop/Desktop',
      powerW: 60,
      internalBattery: { usableCapacityWh: 120 },
    },
  ]);
  assert.deepEqual(
    result.model.devices.map(({ id }) => id),
    state.devices.map(({ id }) => id),
  );
  assert.ok(result.model.devices.every(device => !Object.hasOwn(device, 'availabilityMinutes')));
  assert.equal(Object.hasOwn(result.backupSources[0], 'maxOutputPowerW'), false);
  assert.deepEqual(state, original);
});

test('AC-12 form creates template services and converts the complete scenario', () => {
  const state = createInitialUserMvpState();

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, true);
  assert.deepEqual(result.model.externalProviders, [
    { id: 'provider-internet', name: 'Internet provider' },
  ]);
  assert.deepEqual(result.model.services, [
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
      dependencyIds: ['device-router', 'device-ont', 'provider-internet'],
    },
    {
      id: 'service-remote-work',
      name: 'Remote Work',
      templateId: 'RemoteWork',
      dependencyBindings: {
        internetService: ['service-internet-home'],
        workDevices: ['device-laptop'],
      },
      dependencyIds: ['service-internet-home', 'device-laptop'],
    },
  ]);
  assert.deepEqual(result.scenario, {
    outageDurationMinutes: 480,
    targetServiceIds: ['service-remote-work'],
    backupAssignments: [
      { deviceId: 'device-router', backupSourceId: 'source-home' },
      { deviceId: 'device-ont', backupSourceId: 'source-home' },
      { deviceId: 'device-laptop', backupSourceId: 'source-home' },
    ],
    additionalActiveDeviceIds: [],
    externalProviderAvailability: { 'provider-internet': 600 },
    powerStrategy: 'ExternalFirst',
  });
});

test('multiple service instances reuse one shared Internet id and preserve scenario selections', () => {
  const state = createInitialUserMvpState();
  state.devices.push({
    id: 'device-tv',
    name: 'TV',
    category: 'Other Load',
    powerW: '70',
    internalBatteryWh: '',
  });
  state.services.push({
    id: 'service-remote-work-b',
    name: 'Remote Work — B',
    templateId: 'RemoteWork',
    variantId: '',
    dependencyBindings: {
      internetService: ['service-internet-home'],
      workDevices: ['device-laptop'],
    },
  });
  state.scenario.targetServiceIds = ['service-remote-work', 'service-remote-work-b'];
  state.scenario.additionalActiveDeviceIds = ['device-tv'];
  state.scenario.outageDurationMinutes = '720';
  state.scenario.externalProviderAvailability['provider-internet'] = '900';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, true);
  assert.deepEqual(
    result.model.services.slice(1).map(service => service.dependencyIds),
    [
      ['service-internet-home', 'device-laptop'],
      ['service-internet-home', 'device-laptop'],
    ],
  );
  assert.deepEqual(result.scenario.targetServiceIds, [
    'service-remote-work',
    'service-remote-work-b',
  ]);
  assert.deepEqual(result.scenario.additionalActiveDeviceIds, ['device-tv']);
  assert.equal(result.scenario.outageDurationMinutes, 720);
  assert.deepEqual(result.scenario.externalProviderAvailability, {
    'provider-internet': 900,
  });
});

test('role options use template entity type and allowed Device categories', () => {
  const state = createInitialUserMvpState();
  state.devices.push({
    id: 'device-monitor',
    name: 'Monitor',
    category: 'Monitor',
    powerW: '20',
    internalBatteryWh: '',
  });
  const internet = getServiceTemplate('Internet', 'Fiber');
  const remoteWork = getServiceTemplate('RemoteWork');

  assert.deepEqual(
    getRoleBindingOptions(internet.roles[0], state, 1).map(({ id }) => id),
    ['device-router'],
  );
  assert.deepEqual(
    getRoleBindingOptions(remoteWork.roles[0], state, 1).map(({ id }) => id),
    ['service-internet-home'],
  );
  assert.deepEqual(
    getRoleBindingOptions(remoteWork.roles[1], state, 1).map(({ id }) => id),
    ['device-laptop', 'device-monitor'],
  );
  assert.deepEqual(
    getRoleBindingOptions(internet.roles[2], state, 1).map(({ id }) => id),
    ['provider-internet'],
  );
});

test('Remote Work Internet role options keep Internet and exclude Refrigeration services', () => {
  // Mutation caught: removing allowed service-template filtering exposes Refrigeration in the UI.
  const state = createInitialUserMvpState();
  state.devices.push({
    id: 'device-refrigerator',
    name: 'Refrigerator',
    category: 'Refrigerator',
    powerW: '100',
    internalBatteryWh: '',
  });
  state.services.splice(1, 0, {
    id: 'service-refrigeration',
    name: 'Refrigeration',
    templateId: 'Refrigeration',
    variantId: '',
    dependencyBindings: { coolingDevices: ['device-refrigerator'] },
  });
  const internetRole = getServiceTemplate('RemoteWork').roles[0];

  assert.deepEqual(
    getRoleBindingOptions(internetRole, state, 2).map(({ id }) => id),
    ['service-internet-home'],
  );
});

test('form normalization rejects Refrigeration bound as Remote Work Internet', () => {
  const state = createInitialUserMvpState();
  state.devices.push({
    id: 'device-refrigerator',
    name: 'Refrigerator',
    category: 'Refrigerator',
    powerW: '100',
    internalBatteryWh: '',
  });
  state.services.splice(1, 0, {
    id: 'service-refrigeration',
    name: 'Refrigeration',
    templateId: 'Refrigeration',
    variantId: '',
    dependencyBindings: { coolingDevices: ['device-refrigerator'] },
  });
  state.services[2].dependencyBindings.internetService = ['service-refrigeration'];

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors, [{
    code: 'TEMPLATE_ROLE_TEMPLATE',
    field: 'services.2.dependencyBindings.internetService',
    message: 'Choose dependencies allowed by this service role.',
  }]);
  assert.equal(Object.hasOwn(result, 'model'), false);
  assert.equal(Object.hasOwn(result, 'scenario'), false);
});

test('invalid service bindings return builder errors without a partial domain payload', () => {
  const state = createInitialUserMvpState();
  state.services[0].dependencyBindings.router = ['device-laptop'];

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors, [{
    code: 'TEMPLATE_ROLE_CATEGORY',
    field: 'services.0.dependencyBindings.router',
    message: 'Choose dependencies allowed by this service role.',
  }]);
  assert.equal(Object.hasOwn(result, 'model'), false);
  assert.equal(Object.hasOwn(result, 'scenario'), false);
});

test('outage and entered provider availability must be whole minutes', () => {
  const state = createInitialUserMvpState();
  state.scenario.outageDurationMinutes = '1.5';
  state.scenario.externalProviderAvailability['provider-internet'] = '-1';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors.map(({ field, code }) => [field, code]), [
    ['scenario.outageDurationMinutes', 'INVALID_POSITIVE_INTEGER'],
    [
      'scenario.externalProviderAvailability.provider-internet',
      'INVALID_NON_NEGATIVE_INTEGER',
    ],
  ]);
});

test('blank optional energy fields are omitted and entered values become numbers', () => {
  const state = createInitialUserMvpState();
  state.devices[0].internalBatteryWh = '  ';
  state.devices[1].internalBatteryWh = '25.5';
  state.backupSources[0].maxOutputPowerW = '100';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, true);
  assert.equal(Object.hasOwn(result.model.devices[0], 'internalBattery'), false);
  assert.deepEqual(result.model.devices[1].internalBattery, { usableCapacityWh: 25.5 });
  assert.deepEqual(result.backupSources, [{
    id: 'source-home',
    name: 'Home backup',
    type: 'PowerStation',
    usableCapacityWh: 480,
    maxOutputPowerW: 100,
  }]);
});

test('one optional source selection per Device serializes into scenario assignments', () => {
  const state = createInitialUserMvpState();
  state.backupAssignmentsByDeviceId['device-ont'] = '';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, true);
  assert.deepEqual(result.scenario.backupAssignments, [
    { deviceId: 'device-router', backupSourceId: 'source-home' },
    { deviceId: 'device-laptop', backupSourceId: 'source-home' },
  ]);
  assert.equal(result.scenario.powerStrategy, 'ExternalFirst');
});

test('blank and invalid required values return UI errors without a domain payload', () => {
  const state = createInitialUserMvpState();
  state.devices[0].powerW = '';
  state.devices[1].powerW = 'ten';
  state.backupSources[0].usableCapacityWh = '0';
  state.backupSources[0].maxOutputPowerW = '-1';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors.map(({ field, code }) => [field, code]), [
    ['devices.0.powerW', 'REQUIRED_POSITIVE_NUMBER'],
    ['devices.1.powerW', 'INVALID_POSITIVE_NUMBER'],
    ['backupSources.0.usableCapacityWh', 'INVALID_POSITIVE_NUMBER'],
    ['backupSources.0.maxOutputPowerW', 'INVALID_POSITIVE_NUMBER'],
  ]);
  assert.equal(Object.hasOwn(result, 'model'), false);
  assert.equal(Object.hasOwn(result, 'backupSources'), false);
  assert.equal(Object.hasOwn(result, 'scenario'), false);
});

test('blank Device, BackupSource, and Service names receive deterministic domain fallbacks', () => {
  const state = createInitialUserMvpState();
  state.devices[0].name = ' ';
  state.backupSources[0].name = '';
  state.services[0].name = '  ';
  state.services[1].name = '';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, true);
  assert.equal(result.model.devices[0].name, 'Router · 10 W');
  assert.equal(result.backupSources[0].name, 'Power station · 480 Wh');
  assert.equal(result.model.services[0].name, 'Internet · Fiber');
  assert.equal(result.model.services[1].name, 'RemoteWork');
});

test('blank ExternalProvider name remains required', () => {
  const state = createInitialUserMvpState();
  state.externalProviders[0].name = ' ';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors, [{
    code: 'REQUIRED_FIELD',
    field: 'externalProviders.0.name',
    message: 'External provider name is required.',
  }]);
});

test('an assignment to an unknown source is rejected at the form boundary', () => {
  const state = createInitialUserMvpState();
  state.backupAssignmentsByDeviceId['device-router'] = 'source-missing';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors, [{
    code: 'BACKUP_ASSIGNMENT_SOURCE_NOT_FOUND',
    field: 'backupAssignmentsByDeviceId.device-router',
    message: 'Choose an available backup source.',
  }]);
});
