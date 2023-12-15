import {
  apiFetcher,
  authService,
  uiManager,
  useAuthData,
} from '@roxavn/core/web';
import { userIdentityApi } from '@roxavn/module-user/base';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';
import { disconnect, signMessage } from 'wagmi/actions';

import { constants, identityApi, web3AuthApi } from '../../base/index.js';

async function loginWeb3(
  address: string,
  onRegister: () => void,
  onSuccess?: () => void
) {
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
    await authService.authenticate(tokenAuth);
    onSuccess && onSuccess();
  } catch (e: any) {
    const error = apiFetcher.getErrorData(e);
    if (error?.type === 'NotLinkedAddressException') {
      onRegister();
    } else {
      uiManager.errorModal(e);
    }
  }
}

async function checkIdentity(
  userId: string,
  address: string,
  onSuccess?: () => void
) {
  try {
    const identities = await apiFetcher.fetch(userIdentityApi.getAll, {
      userId,
    });
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
    onSuccess && onSuccess();
  } catch (e: any) {
    uiManager.errorModal(e);
    const error = apiFetcher.getErrorData(e);
    if (error?.type === 'LinkedAddressException') {
      // TODO: must check without magic string
      authService.logout();
    }
  }
}

export function useWeb3Auth({
  onRegister,
  onSuccess,
}: {
  onRegister: () => void;
  onSuccess?: () => void;
}) {
  const { user, loading } = useAuthData();
  const { address } = useAccount();

  useEffect(() => {
    if (!loading && address) {
      if (user) {
        checkIdentity(user.id, address, onSuccess);
      } else {
        loginWeb3(address, onRegister, onSuccess);
      }
    }

    const sub = authService.authObserver.subscribe((authUser) => {
      if (!authUser) {
        disconnect();
      }
    });
    return () => sub.unsubscribe();
  }, [user, address, loading]);

  return { user, address };
}
