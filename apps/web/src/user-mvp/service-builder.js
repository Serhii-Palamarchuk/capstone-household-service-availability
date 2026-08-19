import { getServiceTemplate, serviceTemplates } from './service-templates.js';

function error(code, roleId) {
  return roleId === undefined ? { code } : { code, roleId };
}

function findDependency(context, id) {
  const collections = [
    ['ServiceInstance', context.services],
    ['Device', context.devices],
    ['ExternalProvider', context.externalProviders],
  ];

  for (const [entityType, items] of collections) {
    const item = items?.find((candidate) => candidate.id === id);
    if (item) return { entityType, item };
  }

  return null;
}

function validateRole(role, bindings, context, errors) {
  const ids = bindings[role.id];

  if (!Array.isArray(ids)) {
    errors.push(error('TEMPLATE_ROLE_REQUIRED', role.id));
    return [];
  }

  if ((role.cardinality === '1' && ids.length !== 1)
    || (role.cardinality === '1..N' && ids.length === 0)) {
    errors.push(error('TEMPLATE_ROLE_CARDINALITY', role.id));
  }

  for (const id of ids) {
    const dependency = findDependency(context, id);
    if (!dependency) {
      errors.push(error('TEMPLATE_DEPENDENCY_NOT_FOUND', role.id));
      continue;
    }

    if (dependency.entityType !== role.entityType) {
      errors.push(error('TEMPLATE_ROLE_ENTITY_TYPE', role.id));
      continue;
    }

    if (role.allowedCategories && !role.allowedCategories.includes(dependency.item.category)) {
      errors.push(error('TEMPLATE_ROLE_CATEGORY', role.id));
    }
  }

  return ids;
}

export { getServiceTemplate };

export function createServiceInstance(input, context) {
  const template = serviceTemplates.find((item) => item.id === input.templateId);
  if (!template) return { success: false, errors: [error('TEMPLATE_NOT_FOUND')] };

  const variant = getServiceTemplate(input.templateId, input.variantId);
  if (!variant) return { success: false, errors: [error('TEMPLATE_VARIANT_NOT_FOUND')] };

  const bindings = input.dependencyBindings ?? {};
  const errors = [];
  const dependencyIds = [];

  for (const roleId of Object.keys(bindings)) {
    if (!variant.roles.some((role) => role.id === roleId)) {
      errors.push(error('TEMPLATE_ROLE_NOT_FOUND', roleId));
    }
  }

  for (const role of variant.roles) {
    for (const id of validateRole(role, bindings, context, errors)) {
      if (!dependencyIds.includes(id)) dependencyIds.push(id);
    }
  }

  if (errors.length > 0) return { success: false, errors };

  return {
    success: true,
    service: {
      id: input.id,
      name: input.name,
      templateId: input.templateId,
      ...(input.variantId === undefined ? {} : { variantId: input.variantId }),
      dependencyBindings: Object.fromEntries(
        Object.entries(bindings).map(([roleId, ids]) => [roleId, [...ids]]),
      ),
      dependencyIds,
    },
  };
}
