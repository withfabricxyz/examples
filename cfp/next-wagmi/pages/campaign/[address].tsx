import { useEffect, useState } from 'react';
import { getAccount, fetchToken, FetchTokenResult } from '@wagmi/core';
import { TransactionReceipt, zeroAddress } from 'viem';
import { fetchCampaignAccountContext, CampaignAccountContext } from '@withfabric/protocol-sdks';
import styled from 'styled-components';

import { tokenToHuman } from 'lib/currencies';

import ContributeForm from 'components/ContributeForm';
import TransferForm from 'components/TransferForm';
import YieldForm from 'components/YieldForm';
import WithdrawForm from 'components/WithdrawForm';

const Wrap = styled.div`
  width: 75%;
  max-width: 40rem;
  margin: 1rem auto auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Hero = styled.section`
  background-color: rgba(0, 0, 0, 0.03);
  padding: 1rem;
  border-radius: 0.25rem;
`;

const Forms = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export async function getServerSideProps({ params: { address } } : { params: { address: `0x${string}` } }) {
  return {
    props: {
      campaignAddress: address,
    },
  };
}

export default function CampaignDetail({ campaignAddress } : { campaignAddress: `0x${string}` }) {
  const [context, setContext] = useState<CampaignAccountContext | null>();
  const [token, setToken] = useState<FetchTokenResult | null>();
  const account = getAccount().address;

  useEffect(() => {
    (async function getCampaign() {
      if (!campaignAddress || !account) return;
      setContext(await fetchCampaignAccountContext({
        campaignAddress,
        account,
      }));
    })();
  }, [campaignAddress, account]);

  useEffect(() => {
    (async function fetchTokenDetails() {
      if (!context) return;

      if (context.state.erc20Address !== zeroAddress) {
        setToken(await fetchToken({
          address: context.state.erc20Address,
        }));
      }

    })();
  }, [context]);
  
  if (!context) return null;
  
  const isSuccess = (context.state.isGoalMinMet && context.state.isEnded) || context.state.isGoalMaxMet;
  const userHasWithdrawableFunds = context.account.yieldTokenBalance > 0n || (context.state.isEnded && !context.state.isGoalMinMet && context.account.contributionTokenBalance > 0n);
  const withdrawableFunds = isSuccess ? context.account.yieldTokenBalance : context.account.contributionTokenBalance;

  async function onSuccessfulTxn(receipt: TransactionReceipt) {
    alert('txn: ' + receipt.transactionHash);
    setContext(await context!.refresh());
  }

  return (
    <Wrap>
      <Hero>
        <p><strong>Campaign Address:</strong> {context.state.address}</p>
        <p><strong>Raised:</strong> {isSuccess && '🙌'} {tokenToHuman(context.state.totalSupply, token ? token.decimals : 18)} {token?.symbol} {isSuccess && '🥳'}</p>
        <p><strong>Goal:</strong> {tokenToHuman(context.state.goalMin, token ? token.decimals : 18)} {token?.symbol}</p>
        <p><strong>Ends:</strong> {context.state.endsAt?.toLocaleString()} (campaign will end before this date if max goal is met)</p>
        <p><strong>Total Funds Returned (Yield) by Creator:</strong> {tokenToHuman(context.state.yieldTotal, token ? token.decimals : 18)} {token?.symbol}</p>
        <p><strong>Amount this Account can Withdraw:</strong> {tokenToHuman(withdrawableFunds, token ? token.decimals : 18)} {token?.symbol}</p>
      </Hero>
      <Forms>
        {userHasWithdrawableFunds && (
          <WithdrawForm
            context={context}
            token={token}
            withdrawableFunds={withdrawableFunds}
            onWithdraw={onSuccessfulTxn}
          />
        )}
        {/* isYieldAllowed missing? */}
        {isSuccess && !context.state.isTransferAllowed && (
          <YieldForm
            context={context}
            token={token}
            onApprove={onSuccessfulTxn}
            onYield={onSuccessfulTxn}
          />
        )}
        {!context.state.isEnded && context.state.isContributionAllowed && (
          <ContributeForm
            context={context}
            token={token}
            onApprove={onSuccessfulTxn}
            onContribute={onSuccessfulTxn}
          />
        )}
        {context.state.isTransferAllowed && (
          <TransferForm
            context={context}
            token={token}
            transferableFunds={context.state.totalSupply}
            recipientAddress={context.state.recipientAddress}
            onTransfer={onSuccessfulTxn}
          />
        )}
      </Forms>
    </Wrap>
  );
}