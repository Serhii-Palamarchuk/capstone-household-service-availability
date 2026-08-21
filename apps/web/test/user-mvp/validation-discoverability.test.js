import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

import {
  backupSourceDisplayLabels,
  deviceDisplayLabels,
  serviceDisplayLabels,
} from '../../src/user-mvp/entity-labels.js';
import { createInitialUserMvpState } from '../../src/user-mvp/form-state.js';
import { createTranslator } from '../../src/user-mvp/i18n.js';

let BackupStep;
let EquipmentStep;
let ServicesScenarioStep;
let UserScenarioResult;
let executeScenarioSubmission;
let viteServer;

before(async () => {
  viteServer = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  ({ BackupStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/BackupStep.jsx',
  ));
  ({ EquipmentStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/EquipmentStep.jsx',
  ));
  ({ ServicesScenarioStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/ServicesScenarioStep.jsx',
  ));
  ({ UserScenarioResult } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/UserScenarioResult.jsx',
  ));
  ({ executeScenarioSubmission } = await viteServer.ssrLoadModule('/src/App.jsx'));
});

after(async () => {
  await viteServer?.close();
});

const noop = () => {};

function labelMapsFor(formState, t) {
  return {
    backupSourceLabels: backupSourceDisplayLabels(formState.backupSources, t),
    deviceLabels: deviceDisplayLabels(formState.devices, t),
    providerLabels: new Map(formState.externalProviders.map(provider => [
      provider.id,
      provider.name.trim(),
    ])),
    serviceLabels: serviceDisplayLabels(formState.services, t),
  };
}

function articleContaining(html, controlId) {
  const start = html.indexOf(`id="${controlId}"`);
  assert.notEqual(start, -1, `Expected control ${controlId}`);
  const articleStart = html.lastIndexOf('<article', start);
  const end = html.indexOf('</article>', start);
  return html.slice(articleStart, end + '</article>'.length);
}

test('invalid Device field opens and marks only its Details row with linked input errors', () => {
  const formState = createInitialUserMvpState();
  formState.devices[0].powerW = 'ten';
  const submission = executeScenarioSubmission(formState);

  assert.equal(submission.success, false);
  assert.equal(submission.outcome, null);
  assert.equal(submission.submittedInput, null);
  assert.deepEqual(submission.errors.map(error => [error.field, error.code]), [[
    'devices.0.powerW',
    'INVALID_POSITIVE_NUMBER',
  ]]);

  const t = createTranslator('en');
  const html = renderToStaticMarkup(EquipmentStep({
    deviceLabels: deviceDisplayLabels(formState.devices, t),
    devices: formState.devices,
    errors: submission.errors,
    onAdd: noop,
    onChange: noop,
    onNext: noop,
    onRemove: noop,
    t,
  }));
  const routerRow = articleContaining(html, 'device-router-power');
  const ontRow = articleContaining(html, 'device-ont-power');

  assert.match(routerRow, /class="compact-entity-row has-errors"/);
  assert.match(routerRow, /<details[^>]*class="row-details has-errors"[^>]* open=""/);
  assert.match(routerRow, /id="device-router-power"[^>]*aria-invalid="true"/);
  assert.match(routerRow, /aria-describedby="device-router-errors"/);
  assert.match(routerRow, /id="device-router-errors"/);
  assert.match(routerRow, /Enter a value greater than zero\./);
  assert.doesNotMatch(ontRow, /has-errors|open=""|aria-invalid="true"/);
});

test('invalid BackupSource field opens and marks its Details row with linked input errors', () => {
  const formState = createInitialUserMvpState();
  formState.backupSources[0].usableCapacityWh = '0';
  const submission = executeScenarioSubmission(formState);

  assert.equal(submission.success, false);
  assert.equal(submission.outcome, null);
  assert.equal(submission.submittedInput, null);
  assert.deepEqual(submission.errors.map(error => [error.field, error.code]), [[
    'backupSources.0.usableCapacityWh',
    'INVALID_POSITIVE_NUMBER',
  ]]);

  const t = createTranslator('en');
  const html = renderToStaticMarkup(BackupStep({
    assignments: formState.backupAssignmentsByDeviceId,
    backupSourceLabels: backupSourceDisplayLabels(formState.backupSources, t),
    backupSources: formState.backupSources,
    deviceLabels: deviceDisplayLabels(formState.devices, t),
    devices: formState.devices,
    errors: submission.errors,
    onAdd: noop,
    onAssignmentChange: noop,
    onBack: noop,
    onChange: noop,
    onNext: noop,
    onRemove: noop,
    t,
  }));
  const sourceRow = articleContaining(html, 'source-home-capacity');

  assert.match(sourceRow, /class="compact-entity-row has-errors"/);
  assert.match(sourceRow, /<details[^>]*class="row-details has-errors"[^>]* open=""/);
  assert.match(sourceRow, /id="source-home-capacity"[^>]*aria-invalid="true"/);
  assert.match(sourceRow, /aria-describedby="source-home-errors"/);
  assert.match(sourceRow, /id="source-home-errors"/);
  assert.match(sourceRow, /Enter a value greater than zero\./);
});

test('missing-provider runtime error keeps App submission state and identifies the provider in Result and Step 3', () => {
  const formState = createInitialUserMvpState();
  formState.scenario.externalProviderAvailability['provider-internet'] = '';
  const snapshot = structuredClone(formState);

  const submission = executeScenarioSubmission(formState);

  assert.equal(submission.success, false);
  assert.equal(submission.submittedInput.success, true);
  assert.deepEqual(submission.errors, [{
    code: 'MISSING_EXTERNAL_PROVIDER_AVAILABILITY',
    providerId: 'provider-internet',
  }]);
  assert.deepEqual(submission.outcome.errors, submission.errors);
  assert.deepEqual(formState, snapshot);

  const t = createTranslator('en');
  const labels = labelMapsFor(formState, t);
  const failureHtml = renderToStaticMarkup(createElement(UserScenarioResult, {
    ...labels,
    input: submission.submittedInput,
    onBack: noop,
    onQuickRecalculate: noop,
    outcome: submission.outcome,
    t,
  }));
  const servicesHtml = renderToStaticMarkup(ServicesScenarioStep({
    ...labels,
    errors: submission.errors,
    formState,
    onAddProvider: noop,
    onAddService: noop,
    onBack: noop,
    onOutageChange: noop,
    onProviderAvailabilityChange: noop,
    onProviderChange: noop,
    onProviderRemove: noop,
    onRoleBindingChange: noop,
    onScenarioListChange: noop,
    onServiceChange: noop,
    onServiceRemove: noop,
    onSubmit: noop,
    t,
  }));
  const providerRow = articleContaining(servicesHtml, 'provider-internet-availability');

  assert.match(failureHtml, /Enter availability for Internet provider\./);
  assert.match(providerRow, /class="compact-provider-row has-errors"/);
  assert.match(providerRow, /id="provider-internet-availability"[^>]*aria-invalid="true"/);
  assert.match(providerRow, /aria-describedby="provider-internet-errors"/);
  assert.match(providerRow, /Enter availability for Internet provider\./);
});

test('overload runtime error keeps App submission state and identifies the source in Result and Step 2', () => {
  const formState = createInitialUserMvpState();
  formState.backupSources[0].maxOutputPowerW = '79';
  const snapshot = structuredClone(formState);

  const submission = executeScenarioSubmission(formState);

  assert.equal(submission.success, false);
  assert.equal(submission.submittedInput.success, true);
  assert.deepEqual(submission.errors, [{
    code: 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED',
    maxOutputPowerW: 79,
    sourceId: 'source-home',
    totalPowerW: 80,
  }]);
  assert.deepEqual(submission.outcome.errors, submission.errors);
  assert.deepEqual(formState, snapshot);

  const t = createTranslator('uk');
  const labels = labelMapsFor(formState, t);
  const failureHtml = renderToStaticMarkup(createElement(UserScenarioResult, {
    ...labels,
    input: submission.submittedInput,
    onBack: noop,
    onQuickRecalculate: noop,
    outcome: submission.outcome,
    t,
  }));
  const backupHtml = renderToStaticMarkup(BackupStep({
    assignments: formState.backupAssignmentsByDeviceId,
    backupSourceLabels: labels.backupSourceLabels,
    backupSources: formState.backupSources,
    deviceLabels: labels.deviceLabels,
    devices: formState.devices,
    errors: submission.errors,
    onAdd: noop,
    onAssignmentChange: noop,
    onBack: noop,
    onChange: noop,
    onNext: noop,
    onRemove: noop,
    t,
  }));
  const sourceRow = articleContaining(backupHtml, 'source-home-max-output');

  assert.match(failureHtml, /Активне навантаження[^<]*Home backup/);
  assert.match(sourceRow, /class="compact-entity-row has-errors"/);
  assert.match(sourceRow, /<details[^>]*class="row-details has-errors"[^>]* open=""/);
  assert.match(sourceRow, /id="source-home-max-output"[^>]*aria-invalid="true"/);
  assert.match(sourceRow, /aria-describedby="source-home-errors"/);
  assert.match(sourceRow, /Активне навантаження[^<]*Home backup/);
});
