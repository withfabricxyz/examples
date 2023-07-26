import { ConnectButton } from '@rainbow-me/rainbowkit';
import Head from 'next/head';
import { useState } from 'react';
import { getAccount } from '@wagmi/core';
import styles from '../styles/Home.module.css';
import CampaignDeployer from 'components/CampaignDeployer';
import CampaignViewer from 'components/CampaignViewer';

export default function Home() {
  const [campaignAddress, setCampaignAddress] = useState<`0x${string}` | null>();
  const [isFetching, setIsFetching] = useState<boolean>(false);

  return (
    <div>
      <Head>
        <title>Fabric Crowdfi SDK Example</title>
        <meta name="description" content="Manifest Your Destiny" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>

      <header className={styles.header}>
        <span>Fabric Crowdfi SDK Example</span>
        <ConnectButton />
      </header>

      <main className={styles.main}>
        <CampaignDeployer
          isFetching={isFetching}
          setIsFetching={setIsFetching}
          onDeploy={setCampaignAddress}
        />
        <CampaignViewer
          isFetching={isFetching}
          campaignAddress={campaignAddress}
          account={getAccount().address!}
        />
      </main>

      <footer className={styles.footer}>
      </footer>
    </div>
  );
}
