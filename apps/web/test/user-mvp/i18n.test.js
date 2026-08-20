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
import {
  createInitialUserMvpState,
  normalizeUserMvpForm,
} from '../../src/user-mvp/form-state.js';
import {
  SUPPORTED_LANGUAGES,
  createTranslator,
  translateRecommendation,
  translateStatus,
  translateValidationError,
  translateWarning,
} from '../../src/user-mvp/i18n.js';
import { runUserScenario } from '../../src/user-mvp/run-user-scenario.js';

let App;
let BackupStep;
let EquipmentStep;
let ServicesScenarioStep;
let UserScenarioResult;
let viteServer;

before(async () => {
  viteServer = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  ({ App } = await viteServer.ssrLoadModule('/src/App.jsx'));
  ({ EquipmentStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/EquipmentStep.jsx',
  ));
  ({ BackupStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/BackupStep.jsx',
  ));
  ({ ServicesScenarioStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/ServicesScenarioStep.jsx',
  ));
  ({ UserScenarioResult } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/UserScenarioResult.jsx',
  ));
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

test('English and Ukrainian UI strings resolve', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.deepEqual(SUPPORTED_LANGUAGES, ['en', 'uk']);
  assert.equal(en('actions.continue'), 'Continue');
  assert.equal(uk('actions.continue'), 'Продовжити');
  assert.equal(translateStatus('Limited', en), 'Limited');
  assert.equal(translateStatus('Limited', uk), 'Обмежено');
  assert.equal(createTranslator('unsupported')('actions.back'), 'Back');
  assert.equal(uk('missing.key', { fallback: 'Fallback' }), 'Fallback');
});

test('visible navigation, role, result, and unit copy resolves in both languages', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.equal(en('language.label'), 'Interface language');
  assert.equal(uk('language.label'), 'Мова інтерфейсу');
  assert.equal(en('actions.cancel'), 'Cancel');
  assert.equal(uk('actions.cancel'), 'Скасувати');
  assert.equal(en('actions.editOutage'), 'Edit outage');
  assert.equal(uk('actions.editOutage'), 'Змінити відключення');
  assert.equal(en('result.quickEdit'), 'Quick edit');
  assert.equal(uk('result.quickEdit'), 'Швидке редагування');
  assert.equal(
    en('result.editBackupSource', { source: 'Home backup' }),
    'Edit backup source: Home backup',
  );
  assert.equal(
    uk('result.editBackupSource', { source: 'Домашній резерв' }),
    'Змінити резервне джерело: Домашній резерв',
  );
  assert.equal(en('role.router'), 'Router');
  assert.equal(uk('role.router'), 'Маршрутизатор');
  assert.equal(en('entityType.ExternalProvider'), 'External provider');
  assert.equal(uk('entityType.ExternalProvider'), 'Зовнішній постачальник');
  assert.equal(en('unit.watts', { value: 15 }), '15 W');
  assert.equal(uk('unit.watts', { value: 15 }), '15 Вт');
  assert.equal(en('unit.wattHours', { value: 120 }), '120 Wh');
  assert.equal(uk('unit.wattHours', { value: 120 }), '120 Вт·год');
  assert.equal(en('duration.minutesHours', { minutes: 90, hours: 1.5 }), '90 min (1.5 h)');
  assert.equal(uk('duration.minutesHours', { minutes: 90, hours: 1.5 }), '90 хв (1.5 год)');
});

test('current form and result copy has English and Ukrainian translations', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.equal(en('formErrors.heading'), 'Correct the scenario before running it');
  assert.equal(uk('formErrors.heading'), 'Виправте сценарій перед запуском');
  assert.equal(en('formErrors.fallback'), 'Check this value.');
  assert.equal(uk('formErrors.fallback'), 'Перевірте це значення.');
  assert.equal(en('result.failureTitle'), 'Scenario could not run');
  assert.equal(uk('result.failureTitle'), 'Сценарій не вдалося запустити');
  assert.equal(
    en('result.failureDescription'),
    'Correct these errors and run the scenario again. No partial result is shown.',
  );
  assert.equal(
    uk('result.failureDescription'),
    'Виправте ці помилки й запустіть сценарій ще раз. Частковий результат не показано.',
  );
  assert.equal(en('result.errorFallback'), 'Review the scenario input.');
  assert.equal(uk('result.errorFallback'), 'Перевірте введені дані сценарію.');
  assert.equal(en('result.heading'), 'Availability result');
  assert.equal(uk('result.heading'), 'Результат доступності');
  assert.equal(en('result.availability'), 'Availability:');
  assert.equal(uk('result.availability'), 'Доступність:');
  assert.equal(uk('result.needsRecalculation'), 'Результат потребує перерахунку.');
  assert.equal(en('role.oneOrMore'), 'one or more');
  assert.equal(uk('role.oneOrMore'), 'один або більше');
});

test('category, backup type, and service template identifiers have distinct Ukrainian labels', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');

  assert.equal(en('category.Router'), 'Router');
  assert.equal(uk('category.Router'), 'Маршрутизатор');
  assert.notEqual(uk('category.Router'), en('category.Router'));
  assert.equal(en('backupType.PowerStation'), 'Power station');
  assert.equal(uk('backupType.PowerStation'), 'Портативна електростанція');
  assert.notEqual(uk('backupType.PowerStation'), en('backupType.PowerStation'));
  assert.equal(en('template.RemoteWork'), 'Remote Work');
  assert.equal(uk('template.RemoteWork'), 'Віддалена робота');
  assert.notEqual(uk('template.RemoteWork'), en('template.RemoteWork'));
});

test('entity labels derive translated technical copy without mutating source identifiers', () => {
  const devices = [{ id: 'router', name: '', category: 'Router', powerW: 15 }];
  const sources = [{
    id: 'source-home',
    name: '',
    type: 'PowerStation',
    usableCapacityWh: 1000,
    maxOutputPowerW: 1200,
  }];
  const services = [{
    id: 'internet',
    name: '',
    templateId: 'Internet',
    variantId: 'Fiber',
  }];
  const snapshot = structuredClone({ devices, sources, services });

  assert.equal(deviceDisplayLabels(devices, createTranslator('en')).get('router'), 'Router · 15 W');
  assert.equal(
    deviceDisplayLabels(devices, createTranslator('uk')).get('router'),
    'Маршрутизатор · 15 Вт',
  );
  assert.equal(
    backupSourceDisplayLabels(sources, createTranslator('en')).get('source-home'),
    'Power station · 1000 Wh · 1200 W max',
  );
  assert.equal(
    backupSourceDisplayLabels(sources, createTranslator('uk')).get('source-home'),
    'Портативна електростанція · 1000 Вт·год · 1200 Вт макс.',
  );
  assert.equal(
    serviceDisplayLabels(services, createTranslator('en')).get('internet'),
    'Internet · Fiber',
  );
  assert.equal(
    serviceDisplayLabels(services, createTranslator('uk')).get('internet'),
    'Інтернет · Оптоволокно',
  );
  assert.deepEqual({ devices, sources, services }, snapshot);
});

test('translation helpers render messages without mutating stable status and validation identifiers', () => {
  const uk = createTranslator('uk');
  const target = { status: 'Limited' };
  const error = { code: 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED', sourceId: 'source-home' };

  assert.equal(translateStatus(target.status, uk), 'Обмежено');
  assert.equal(
    translateValidationError(error, uk),
    'Потужність навантаження перевищує максимальну вихідну потужність резервного джерела.',
  );
  assert.equal(target.status, 'Limited');
  assert.equal(error.code, 'BACKUP_SOURCE_MAX_OUTPUT_EXCEEDED');
});

test('representative form, engine, and quick-edit errors resolve without changing their codes', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');
  const errors = [
    { code: 'REQUIRED_FIELD' },
    { code: 'CYCLE_DETECTED' },
    { code: 'INVALID_QUICK_EDIT_PATCH' },
  ];

  assert.deepEqual(errors.map(error => translateValidationError(error, en)), [
    'This field is required.',
    'A cyclic service dependency was detected.',
    'The quick-edit values could not be applied.',
  ]);
  assert.deepEqual(errors.map(error => translateValidationError(error, uk)), [
    'Це поле обов’язкове.',
    'Виявлено циклічну залежність послуг.',
    'Не вдалося застосувати значення швидкого редагування.',
  ]);
  assert.deepEqual(errors.map(error => error.code), [
    'REQUIRED_FIELD',
    'CYCLE_DETECTED',
    'INVALID_QUICK_EDIT_PATCH',
  ]);
});

test('warning translation uses display names without mutating its code', () => {
  const warning = { code: 'MISSING_BACKUP_SOURCE_MAX_OUTPUT', sourceId: 'source-home' };

  assert.equal(
    translateWarning(warning, createTranslator('en'), () => 'Home backup'),
    'Maximum output is not set for Home backup; overload was not checked.',
  );
  assert.equal(
    translateWarning(warning, createTranslator('uk'), () => 'Домашній резерв'),
    'Для Домашній резерв не задано максимальну вихідну потужність; перевантаження не перевірялося.',
  );
  assert.equal(warning.code, 'MISSING_BACKUP_SOURCE_MAX_OUTPUT');
});

test('each recommendation type translates without mutating its stable type', () => {
  const en = createTranslator('en');
  const uk = createTranslator('uk');
  const recommendations = [
    { type: 'ADD_BACKUP', entityId: 'device-router' },
    { type: 'EXTERNAL_PROVIDER_LIMIT', entityId: 'provider-internet' },
    { type: 'DISABLE_ADDITIONAL_LOAD', entityId: 'device-lamp', improvementMinutes: 60 },
  ];
  const names = {
    'device-router': 'Router',
    'provider-internet': 'Internet provider',
    'device-lamp': 'Desk lamp',
  };

  assert.equal(
    translateRecommendation(recommendations[0], en, id => names[id]),
    'Add backup power for Router.',
  );
  assert.equal(
    translateRecommendation(recommendations[1], en, id => names[id]),
    'Internet provider is limiting availability; increasing local battery capacity does not remove this provider limit.',
  );
  assert.equal(
    translateRecommendation(recommendations[2], en, id => names[id]),
    'Disabling Desk lamp improves every selected target by at least 60 minutes.',
  );
  assert.equal(
    translateRecommendation(recommendations[0], uk, id => names[id]),
    'Додайте резервне живлення для Router.',
  );
  assert.equal(
    translateRecommendation(recommendations[1], uk, id => names[id]),
    'Internet provider обмежує доступність; збільшення ємності локальної батареї не усуває це обмеження постачальника.',
  );
  assert.equal(
    translateRecommendation(recommendations[2], uk, id => names[id]),
    'Вимкнення Desk lamp покращує кожну обрану ціль щонайменше на 60 хвилин.',
  );
  assert.deepEqual(
    recommendations.map(recommendation => recommendation.type),
    ['ADD_BACKUP', 'EXTERNAL_PROVIDER_LIMIT', 'DISABLE_ADDITIONAL_LOAD'],
  );
});

test('application header renders the visible language switch with English selected by default', () => {
  const html = renderToStaticMarkup(createElement(App));

  assert.match(html, /class="language-switch"/);
  assert.match(html, /aria-label="Interface language"/);
  assert.match(html, /<button[^>]*aria-pressed="true"[^>]*>EN<\/button>/);
  assert.match(html, /<button[^>]*aria-pressed="false"[^>]*>UA<\/button>/);
});

test('all wizard and result surfaces render Ukrainian presentation without changing source data', () => {
  const t = createTranslator('uk');
  const formState = createInitialUserMvpState();
  const formSnapshot = structuredClone(formState);
  const labels = labelMapsFor(formState, t);
  const callbacks = {
    onAdd: noop,
    onAssignmentChange: noop,
    onBack: noop,
    onChange: noop,
    onNext: noop,
    onRemove: noop,
  };
  const equipmentHtml = renderToStaticMarkup(createElement(EquipmentStep, {
    ...callbacks,
    deviceLabels: labels.deviceLabels,
    devices: formState.devices,
    t,
  }));
  const backupHtml = renderToStaticMarkup(createElement(BackupStep, {
    ...callbacks,
    assignments: formState.backupAssignmentsByDeviceId,
    backupSourceLabels: labels.backupSourceLabels,
    backupSources: formState.backupSources,
    deviceLabels: labels.deviceLabels,
    devices: formState.devices,
    t,
  }));
  const servicesHtml = renderToStaticMarkup(createElement(ServicesScenarioStep, {
    ...labels,
    errors: [{ code: 'INVALID_POSITIVE_NUMBER', field: 'devices.0.powerW' }],
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
  const normalized = normalizeUserMvpForm(formState);
  assert.equal(normalized.success, true);
  const outcome = runUserScenario(normalized);
  const resultHtml = renderToStaticMarkup(createElement(UserScenarioResult, {
    ...labels,
    input: normalized,
    onBack: noop,
    onQuickRecalculate: noop,
    outcome,
    t,
  }));
  const failureHtml = renderToStaticMarkup(createElement(UserScenarioResult, {
    ...labels,
    input: normalized,
    onBack: noop,
    onQuickRecalculate: noop,
    outcome: { success: false, errors: [{ code: 'CYCLE_DETECTED' }] },
    t,
  }));

  assert.match(equipmentHtml, /Обладнання/);
  assert.match(equipmentHtml, /120 Вт·год/);
  assert.match(backupHtml, /Резервне живлення/);
  assert.match(backupHtml, /480 Вт·год/);
  assert.match(servicesHtml, /Виправте сценарій перед запуском/);
  assert.match(servicesHtml, /Маршрутизатор <span class="role-type">Пристрій<\/span>/);
  assert.doesNotMatch(servicesHtml, />INVALID_POSITIVE_NUMBER</);
  assert.match(resultHtml, /Результат доступності/);
  assert.match(resultHtml, /360 хв \(6 год\)/);
  assert.match(resultHtml, /80 Вт/);
  assert.match(resultHtml, /Обмежено/);
  assert.match(failureHtml, /Виявлено циклічну залежність послуг\./);
  assert.doesNotMatch(failureHtml, />CYCLE_DETECTED</);
  assert.deepEqual(formState, formSnapshot);
});
