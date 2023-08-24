import { type InferApiRequest } from '@roxavn/core/base';
import {
  BaseService,
  type InferContext,
  Ip,
  inject,
  UserAgent,
  AuthUser,
} from '@roxavn/core/server';
import {
  CreateIdentityService,
  IdentityService,
} from '@roxavn/module-user/server';

import { constants, identityApi } from '../../base/index.js';
import { serverModule } from '../module.js';
import { Web3AuthService } from './web3.auth.js';

@serverModule.useApi(identityApi.auth)
export class AuthIdentityService extends BaseService {
  constructor(
    @inject(IdentityService) private identityService: IdentityService,
    @inject(Web3AuthService) private web3AuthService: Web3AuthService
  ) {
    super();
  }

  async handle(
    request: InferApiRequest<typeof identityApi.auth>,
    @Ip ipAddress: InferContext<typeof Ip>,
    @UserAgent userAgent: InferContext<typeof UserAgent>
  ) {
    const { address } = await this.web3AuthService.handle(request);

    return this.identityService.handle({
      authenticator: 'web3',
      ipAddress,
      userAgent,
      subject: address,
      type: constants.identityTypes.WEB3_ADDRESS,
    });
  }
}

@serverModule.useApi(identityApi.create)
export class CreateIdentityApiService extends BaseService {
  constructor(
    @inject(CreateIdentityService)
    private createIdentityService: CreateIdentityService,
    @inject(Web3AuthService) private web3AuthService: Web3AuthService
  ) {
    super();
  }

  async handle(
    request: InferApiRequest<typeof identityApi.create>,
    @AuthUser authUser: InferContext<typeof AuthUser>
  ) {
    const { address } = await this.web3AuthService.handle(request);

    return this.createIdentityService.handle({
      userId: authUser.id,
      subject: address,
      type: constants.identityTypes.WEB3_ADDRESS,
    });
  }
}
