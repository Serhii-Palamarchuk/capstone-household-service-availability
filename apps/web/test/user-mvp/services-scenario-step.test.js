import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import {
  deviceDisplayLabels,
  serviceDisplayLabels,
} from '../../src/user-mvp/entity-labels.js';
import { createInitialUserMvpState } from '../../src/user-mvp/form-state.js';
import { createTranslator } from '../../src/user-mvp/i18n.js';

let ServicesScenarioStep;
let viteServer;

before(async () => {
  viteServer = await createServer({
    appType: 'custom',
    logLevel: 'silent',
    server: { middlewareMode: true },
  });
  ({ ServicesScenarioStep } = await viteServer.ssrLoadModule(
    '/src/components/user-mvp/ServicesScenarioStep.jsx',
  ));
});

after(async () => {
  await viteServer?.close();
});

function propsFor(formState, overrides = {}) {
  const t = overrides.t ?? createTranslator('en');

  return {
    deviceLabels: deviceDisplayLabels(formState.devices, t),
    errors: [],
    formState,
    onAddProvider() {},
    onAddService() {},
    onBack() {},
    onOutageChange() {},
    onProviderAvailabilityChange() {},
    onProviderChange() {},
    onProviderRemove() {},
    onRoleBindingChange() {},
    onScenarioListChange() {},
    onServiceChange() {},
    onServiceRemove() {},
    onSubmit() {},
    providerLabels: new Map(formState.externalProviders.map(provider => [
      provider.id,
      provider.name.trim(),
    ])),
    serviceLabels: serviceDisplayLabels(formState.services, t),
    t,
    ...overrides,
  };
}

function renderStep(formState, overrides = {}) {
  return renderToStaticMarkup(ServicesScenarioStep(propsFor(formState, overrides)));
}

function articleMarkup(html, id) {
  const start = html.indexOf(`id="${id}"`);
  assert.notEqual(start, -1, `Expected article ${id}`);
  const articleStart = html.lastIndexOf('<article', start);
  const end = html.indexOf('</article>', start);
  return html.slice(articleStart, end + '</article>'.length);
}

function findElements(node, predicate, matches = []) {
  if (Array.isArray(node)) {
    for (const child of node) findElements(child, predicate, matches);
    return matches;
  }
  if (!node || typeof node !== 'object' || !('type' in node)) return matches;

  if (typeof node.type === 'function') {
    return findElements(node.type(node.props), predicate, matches);
  }

  if (predicate(node)) matches.push(node);
  findElements(node.props?.children, predicate, matches);
  return matches;
}

test('UX-10/12/13: service and provider rows render actual labels and compact scenario controls', () => {
  const formState = createInitialUserMvpState();
  const html = renderStep(formState);
  const internetRow = articleMarkup(html, 'service-internet-home-row');
  const remoteWorkRow = articleMarkup(html, 'service-remote-work-row');

  assert.equal((html.match(/class="compact-service-row"/g) ?? []).length, 2);
  assert.match(internetRow, /Internet — Home \(Internet · Fiber\)/);
  assert.match(internetRow, /Router · 10 W, ONT\/ONU · 10 W, Internet provider/);
  assert.match(remoteWorkRow, />Remote Work</);
  assert.match(remoteWorkRow, /Internet — Home \(Internet · Fiber\), Laptop \(Laptop\/Desktop · 60 W\)/);
  assert.match(internetRow, /id="service-internet-home-target"/);
  assert.match(internetRow, /<details[^>]*class="row-details service-row-details"/);
  assert.doesNotMatch(internetRow, /<details[^>]* open=""/);
  assert.match(html, /class="compact-provider-row"/);
  assert.match(html, /id="provider-internet-name"/);
  assert.match(html, /id="provider-internet-availability"/);
  assert.match(html, /id="outage-duration"/);
  assert.match(html, /class="[^"]*additional-loads[^"]*"/);
  assert.doesNotMatch(html, /<legend>Target services<\/legend>/);
});

test('dependency summary marks a missing binding as translated incomplete without inferring one', () => {
  const formState = structuredClone(createInitialUserMvpState());
  formState.services[0].dependencyBindings.provider = [];
  const t = createTranslator('uk');
  const html = renderStep(formState, {
    t,
    deviceLabels: deviceDisplayLabels(formState.devices, t),
    serviceLabels: serviceDisplayLabels(formState.services, t),
  });
  const internetRow = articleMarkup(html, 'service-internet-home-row');
  const [, summary] = internetRow.match(/<span class="dependency-summary">([^<]*)<\/span>/);

  assert.match(summary, /Не заповнено/);
  assert.doesNotMatch(summary, /Internet provider/);
});

test('UX-13: target toggle updates only targetServiceIds with the exact selected ids', () => {
  const formState = createInitialUserMvpState();
  const calls = [];
  const tree = ServicesScenarioStep(propsFor(formState, {
    onScenarioListChange: (...args) => calls.push(args),
  }));
  const [target] = findElements(
    tree,
    element => element.type === 'input' && element.props.id === 'service-internet-home-target',
  );

  assert.ok(target, 'Expected target checkbox in the Internet service row');
  target.props.onChange({ target: { checked: true } });
  assert.deepEqual(calls, [[
    'targetServiceIds',
    ['service-remote-work', 'service-internet-home'],
  ]]);
});

test('UX-15: affected service details open and row fields expose their validation messages', () => {
  const formState = createInitialUserMvpState();
  const errors = [
    {
      code: 'TEMPLATE_ROLE_CARDINALITY',
      field: 'services.0.dependencyBindings.provider',
    },
    { code: 'REQUIRED_FIELD', field: 'externalProviders.0.name' },
    {
      code: 'INVALID_NON_NEGATIVE_INTEGER',
      field: 'scenario.externalProviderAvailability.provider-internet',
    },
    { code: 'INVALID_POSITIVE_INTEGER', field: 'scenario.outageDurationMinutes' },
    { code: 'INVALID_POSITIVE_NUMBER', field: 'devices.0.powerW' },
  ];
  const html = renderStep(formState, { errors });
  const internetRow = articleMarkup(html, 'service-internet-home-row');
  const providerRow = articleMarkup(html, 'provider-internet-row');

  assert.match(internetRow, /class="compact-service-row has-errors"/);
  assert.match(internetRow, /<details[^>]*class="row-details service-row-details has-errors"[^>]* open=""/);
  assert.match(internetRow, /id="service-internet-home-provider"[^>]*aria-invalid="true"/);
  assert.match(internetRow, /aria-describedby="service-internet-home-errors"/);
  assert.match(internetRow, /Complete this required service role\./);

  assert.match(providerRow, /class="compact-provider-row has-errors"/);
  assert.match(providerRow, /id="provider-internet-name"[^>]*aria-invalid="true"/);
  assert.match(providerRow, /id="provider-internet-availability"[^>]*aria-invalid="true"/);
  assert.match(providerRow, /aria-describedby="provider-internet-errors"/);

  assert.match(html, /id="outage-duration"[^>]*aria-invalid="true"/);
  assert.match(html, /aria-describedby="outage-duration-errors"/);
  assert.match(html, /<section class="input-errors" role="alert"/);
  assert.match(html, /Enter a value greater than zero\./);
  assert.doesNotMatch(html, />INVALID_POSITIVE_NUMBER</);
});
