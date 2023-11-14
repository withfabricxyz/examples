import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FetchTokenResult } from '@wagmi/core';
import { TransactionReceipt, parseUnits } from 'viem';
import styled from 'styled-components';
import { CampaignAccountContext } from '@withfabric/protocol-sdks';

import { tokenToHuman } from 'lib/currencies';

const Parent = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  padding: 1rem;
`;

const SubmitButton = styled.button`
  appearance: none;
  border: none;
  background-color: rgba(17, 125, 69, 1);
  padding: 0.625rem 1rem;
  border-radius: 0.25rem;
  text-align: center;
  color: white;
  margin-top: 0.75rem;
  font-weight: 500;

  &:hover {
    cursor: pointer;
    background-color: #0f6d3c;
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.1);
    color: black;
    cursor: not-allowed;
  }
`;

type WithdrawFormProps = {
  context: CampaignAccountContext;
  withdrawableFunds: bigint;
  token: FetchTokenResult | undefined | null;
  onWithdraw: (receipt: TransactionReceipt) => void;
};

export default function WithdrawForm({ context, withdrawableFunds, token, onWithdraw } : WithdrawFormProps) {
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  useEffect(() => {
    (async function prepare() {
      try {
        setIsPreparing(true);
        await context.prepareWithdraw();
      } catch (error) {
        alert(error);
      }
      setIsPreparing(false);
    })();
  }, [context]);

  async function withdraw(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!context.isWithdrawPrepared()) {
      return alert('Withdraw not prepared');
    }

    if (!context.isWithdrawPossible()) {
      return alert('Withdraw not possible');
    }

    if (context.getWithdrawPreflightResults().length) {
      return alert(context.getWithdrawPreflightResults());
    }

    try {
      setIsPolling(true);
      const receipt = await context.executeWithdraw();
      onWithdraw(receipt);
    } catch (error) {
      alert(error);
    }

    setIsPolling(false);
  }

  const buttonText = () => {
    if (isPreparing) return 'Preparing...';
    if (isPolling) return 'Polling for receipt...';
    return 'Withdraw Funds';
  };
  
  return (
    <Parent>
      <form onSubmit={withdraw}>
        <h3>Withdraw Funds</h3>
        <p>Docs: <Link href="https://docs.withfabric.xyz/crowdfi/withdrawals" target="_blank" rel="noopener noreferrer">Fabric Crowdfi - Withdrawing Funds</Link></p>
        <p><strong>Withdrawable Funds:</strong> {tokenToHuman(withdrawableFunds, token ? token.decimals : 18)} ETH</p>
        <SubmitButton type="submit" disabled={isPreparing || isPolling}>{buttonText()}</SubmitButton>
      </form>
    </Parent>
  );
}