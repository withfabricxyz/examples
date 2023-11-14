import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FetchTokenResult } from '@wagmi/core';
import { TransactionReceipt } from 'viem';
import styled from 'styled-components';
import { CampaignAccountContext } from '@withfabric/protocol-sdks';

import { tokenToHuman } from 'lib/currencies';

type TransferFormProps = {
  context: CampaignAccountContext;
  transferableFunds: bigint;
  recipientAddress: `0x${string}`;
  token: FetchTokenResult | undefined | null;
  onTransfer: (receipt: TransactionReceipt) => void;
};

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

export default function TransferForm({ context, transferableFunds, recipientAddress, token, onTransfer } : TransferFormProps) {
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  useEffect(() => {
    (async function prepare() {
      setIsPreparing(true);
      try {
        await context.prepareTransfer();
      } catch (error) {
        alert(error);
      }
      setIsPreparing(false);
    })();
  }, [context]);

  async function transfer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!context.isTransferPrepared()) {
      return alert('Transfer is not prepared');
    }

    if (context.getTransferPreflightResults().length) {
      return alert('Transfer preflight failed with errors: ' + context.getTransferPreflightResults().join(', '));
    }

    try {
      setIsPolling(true);
      const receipt = await context.executeTransfer();
      onTransfer(receipt);
    } catch (error) {
      alert(error);
    }

    setIsPolling(false);
  }

  const buttonText = () => {
    if (isPreparing) return 'Preparing...';
    if (isPolling) return 'Polling for txn...';
    return 'Transfer Funds';
  };

  return (
    <Parent>
      <form onSubmit={transfer}>
        <h3>Campaign Successful!</h3>
        <p>Docs: <Link href="https://docs.withfabric.xyz/crowdfi/transfer" target="_blank" rel="noopener noreferrer">Fabric Crowdfi - Transferring Funds</Link></p>
        <p><strong>Transferable Funds:</strong> {tokenToHuman(transferableFunds, token ? token.decimals : 18)} ETH</p>
        <p><strong>Recipient Address:</strong> {recipientAddress}</p>
        <SubmitButton type="submit" disabled={isPreparing || isPolling}>{buttonText()}</SubmitButton>
      </form>
    </Parent>
    
  );
}