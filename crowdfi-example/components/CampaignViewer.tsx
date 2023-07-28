import { useEffect, useState } from 'react';
import { TransactionReceipt } from 'viem';
import { fetchCampaignAccountContext, CampaignAccountContext } from '@withfabric/protocol-sdks';
import styled from 'styled-components';

import styles from 'styles/Home.module.css';
import { tokenToHuman } from 'lib/currencies';

import ContributeForm from 'components/ContributeForm';
import TransferForm from 'components/TransferForm';
import YieldForm from 'components/YieldForm';
import WithdrawForm from 'components/WithdrawForm';

const Forms = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

type CampaignViewerProps = {
  isFetching: boolean,
  campaignAddress: `0x${string}` | null | undefined,
  account: `0x${string}`,
};

export default function CampaignViewer({ isFetching, campaignAddress, account } : CampaignViewerProps) {
  const [context, setContext] = useState<CampaignAccountContext | null>();
  
  useEffect(() => {
    if (!campaignAddress || !account) return;
    
    async function fetch() {
      setContext(await fetchCampaignAccountContext({
        campaignAddress: campaignAddress!,
        account,
      }));
    }
    
    fetch();
  }, [campaignAddress, account]);
  
  if (!context) return null;
  
  const isSuccess = (context.state.isGoalMinMet && context.state.isEnded) || context.state.isGoalMaxMet;
  const userHasWithdrawableFunds = context.account.yieldTokenBalance > 0n || (context.state.isEnded && !context.state.isGoalMinMet && context.account.contributionTokenBalance > 0n);
  const withdrawableFunds = isSuccess ? context.account.yieldTokenBalance : context.account.contributionTokenBalance;

  async function onSuccessfulTxn(receipt: TransactionReceipt) {
    alert('txn: ' + receipt.transactionHash);
    setContext(await context!.refresh());
  }

  if (!campaignAddress) {
    if (isFetching) {
      return (
        <div className={styles.mainElement}>
          <h3>Campaign Address</h3>
          <p>Awaiting txn receipt...</p>
        </div>
      );
    }

    return (
      <div className={styles.mainElement}>
        <h3>&larr; Deploy a campaign to continue</h3>
      </div>
    );
  }

  return (
    <div className={styles.mainElement}>
      <p><strong>Campaign Address:</strong> {campaignAddress}</p>
      <p><strong>Raised:</strong> {isSuccess && '🙌'} {tokenToHuman(context.state.totalSupply, 18)} ETH {isSuccess && '🥳'}</p>
      <p><strong>Goal:</strong> {tokenToHuman(context.state.goalMin, 18)} ETH</p>
      <p><strong>Ends:</strong> {context.state.endsAt.toLocaleString()} (campaign will end before this date if max goal is met)</p>
      <p><strong>Total Funds Returned (Yield) by Creator:</strong> {tokenToHuman(context.state.yieldTotal, 18)} ETH</p>
      <p><strong>Amount this Account can Withdraw:</strong> {tokenToHuman(withdrawableFunds, 18)} ETH</p>
      <Forms>
        {isSuccess && (
          <YieldForm
            context={context}
            onYield={onSuccessfulTxn}
          />
        )}
        {!context.state.isEnded && context.state.isContributionAllowed && (
          <ContributeForm
            context={context}
            onContribute={onSuccessfulTxn}
          />
        )}
        {context.state.isTransferAllowed && (
          <TransferForm
            context={context}
            transferableFunds={context.state.totalSupply}
            recipientAddress={context.state.recipientAddress}
            onTransfer={onSuccessfulTxn}
          />
        )}
        {userHasWithdrawableFunds && (
          <WithdrawForm
            context={context}
            withdrawableFunds={withdrawableFunds}
            onWithdraw={onSuccessfulTxn}
          />
        )}
      </Forms>
    </div>
  );
}