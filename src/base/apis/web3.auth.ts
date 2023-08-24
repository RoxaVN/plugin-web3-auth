import { ApiSource, ExactProps, IsBoolean, MinLength } from '@roxavn/core/base';

import { baseModule } from '../module.js';
import { scopes } from '../access.js';

const web3AuthSource = new ApiSource([scopes.web3Auth], baseModule);

class CreateWeb3AuthRequest extends ExactProps<CreateWeb3AuthRequest> {
  @MinLength(1)
  public readonly address: string;

  @IsBoolean()
  public readonly isLinked: boolean;
}

export const web3AuthApi = {
  create: web3AuthSource.create<
    CreateWeb3AuthRequest,
    { id: string; message: string }
  >({
    validator: CreateWeb3AuthRequest,
  }),
};
