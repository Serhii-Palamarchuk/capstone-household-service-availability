import { DEMO_NODE_NAMES } from './internet-demo.js';

function formatDuration(minutes) {
  return `${minutes / 60} h`;
}

export function createResultView(outcome) {
  if (!outcome.success) {
    return {
      kind: 'failure',
      errors: outcome.errors.map(({ code, message }) => ({ code, message })),
    };
  }

  const result = outcome.targetResults[0];

  return {
    kind: 'success',
    serviceName: DEMO_NODE_NAMES[result.serviceId],
    availabilityText: formatDuration(result.availabilityDurationMinutes),
    status: result.status,
    limitingDependencyNames: result.limitingDependencyIds.map(id => DEMO_NODE_NAMES[id]),
    causalPathTexts: result.causalPaths.map(path => (
      path.map(id => DEMO_NODE_NAMES[id]).join(' → ')
    )),
  };
}
