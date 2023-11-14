import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FetchTokenResult } from '@wagmi/core';
import { TransactionReceipt } from 'viem';
import styled from 'styled-components';
import { CampaignAccountContext } from '@withfabric/protocol-sdks';

import { tokenToHuman } from '@lib/currencies';

const Parent = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 0.25rem;
  padding: 1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: row;
  gap: 0.75rem;
`;

const RadioGroup = styled.div`
  position: relative;
`;

const RadioButton = styled.label`
  display: inline-block;
  background-color: rgba(0, 0, 0, 0.03);
  padding: 0.625rem 1rem;
  border-radius: 0.25rem;
  text-align: center;
  font-weight: 500;

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }
`;

const RadioInput = styled.input`
  position: absolute;
  top: 0;
  visibility: hidden;
  opacity: 0;

  &:checked + ${RadioButton} {
    background-color: rgba(251, 66, 223, 1);
    color: white;
  }
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

type ContributeFormProps = {
  context: CampaignAccountContext;
  token: FetchTokenResult | undefined | null;
  onApprove: (receipt: TransactionReceipt) => void;
  onContribute: (receipt: TransactionReceipt) => void;
}

export default function ContributeForm({ context, token, onApprove, onContribute } : ContributeFormProps) {
  const [contribution, setContribution] = useState<bigint>();
  const [isPreparing, setIsPreparing] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);

  useEffect(() => {
    (async function prepare() {
      if (!contribution) return;

      setIsPreparing(true);

      try {
        if (context.isTokenApprovalRequired(contribution)) {
          await context.prepareTokenApproval(contribution);
        } else {
          await context.prepareContribution(contribution!);
        }
      } catch (error) {
        console.error(error);
      }

      setIsPreparing(false);
    })();
  }, [context, contribution]);

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

  async function contribute() {
    if (!contribution || isPreparing) return;

    if (context.isTokenApprovalRequired(contribution)) {
      if (!context.isApprovalPrepared()) {
        return alert('Approval not prepared');
      }
      await approveTokens();
      return;
    }

    if (!context.isContributionPrepared()) {
      alert('Contribution not prepared');
      return;
    }

    if (!context.isContributionPossible(contribution)) {
      alert('Contribution not possible');
      return;
    }

    // optional, errors would otherwise be caught in preparation step
    if (context.getContributePreflightResults(contribution).length) {
      alert(context.getContributePreflightResults(contribution));
      return;
    }

    try {
      setIsPolling(true);
      const receipt = await context.executeContribution();
      onContribute(receipt);
    } catch (error) {
      alert(error);
    }

    setIsPolling(false);
  }

  const buttonText = () => {
    if (!contribution) return 'Select an amount';
    if (isPreparing) return 'Preparing...';
    if (isApproving) return 'Approving tokens...';
    if (isPolling) return 'Polling for receipt...';
    if (contribution && context.isTokenApprovalRequired(contribution)) return `Approve ${token?.symbol}`;
    return `Contribute ${token?.symbol || 'ETH'}`;
  };

  return (
    <Parent>
      <h3>Contribute to this campaign</h3>
      <p>Docs: <Link href="https://docs.withfabric.xyz/crowdfi/contributions" target="_blank" rel="noopener noreferrer">Fabric Crowdfi - Contributing Funds</Link></p>
      <Form onSubmit={contribute}>
        <RadioGroup>
          <RadioInput
            type="radio"
            name="contribution"
            value={context.account.minAllowedContribution.toString()}
            checked={context.account.minAllowedContribution === contribution}
            id="contribution-min"
            onChange={e => setContribution(BigInt(e.target.value))}
          />
          <RadioButton htmlFor="contribution-min">{tokenToHuman(context.account.minAllowedContribution, token ? token.decimals : 18)} (min)</RadioButton>
        </RadioGroup>
        <RadioGroup>
          <RadioInput
            type="radio"
            name="contribution"
            value={(context.account.maxAllowedContribution/ 2n).toString()}
            checked={context.account.maxAllowedContribution / 2n === contribution}
            id="contribution-mid"
            onChange={e => setContribution(BigInt(e.target.value))}
          />
          <RadioButton htmlFor="contribution-mid">{tokenToHuman(context.account.maxAllowedContribution / 2n, token ? token.decimals : 18)} (mid)</RadioButton>
        </RadioGroup>
        <RadioGroup>
          <RadioInput
            type="radio"
            name="contribution"
            value={context.account.maxAllowedContribution.toString()}
            checked={context.account.maxAllowedContribution === contribution}
            id="contribution-max"
            onChange={e => setContribution(BigInt(e.target.value))}
          />
          <RadioButton htmlFor="contribution-max">{tokenToHuman(context.account.maxAllowedContribution, token ? token.decimals : 18)} (max)</RadioButton>
        </RadioGroup>
      </Form>
      <div>
        <SubmitButton onClick={contribute} disabled={isPreparing || isPolling || !contribution || isApproving}>{buttonText()}</SubmitButton>
      </div>
    </Parent>
  );
}