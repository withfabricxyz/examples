import { useState, useEffect, useCallback, useRef } from 'react';
import { getAccount } from '@wagmi/core';
import { TransactionReceipt, parseEther, zeroAddress } from 'viem';
import { CampaignConfig, prepareCampaignDeployment } from '@withfabric/protocol-sdks';
import styles from 'styles/Home.module.css';
import CurrencyConverter from 'lib/CurrencyConverter';

const converter = new CurrencyConverter();

export default function CampaignDeployer({ isFetching, setIsFetching, onDeploy }: React.PropsWithChildren<{
  isFetching: boolean,
  setIsFetching: (isFetching: boolean) => void,
  onDeploy: (deployedAddress: `0x${string}`) => void,
}>) {
  const [config, setConfig] = useState<CampaignConfig>({
    recipientAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    minGoal: parseEther('1'),
    maxGoal: parseEther('1.25'),
    minContribution: parseEther('0.01'),
    maxContribution: parseEther('1.25'),
    holdOffSeconds: 0,
    durationSeconds: 60 * 60 * 24 * 7,
    erc20TokenAddress: zeroAddress,
  });
  const preparedDeployment = useRef<() => Promise<{ campaignAddress: `0x${string}`, receipt: TransactionReceipt }>>();
  

  async function deployCampaign(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setIsFetching(true);

    if (!preparedDeployment.current) {
      alert('No txn prepared');
      return;
    }

    const { campaignAddress } = await preparedDeployment.current();

    onDeploy(campaignAddress);

    setIsFetching(false);
  }

  const prepareDeployment = useCallback(async () => {
    setIsFetching(true);
    try {
      const prepared = await prepareCampaignDeployment(config);
      preparedDeployment.current = prepared;
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
    <div className={`${styles.mainElement} ${styles.bgDark}`}>
      <form onSubmit={deployCampaign} className={styles.deployForm}>
        <h3>Deploy A Campaign</h3>
        <label className={styles.label}>
          Recipient Address
        </label>
        <input className={styles.input} type="text" value={getAccount().address} disabled />
        <label className={styles.label}>
          Min Goal
        </label>
        <input
          className={styles.input}
          type="number"
          value={converter.tokenToHuman(config.minGoal, 18)}
          onChange={e => setConfig({ ...config, minGoal: parseEther(e.target.value) })}
        />
        <label className={styles.label}>
          Max Goal
        </label>
        <input
          className={styles.input}
          type="number"
          value={converter.tokenToHuman(config.maxGoal, 18)}
          onChange={e => setConfig({ ...config, maxGoal: parseEther(e.target.value) })}
        />
        <label className={styles.label}>
          Min Contribution
        </label>
        <input
          className={styles.input}
          type="number"
          value={converter.tokenToHuman(config.minContribution, 18)}
          onChange={e => setConfig({ ...config, minContribution: parseEther(e.target.value) })}
        />
        <label className={styles.label}>
          Max Contribution
        </label>
        <input
          className={styles.input}
          type="number"
          value={converter.tokenToHuman(config.maxContribution, 18)}
          onChange={e => setConfig({ ...config, maxContribution: parseEther(e.target.value) })}
        />
        <label className={styles.label}>
          Hold Off Seconds
        </label>
        <input className={styles.input} type="number" value={config.holdOffSeconds.toString()} onChange={e => setConfig({ ...config, holdOffSeconds: parseInt(e.target.value) })} />
        <label className={styles.label}>
          Duration Seconds
        </label>
        <input className={styles.input} type="number" value={config.durationSeconds.toString()} onChange={e => setConfig({ ...config, durationSeconds: parseInt(e.target.value) })} />
        <label className={styles.label}>
          ERC20 Token Address (zero address for ETH)
        </label>
        <input className={styles.input} type="text" value={config.erc20TokenAddress} onChange={e => setConfig({ ...config, erc20TokenAddress: e.target.value as `0x${string}` })} />
        <button className={styles.button} type="submit" disabled={isFetching}>{isFetching ? 'Working...' : 'Deploy Campaign'}</button>
      </form>
    </div>
  );
}