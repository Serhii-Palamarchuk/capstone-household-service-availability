import { DeviceCategory } from './constants.js';

const single = (id, entityType, allowedCategories, allowedTemplateIds) => ({
  id,
  entityType,
  cardinality: '1',
  ...(allowedCategories ? { allowedCategories } : {}),
  ...(allowedTemplateIds ? { allowedTemplateIds } : {}),
});

const many = (id, entityType, allowedCategories) => ({
  id,
  entityType,
  cardinality: '1..N',
  ...(allowedCategories ? { allowedCategories } : {}),
});

function deepFreeze(value) {
  if (value && typeof value === 'object') {
    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }
    Object.freeze(value);
  }

  return value;
}

export const serviceTemplates = deepFreeze([
  {
    id: 'Internet',
    variants: Object.freeze([
      {
        id: 'Fiber',
        roles: Object.freeze([
          single('router', 'Device', [DeviceCategory.ROUTER]),
          single('ontOnu', 'Device', [DeviceCategory.ONT_ONU]),
          single('provider', 'ExternalProvider'),
        ]),
      },
      {
        id: 'RouterOnly',
        roles: Object.freeze([
          single('routerOrModem', 'Device', [DeviceCategory.ROUTER, DeviceCategory.MODEM]),
          single('provider', 'ExternalProvider'),
        ]),
      },
    ]),
  },
  {
    id: 'RemoteWork',
    roles: Object.freeze([
      single('internetService', 'ServiceInstance', undefined, ['Internet']),
      many('workDevices', 'Device', [
        DeviceCategory.LAPTOP_DESKTOP,
        DeviceCategory.MONITOR,
        DeviceCategory.WORK_PERIPHERAL,
      ]),
    ]),
  },
  {
    id: 'Refrigeration',
    roles: Object.freeze([
      many('coolingDevices', 'Device', [DeviceCategory.REFRIGERATOR, DeviceCategory.FREEZER]),
    ]),
  },
  {
    id: 'Heating',
    variants: Object.freeze([
      {
        id: 'GasBoiler',
        roles: Object.freeze([
          single('heatingUnit', 'Device', [DeviceCategory.GAS_BOILER]),
          single('gasSupply', 'ExternalProvider'),
        ]),
      },
      {
        id: 'Electric',
        roles: Object.freeze([
          many('heatingDevices', 'Device', [
            DeviceCategory.ELECTRIC_HEATER_BOILER,
            DeviceCategory.HEAT_PUMP,
          ]),
        ]),
      },
      {
        id: 'Centralized',
        roles: Object.freeze([
          single('heatingProvider', 'ExternalProvider'),
        ]),
      },
    ]),
  },
  {
    id: 'WaterSupply',
    variants: Object.freeze([
      {
        id: 'Centralized',
        roles: Object.freeze([
          single('waterProvider', 'ExternalProvider'),
        ]),
      },
      {
        id: 'PrivateWell',
        roles: Object.freeze([
          single('waterPump', 'Device', [DeviceCategory.WATER_PUMP]),
        ]),
      },
      {
        id: 'PumpedSystem',
        roles: Object.freeze([
          single('waterProvider', 'ExternalProvider'),
          single('waterPump', 'Device', [DeviceCategory.WATER_PUMP]),
        ]),
      },
    ]),
  },
]);

export function getServiceTemplate(templateId, variantId) {
  const template = serviceTemplates.find((item) => item.id === templateId);

  if (!template) return null;
  if (!template.variants) return variantId === undefined ? template : null;

  return template.variants.find((variant) => variant.id === variantId) ?? null;
}
