import assert from 'node:assert/strict';
import test from 'node:test';

import { estimateAvailability } from '../../src/user-mvp/availability-estimator.js';
import {
  externalPlusInternalFixture,
  internalOnlyFixture,
  noBackupFixture,
  providerFixture,
  sharedSourceFixture,
  singleDeviceFixture,
} from './fixtures.js';

test('AC-01: floors runtime to integer minutes', () => {
  const result = estimateAvailability(singleDeviceFixture({ wh: 100, watts: 33 }));

  assert.equal(result.success, true);
  assert.equal(result.availability['device-1'], 181);
  assert.deepEqual(result.sourceResults, [{
    sourceId: 'source-1',
    totalPowerW: 33,
    runtimeMinutes: 181,
  }]);
});

test('AC-02: shared source gives every assigned active device its shared runtime', () => {
  const result = estimateAvailability(sharedSourceFixture());

  assert.equal(result.success, true);
  assert.equal(result.sourceResults[0].totalPowerW, 100);
  assert.equal(result.sourceResults[0].runtimeMinutes, 360);
  assert.equal(result.availability['device-router'], 360);
  assert.equal(result.availability['device-ont'], 360);
  assert.equal(result.availability['device-laptop'], 360);
});

test('AC-03: internal battery alone supplies its device runtime', () => {
  const result = estimateAvailability(internalOnlyFixture());

  assert.equal(result.success, true);
  assert.equal(result.availability['device-laptop'], 120);
  assert.deepEqual(result.deviceResults, [{
    deviceId: 'device-laptop',
    externalRuntimeMinutes: 0,
    internalRuntimeMinutes: 120,
    availabilityMinutes: 120,
  }]);
});

test('AC-04: ExternalFirst adds internal runtime after source runtime', () => {
  const result = estimateAvailability(externalPlusInternalFixture());

  assert.equal(result.success, true);
  assert.equal(result.availability['device-laptop'], 420);
  assert.deepEqual(result.deviceResults, [{
    deviceId: 'device-laptop',
    externalRuntimeMinutes: 300,
    internalRuntimeMinutes: 120,
    availabilityMinutes: 420,
  }]);
});

test('AC-05: required device without external or internal backup has zero availability', () => {
  const result = estimateAvailability(noBackupFixture());

  assert.equal(result.success, true);
  assert.equal(result.availability['device-1'], 0);
});

test('AC-06: invalid device power and source capacity stop estimation', () => {
  const invalidPower = singleDeviceFixture({ wh: 100, watts: 0 });
  const invalidCapacity = singleDeviceFixture({ wh: 0, watts: 10 });

  assert.deepEqual(estimateAvailability(invalidPower), {
    success: false,
    errors: [{ code: 'INVALID_DEVICE_POWER', deviceId: 'device-1' }],
  });
  assert.deepEqual(estimateAvailability(invalidCapacity), {
    success: false,
    errors: [{ code: 'INVALID_BACKUP_SOURCE_CAPACITY', sourceId: 'source-1' }],
  });
});

test('AC-06: duplicate external assignment is rejected before source normalization', () => {
  const input = singleDeviceFixture({ wh: 100, watts: 10 });
  input.scenario.backupAssignments.push({ deviceId: 'device-1', backupSourceId: 'source-1' });

  assert.deepEqual(estimateAvailability(input), {
    success: false,
    errors: [{ code: 'DUPLICATE_BACKUP_ASSIGNMENT', deviceId: 'device-1' }],
  });
});

test('AC-06: source load above known max output is rejected', () => {
  const input = sharedSourceFixture();
  input.backupSources[0].maxOutputPowerW = 99;

  assert.deepEqual(estimateAvailability(input), {
    success: false,
    errors: [{
      code: 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED',
      sourceId: 'source-1',
      totalPowerW: 100,
      maxOutputPowerW: 99,
    }],
  });
});

test('AC-06: used source without max output emits a warning but estimates runtime', () => {
  const input = singleDeviceFixture({ wh: 100, watts: 20 });
  delete input.backupSources[0].maxOutputPowerW;

  const result = estimateAvailability(input);

  assert.equal(result.success, true);
  assert.equal(result.availability['device-1'], 300);
  assert.deepEqual(result.warnings, [{
    code: 'MISSING_BACKUP_SOURCE_MAX_OUTPUT',
    sourceId: 'source-1',
  }]);
});

test('AC-11: required provider availability is copied and missing availability is rejected', () => {
  const valid = estimateAvailability(providerFixture());
  const missing = estimateAvailability(providerFixture({ externalProviderAvailability: {} }));

  assert.equal(valid.success, true);
  assert.equal(valid.availability['provider-isp'], 600);
  assert.deepEqual(missing, {
    success: false,
    errors: [{ code: 'MISSING_EXTERNAL_PROVIDER_AVAILABILITY', providerId: 'provider-isp' }],
  });
});

test('missing provider availability and known source overload are reported together in phase order', () => {
  const input = sharedSourceFixture();
  input.model.externalProviders = [{ id: 'provider-isp', name: 'Internet provider' }];
  input.model.services[0].dependencyIds.push('provider-isp');
  input.scenario.externalProviderAvailability = {};
  input.backupSources[0].maxOutputPowerW = 99;

  assert.deepEqual(estimateAvailability(input), {
    success: false,
    errors: [
      { code: 'MISSING_EXTERNAL_PROVIDER_AVAILABILITY', providerId: 'provider-isp' },
      {
        code: 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED',
        sourceId: 'source-1',
        totalPowerW: 100,
        maxOutputPowerW: 99,
      },
    ],
  });
});
