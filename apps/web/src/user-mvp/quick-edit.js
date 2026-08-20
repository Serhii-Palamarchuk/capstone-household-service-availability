const allowedPatchKeys = new Set([
  'sourceId',
  'usableCapacityWh',
  'maxOutputPowerW',
  'outageDurationMinutes',
]);

const sourceFieldNames = ['usableCapacityWh', 'maxOutputPowerW'];

export class QuickEditContractError extends TypeError {
  constructor(message) {
    super(message);
    this.name = 'QuickEditContractError';
  }
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

export function applyQuickEdit(formState, patch) {
  for (const key of Object.keys(patch)) {
    if (!allowedPatchKeys.has(key)) {
      throw new QuickEditContractError(`Quick edit field is not allowed: ${key}`);
    }
  }

  const touchedSourceFields = sourceFieldNames.filter(field => hasOwn(patch, field));
  const touchesOutage = hasOwn(patch, 'outageDurationMinutes');

  if (touchedSourceFields.length === 0 && !touchesOutage) return formState;

  let backupSources = formState.backupSources;
  if (touchedSourceFields.length > 0) {
    const sourceIndex = backupSources.findIndex(source => source.id === patch.sourceId);
    if (sourceIndex === -1) {
      throw new QuickEditContractError(
        'Quick edit sourceId must identify an existing backup source',
      );
    }

    const source = backupSources[sourceIndex];
    const nextSource = { ...source };
    for (const field of touchedSourceFields) nextSource[field] = patch[field];

    backupSources = [...backupSources];
    backupSources[sourceIndex] = nextSource;
  }

  return {
    ...formState,
    ...(backupSources === formState.backupSources ? {} : { backupSources }),
    ...(touchesOutage
      ? {
        scenario: {
          ...formState.scenario,
          outageDurationMinutes: patch.outageDurationMinutes,
        },
      }
      : {}),
  };
}
