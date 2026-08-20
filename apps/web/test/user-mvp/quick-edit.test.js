import assert from 'node:assert/strict';
import test from 'node:test';

import { applyQuickEdit } from '../../src/user-mvp/quick-edit.js';

function formState() {
  return {
    backupSources: [
      {
        id: 's1',
        name: 'Home backup',
        type: 'PowerStation',
        usableCapacityWh: '480',
        maxOutputPowerW: '',
      },
      {
        id: 's2',
        name: 'Office UPS',
        type: 'UPS',
        usableCapacityWh: '240',
        maxOutputPowerW: '300',
      },
    ],
    scenario: { outageDurationMinutes: '480', targetServiceIds: ['service-work'] },
    devices: [{ id: 'device-router', powerW: '10' }],
  };
}

test('backup quick edit touches only the selected source and allowed source fields', () => {
  const state = formState();
  const next = applyQuickEdit(state, {
    sourceId: 's1',
    usableCapacityWh: '960',
    maxOutputPowerW: '1000',
  });

  assert.equal(next.backupSources[0].usableCapacityWh, '960');
  assert.equal(next.backupSources[0].maxOutputPowerW, '1000');
  assert.equal(next.backupSources[0].name, 'Home backup');
  assert.equal(next.backupSources[0].type, 'PowerStation');
  assert.equal(state.backupSources[0].usableCapacityWh, '480');
  assert.equal(state.backupSources[0].maxOutputPowerW, '');

  assert.notEqual(next, state);
  assert.notEqual(next.backupSources, state.backupSources);
  assert.notEqual(next.backupSources[0], state.backupSources[0]);
  assert.equal(next.backupSources[1], state.backupSources[1]);
  assert.equal(next.scenario, state.scenario);
  assert.equal(next.devices, state.devices);
});

test('outage quick edit changes outage only and does not require a source id', () => {
  const state = formState();
  const next = applyQuickEdit(state, { outageDurationMinutes: '600' });

  assert.equal(next.scenario.outageDurationMinutes, '600');
  assert.deepEqual(next.scenario.targetServiceIds, ['service-work']);
  assert.equal(state.scenario.outageDurationMinutes, '480');

  assert.notEqual(next, state);
  assert.notEqual(next.scenario, state.scenario);
  assert.equal(next.backupSources, state.backupSources);
  assert.equal(next.devices, state.devices);
});

test('combined quick edit clones both touched containers and preserves the input', () => {
  const state = formState();
  const snapshot = structuredClone(state);
  const next = applyQuickEdit(state, {
    sourceId: 's2',
    usableCapacityWh: '720',
    outageDurationMinutes: '900',
  });

  assert.equal(next.backupSources[1].usableCapacityWh, '720');
  assert.equal(next.backupSources[1].maxOutputPowerW, '300');
  assert.equal(next.scenario.outageDurationMinutes, '900');
  assert.deepEqual(state, snapshot);
  assert.notEqual(next.backupSources, state.backupSources);
  assert.notEqual(next.scenario, state.scenario);
});

test('unknown patch keys are rejected without changing the input', () => {
  const state = formState();
  const snapshot = structuredClone(state);

  assert.throws(
    () => applyQuickEdit(state, { sourceId: 's1', type: 'UPS' }),
    TypeError,
  );
  assert.deepEqual(state, snapshot);
});

test('source fields require an existing source id', () => {
  const state = formState();

  assert.throws(
    () => applyQuickEdit(state, { usableCapacityWh: '960' }),
    TypeError,
  );
  assert.throws(
    () => applyQuickEdit(state, { sourceId: 'missing', maxOutputPowerW: '1000' }),
    TypeError,
  );
});
