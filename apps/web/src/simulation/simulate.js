import { calculateServiceResults } from './calculate.js';
import { createModelIndex } from './model-index.js';
import { validateSimulationInput } from './validation.js';

export function simulate(model, scenario) {
  const modelIndex = createModelIndex(model);
  const errors = validateSimulationInput(modelIndex, scenario);

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const serviceResults = calculateServiceResults(modelIndex, scenario);
  const targetResults = scenario.targetServiceIds.map(id => serviceResults.get(id));

  return {
    success: true,
    targetResults,
    serviceResults,
  };
}
