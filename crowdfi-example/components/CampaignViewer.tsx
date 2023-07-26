import { fetchCampaignAccountContext, CampaignAccountContext } from '@withfabric/protocol-sdks';
import { useEffect, useState } from 'react';
import { parseEther } from 'viem';
import styled from 'styled-components';
import CurrencyConverter from '@lib/CurrencyConverter';
import styles from 'styles/Home.module.css';

const ContributeForm = styled.form`
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
  padding: 0.625rem 0.5rem;
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
    background-color: rgba(17, 125, 69, 1);
    color: white;
  }
`;

const converter = new CurrencyConverter();

export default function CampaignViewer({ isFetching, campaignAddress, account }: { isFetching: boolean, campaignAddress: `0x${string}` | null | undefined, account: `0x${string}` }) {
  const [context, setContext] = useState<CampaignAccountContext | null>();
  const [contribution, setContribution] = useState<string>('0');
  // const [contributionValues, setContributionValues] = useState<string[]>(context?.account.minAllowedContribution.map(v => v.toString()) || []);
  
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

  async function contribute(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      <h3>Campaign Address</h3>
      <p>{campaignAddress}</p>
      {context && (
        <>
          <h3>Contribute</h3>
          <ContributeForm onSubmit={contribute}>
            <RadioGroup>
              <RadioInput type="radio" name="contribution" value="0" id="contribution-min" onChange={e => setContribution(e.target.value)} />
              <RadioButton htmlFor="contribution-min">{converter.tokenToHuman(context.account.minAllowedContribution, 18)} (min)</RadioButton>
            </RadioGroup>
            <RadioGroup>
              <RadioInput type="radio" name="contribution" value="1" id="contribution-mid" onChange={e => setContribution(e.target.value)} />
              <RadioButton htmlFor="contribution-mid">{Number(converter.tokenToHuman(context.account.maxAllowedContribution, 18)) / 2} (mid)</RadioButton>
            </RadioGroup>
            <RadioGroup>
              <RadioInput type="radio" name="contribution" value="2" id="contribution-max" onChange={e => setContribution(e.target.value)} />
              <RadioButton htmlFor="contribution-max">{converter.tokenToHuman(context.account.maxAllowedContribution, 18)} (max)</RadioButton>
            </RadioGroup>
          </ContributeForm>
        </>
      )}
    </div>
  );
}