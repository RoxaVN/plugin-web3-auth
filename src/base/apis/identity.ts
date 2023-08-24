import {
  ApiSource,
  BadRequestException,
  ExactProps,
  MinLength,
  TokenAuthData,
} from '@roxavn/core/base';
import { scopes, permissions } from '@roxavn/module-user/base';

import { baseModule } from '../module.js';

const identitySource = new ApiSource([scopes.Identity], baseModule);

class AuthIdentityRequest extends ExactProps<AuthIdentityRequest> {
  @MinLength(1)
  public readonly web3AuthId: string;

  @MinLength(1)
  public readonly signature: string;
}

class CreateIdentityRequest extends ExactProps<CreateIdentityRequest> {
  @MinLength(1)
  public readonly web3AuthId: string;

  @MinLength(1)
  public readonly signature: string;
}

export const identityApi = {
  create: identitySource.create({
    validator: CreateIdentityRequest,
    permission: permissions.CreateIdentity,
  }),
  auth: identitySource.custom<
    AuthIdentityRequest,
    TokenAuthData,
    BadRequestException
  >({
    method: 'POST',
    path: identitySource.apiPath() + '/auth',
    validator: AuthIdentityRequest,
  }),
};
