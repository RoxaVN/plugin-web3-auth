import { accessManager } from '@roxavn/core/base';

import { baseModule } from './module.js';

export const scopes = accessManager.makeScopes(baseModule, {
  web3Auth: { name: 'web3Auth' },
});

export const permissions = accessManager.makePermissions(scopes, {});

export const roles = accessManager.makeRoles(scopes, permissions, {});
