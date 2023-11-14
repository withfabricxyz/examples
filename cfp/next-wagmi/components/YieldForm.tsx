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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
`;

const Label = styled.label`
  display: block;
  width: 100%;
  font-weight: 500;
`;

const Input = styled.input`
  display: inline-block;
  appearance: none;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.625rem 0.5rem;
  border-radius: 0.25rem;
  background-color: #fff;
`;

const SubmitButton = styled.button`
  appearance: none;
  border: none;
  background-color: rgba(17, 125, 69, 1);
  padding: 0.625rem 1rem;
  border-radius: 0.25rem;
  text-align: center;
  color: white;
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

function transformNumberInput(input: string) {
  let value = input;
  if(value.startsWith('.')) { value = `0${value}`; }
  if(value.endsWith('.')) { value = `${value}0`; }
  return value;
}

type YieldFormProps = {
  context: CampaignAccountContext;
  token: FetchTokenResult | undefined | null;
  onApprove: (receipt: TransactionReceipt) => void;
  onYield: (receipt: TransactionReceipt) => void;
}

export default function YieldForm({ context, token, onApprove, onYield } : YieldFormProps) {
  const [yieldAmount, setYieldAmount] = useState<bigint>(0n);
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  useEffect(() => {
    (async function prepare() {
      if (!yieldAmount) return;

      setIsPreparing(true);
      try {
        if (context.isTokenApprovalRequired(yieldAmount)) {
          await context.prepareTokenApproval(yieldAmount);
        } else {
          await context.prepareYield(yieldAmount);
        }
      } catch (error) {
        alert(error);
      }
      setIsPreparing(false);
    })();
  }, [context, yieldAmount]);

  async function approveTokens() {
    setIsApproving(true);
    try {
      const receipt = await context.executeTokenApproval();
      onApprove(receipt);
    } catch (error) {
      alert(error);
    }
    setIsApproving(false);
  }

  async function depositYield(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!yieldAmount || isPreparing) return;

    if (context.isTokenApprovalRequired(yieldAmount)) {
      if (!context.isApprovalPrepared()) {
        return alert('Approval not prepared');
      }
      await approveTokens();
      return;
    }

    if (!context.isYieldPrepared()) {
      alert('Yield not prepared');
      return;
    }

    if (!context.isYieldPossible(yieldAmount)) {
      alert('Yield not possible');
      return;
    }

    if (context.getYieldPreflightResults(yieldAmount).length) {
      alert(context.getYieldPreflightResults(yieldAmount));
      return;
    }

    try {
      setIsPolling(true);
      const receipt = await context.executeYield();
      onYield(receipt);
    } catch (error) {
      alert(error);
    }

    setIsPolling(false);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    setYieldAmount(parseUnits(transformNumberInput(e.target.value), token ? token.decimals : 18));
  }

  const buttonText = () => {
    if (isPreparing) return 'Preparing...';
    if (isApproving) return 'Approving tokens...';
    if (isPolling) return 'Polling for receipt...';
    if (yieldAmount && context.isTokenApprovalRequired(yieldAmount)) return `Approve ${token?.symbol}`;
    return 'Deposit Yield';
  };

  return (
    <Parent>
      <h3>Deposit Yield</h3>
      <p>Docs: <Link href="https://docs.withfabric.xyz/crowdfi/yield" target="_blank" rel="noopener noreferrer">Fabric Crowdfi - Yield</Link></p>
      <Form onSubmit={depositYield}>
        <Label htmlFor="yield">Yield Amount:</Label>
        <Input
          type="number"
          step="0.01"
          value={tokenToHuman(yieldAmount, token ? token.decimals : 18)}
          onChange={onChange}
        />
        <SubmitButton type="submit" disabled={isPreparing || isPolling}>{buttonText()}</SubmitButton>
      </Form>
    </Parent>
  );
}