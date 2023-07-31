import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import styled from 'styled-components';

import CampaignDeployer from 'components/CampaignDeployer';

const Main = styled.main`
  margin: 1rem auto;
  width: 75%;
  max-width: 40rem;
`;

const Hero = styled.section`
  background-color: rgba(0, 0, 0, 0.03);
  padding: 4rem 0 3rem;
  border-radius: 0.25rem;
  margin-bottom: 4rem;

  h1, p {
    width: 75%;
    max-width: 40rem;
    margin: auto auto 1rem auto;
  }
`;

export default function Home() {
  const router = useRouter();
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

      <Hero>
        <h1>Fabric Crowdfi Protocol SDK Example</h1>
        <p>Deploy a Campaign below to interact</p>
        <p>Docs: <Link href="https://docs.withfabric.xyz/crowdfi/deployment" target="_blank" rel="noopener noreferrer">Fabric Crowdfi - Deploying a CrowdFi Contract</Link></p>
      </Hero>

      <Main>
        <CampaignDeployer
          isFetching={isFetching}
          setIsFetching={setIsFetching}
          onDeploy={address => router.push(`/campaign/${address}`)}
        />
      </Main>
    </div>
  );
}
