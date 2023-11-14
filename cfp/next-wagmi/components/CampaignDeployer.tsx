import { useState, useEffect, useCallback } from 'react';
import { getAccount } from '@wagmi/core';
import { TransactionReceipt, parseEther, zeroAddress } from 'viem';
import { CampaignConfig, prepareCampaignDeployment } from '@withfabric/protocol-sdks';
import styled from 'styled-components';
import { tokenToHuman } from '@lib/currencies';

type PreparedDeployment = {
  campaignAddress: `0x${string}`;
  receipt: TransactionReceipt;
};

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  flex-wrap: nowrap;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
`;

const Label = styled.label`
  display: block;
  width: 100%;
  margin-bottom: 0.325rem;
  font-weight: 500;
`;

const Input = styled.input`
  appearance: none;
  display: block;
  width: 100%;
  margin-bottom: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 0.625rem 0.5rem;
  border-radius: 0.25rem;
  background-color: transparent;

  &:disabled {
    cursor: not-allowed;
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.625rem 0.5rem;
  text-align: center;
  cursor: pointer;
  appearance: none;
  border-color: rgba(17, 125, 69, 1);
  background-color: rgba(17, 125, 69, 1);
  border-width: 1px;
  border-radius: 0.25rem;
  color: white;
  font-weight: 500;

  &:disabled {
    color: #000;
    border-color: rgba(0, 0, 0, 0.1);
    background-color: rgba(0, 0, 0, 0.1); 
    cursor: not-allowed;
  }
`;

export default function CampaignDeployer({ isFetching, setIsFetching, onDeploy }: React.PropsWithChildren<{
  isFetching: boolean,
  setIsFetching: (isFetching: boolean) => void,
  onDeploy: (deployedAddress: `0x${string}`) => void,
}>) {
  const [config, setConfig] = useState<CampaignConfig>({
    recipientAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    minGoal: parseEther('0.1'),
    maxGoal: parseEther('0.125'),
    minContribution: parseEther('0.01'),
    maxContribution: parseEther('0.125'),
    holdOffSeconds: 0,
    durationSeconds: 60 * 60 * 24 * 7,
    erc20TokenAddress: zeroAddress,
  });
  const [preparedDeployment, setPreparedDeployment] = useState<() => Promise<PreparedDeployment>>();
  
  async function deployCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsFetching(true);

    if (!preparedDeployment) {
      alert('No txn prepared');
      return;
    }

    try {
      const { campaignAddress } = await preparedDeployment();
      onDeploy(campaignAddress);
    } catch (error: any) {
      alert(error);
    }

    setIsFetching(false);
  }

  const prepareDeployment = useCallback(async () => {
    setIsFetching(true);
    try {
      const prepared = await prepareCampaignDeployment(config);
      setPreparedDeployment(() => prepared);
    } catch (error) {
      console.log('error', error);
    }
    setIsFetching(false);
  }, [config, setIsFetching]);

  // prepare campaign deployment on config change
  useEffect(() => {
    prepareDeployment();
  }, [prepareDeployment]);
  
  return (
    <Form onSubmit={deployCampaign}>
      <Row>
        <Field>
          <Label>Min Goal</Label>
          <Input
            type="number"
            step="0.01"
            value={tokenToHuman(config.minGoal, 18)}
            onChange={e => setConfig({ ...config, minGoal: parseEther(e.target.value) })}
          />
        </Field>
        <Field>
          <Label>Max Goal</Label>
          <Input
            type="number"
            step="0.01"
            value={tokenToHuman(config.maxGoal, 18)}
            onChange={e => setConfig({ ...config, maxGoal: parseEther(e.target.value) })}
            />
        </Field>
      </Row>

      <Row>
        <Field>
          <Label>Min Contribution</Label>
          <Input
            type="number"
            step="0.01"
            value={tokenToHuman(config.minContribution, 18)}
            onChange={e => setConfig({ ...config, minContribution: parseEther(e.target.value) })}
          />
        </Field>
        <Field>
          <Label>Max Contribution</Label>
          <Input
            type="number"
            step="0.01"
            value={tokenToHuman(config.maxContribution, 18)}
            onChange={e => setConfig({ ...config, maxContribution: parseEther(e.target.value) })}
          />
        </Field>
      </Row>

      <Field>
        <Label>Token Address (zero address for native token)</Label>
        <Input type="text" value={config.erc20TokenAddress} onChange={e => setConfig({ ...config, erc20TokenAddress: e.target.value as `0x${string}` })} />
      </Field>
      
      <Row>
        <Field>
          <Label>Hold Off Seconds</Label>
          <Input type="number" value={config.holdOffSeconds.toString()} onChange={e => setConfig({ ...config, holdOffSeconds: parseInt(e.target.value) })} />
        </Field>
        <Field>
          <Label>Duration Seconds</Label>
          <Input type="number" value={config.durationSeconds.toString()} onChange={e => setConfig({ ...config, durationSeconds: parseInt(e.target.value) })} />
        </Field>
      </Row>

      <Field>
        <Label>Recipient Address</Label>
        <Input type="text" value={getAccount().address} disabled />
      </Field>

      <Button type="submit" disabled={isFetching}>{isFetching ? 'Working...' : 'Deploy Campaign'}</Button>
    </Form>
  );
}