import { Modal } from '@mantine/core';
import { webModule } from '@roxavn/core/web';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useState } from 'react';

import { useWeb3Auth } from '../hooks/index.js';

export interface Web3AuthProps {
  registerComponent: (setModalStatus: (opened: boolean) => void) => JSX.Element;
  guestComponent: (openWeb3Modal: () => void) => JSX.Element;
  userComponent: (data: {
    user: Record<string, any>;
    address: string;
  }) => JSX.Element;
}

export function Web3Auth({
  userComponent,
  guestComponent,
  registerComponent,
}: Web3AuthProps) {
  const [open, setOpen] = useState(false);
  const { user, address } = useWeb3Auth(() => setOpen(true));
  const web3Modal = useWeb3Modal();
  const { t } = webModule.useTranslation();

  if (user && address) {
    return userComponent({ user, address });
  }
  if (open) {
    return (
      <Modal opened={open} onClose={() => setOpen(false)} title={t('register')}>
        {registerComponent(setOpen)}
      </Modal>
    );
  }
  return guestComponent(web3Modal.open);
}
