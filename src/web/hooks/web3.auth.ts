import {
  apiFetcher,
  authService,
  uiManager,
  useAuthData,
} from '@roxavn/core/web';
import { userIdentityApi } from '@roxavn/module-user/base';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { signMessage } from 'wagmi/actions';

import {
  LinkedAddressException,
  NotLinkedAddressException,
  constants,
  identityApi,
  web3AuthApi,
} from '../../base/index.js';

async function loginWeb3(address: string, registerHanlder: () => void) {
  try {
    const web3Auth = await apiFetcher.fetch(web3AuthApi.create, {
      address: address,
      isLinked: true,
    });
    const signature = await signMessage({ message: web3Auth.message });
    const tokenAuth = await apiFetcher.fetch(identityApi.auth, {
      web3AuthId: web3Auth.id,
      signature: signature,
    });
    authService.setTokenData(tokenAuth);
    await authService.authenticate(tokenAuth);
  } catch (e: any) {
    const error = apiFetcher.getErrorData(e);
    if (error?.type === NotLinkedAddressException.name) {
      registerHanlder();
    } else {
      uiManager.errorModal(e);
    }
  }
}

async function checkIdentity(address: string) {
  try {
    const identities = await apiFetcher.fetch(userIdentityApi.getAll);
    const identity = identities.items.find(
      (item) =>
        item.subject === address.toLowerCase() &&
        item.type === constants.identityTypes.WEB3_ADDRESS
    );
    if (!identity) {
      const web3Auth = await apiFetcher.fetch(web3AuthApi.create, {
        address: address,
        isLinked: false,
      });
      const signature = await signMessage({ message: web3Auth.message });
      await apiFetcher.fetch(identityApi.create, {
        signature,
        web3AuthId: web3Auth.id,
      });
    }
  } catch (e: any) {
    uiManager.errorModal(e);
    const error = apiFetcher.getErrorData(e);
    if (error?.type === LinkedAddressException.name) {
      const tokenData = authService.getTokenData();
      if (tokenData) {
        authService.logout(tokenData);
      }
    }
  }
}

export function useWeb3Auth(registerHanlder: () => void) {
  const { user, loading } = useAuthData();
  const { address } = useAccount();

  useEffect(() => {
    if (!loading && address) {
      if (user) {
        checkIdentity(address);
      } else {
        loginWeb3(address, registerHanlder);
      }
    }
  }, [user, address, loading]);

  return { user, address };
}
