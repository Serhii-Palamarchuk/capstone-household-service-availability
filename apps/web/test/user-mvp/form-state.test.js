import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createInitialUserMvpState,
  normalizeUserMvpForm,
} from '../../src/user-mvp/form-state.js';

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
  assert.deepEqual(state, original);
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
  state.devices[0].name = ' ';
  state.devices[0].powerW = '';
  state.devices[1].powerW = 'ten';
  state.backupSources[0].usableCapacityWh = '0';
  state.backupSources[0].maxOutputPowerW = '-1';

  const result = normalizeUserMvpForm(state);

  assert.equal(result.success, false);
  assert.deepEqual(result.errors.map(({ field, code }) => [field, code]), [
    ['devices.0.name', 'REQUIRED_FIELD'],
    ['devices.0.powerW', 'REQUIRED_POSITIVE_NUMBER'],
    ['devices.1.powerW', 'INVALID_POSITIVE_NUMBER'],
    ['backupSources.0.usableCapacityWh', 'INVALID_POSITIVE_NUMBER'],
    ['backupSources.0.maxOutputPowerW', 'INVALID_POSITIVE_NUMBER'],
  ]);
  assert.equal(Object.hasOwn(result, 'model'), false);
  assert.equal(Object.hasOwn(result, 'backupSources'), false);
  assert.equal(Object.hasOwn(result, 'scenario'), false);
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
