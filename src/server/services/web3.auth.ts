import {
  BadRequestException,
  ExpiredException,
  InferApiRequest,
  NotFoundException,
} from '@roxavn/core/base';
import {
  BaseService,
  DatabaseService,
  InjectDatabaseService,
  inject,
} from '@roxavn/core/server';
import { GetIdentityBytypeService } from '@roxavn/module-user/server';
import { TokenService } from '@roxavn/module-utils/server';
import { eth } from 'web3';

import { Web3Auth } from '../entities/web3.auth.entity.js';
import { serverModule } from '../module.js';
import {
  LinkedAddressException,
  NotLinkedAddressException,
  constants,
  web3AuthApi,
} from '../../base/index.js';

@serverModule.useApi(web3AuthApi.create)
export class CreateWeb3AuthService extends BaseService {
  constructor(
    @inject(GetIdentityBytypeService)
    private getIdentityBytypeService: GetIdentityBytypeService,
    @inject(TokenService) private tokenService: TokenService,
    @inject(DatabaseService) private databaseService: DatabaseService
  ) {
    super();
  }

  async handle(request: InferApiRequest<typeof web3AuthApi.create>) {
    const identity = await this.getIdentityBytypeService.handle({
      subject: request.address.toLowerCase(),
      type: constants.identityTypes.WEB3_ADDRESS,
    });
    if (request.isLinked && !identity) {
      throw new NotLinkedAddressException();
    } else if (!request.isLinked && identity) {
      throw new LinkedAddressException();
    }

    const token = await this.tokenService.creator.create();
    const message = 'Please sign this message\n' + token;
    const web3auth = new Web3Auth();
    web3auth.address = request.address;
    web3auth.message = message;
    await this.databaseService.manager.save(web3auth);

    return { id: web3auth.id, message };
  }
}

@serverModule.injectable()
export class GetWeb3AuthService extends InjectDatabaseService {
  async handle(request: { web3AuthId: string }) {
    const web3auth = await this.entityManager.getRepository(Web3Auth).findOne({
      where: {
        id: request.web3AuthId,
      },
    });
    if (web3auth) {
      return web3auth;
    }
    throw new NotFoundException();
  }
}

@serverModule.injectable()
export class DeleteWeb3AuthService extends InjectDatabaseService {
  async handle(request: { web3AuthId: string }) {
    await this.entityManager.getRepository(Web3Auth).delete({
      id: request.web3AuthId,
    });
    return {};
  }
}

@serverModule.injectable()
export class Web3AuthService extends BaseService {
  constructor(
    @inject(GetWeb3AuthService) private getWeb3AuthService: GetWeb3AuthService,
    @inject(DeleteWeb3AuthService)
    private deleteWeb3AuthService: DeleteWeb3AuthService
  ) {
    super();
  }

  async handle(request: { web3AuthId: string; signature: string }): Promise<{
    /***
     * Web 3 address in lower case
     */
    address: string;
  }> {
    const web3auth = await this.getWeb3AuthService.handle({
      web3AuthId: request.web3AuthId,
    });
    const now = new Date();
    if (now.getTime() - web3auth.createdDate.getTime() > 15 * 60 * 1000) {
      // expire after 15 minutes
      throw new ExpiredException();
    }

    const address = eth.accounts
      .recover(web3auth.message, request.signature)
      .toLowerCase();
    if (address !== web3auth.address.toLowerCase()) {
      throw new BadRequestException();
    }
    // delete if auth success
    await this.deleteWeb3AuthService.handle({ web3AuthId: request.web3AuthId });

    return { address };
  }
}
