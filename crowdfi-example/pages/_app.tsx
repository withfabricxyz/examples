import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import type { AppProps } from 'next/app';
import Link from 'next/link';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  goerli,
  mainnet,
  sepolia,
  foundry,
} from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { publicProvider } from 'wagmi/providers/public';
import { configureFabricSDK } from '@withfabric/protocol-sdks';
import styled from 'styled-components';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    mainnet,
    goerli,
    sepolia,
    foundry,
  ],
  [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY! }), publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Fabric Crowdfi SDK Example',
  projectId: 'a32b1eac20bf8c533b7295b5f23ae99b',
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

configureFabricSDK({
  crowdFiFactoryOverrides: {
    5: '0x34EddBA3e781593202C68D2985De34852375F422',
  },
});

const Header = styled.header`
  position: sticky;
  top: 0;
  display: flex;
  flex: 1;
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
`;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} coolMode>
        <Header>
          <Link href="/">Fabric Crowdfi SDK Example</Link>
          <ConnectButton />
        </Header>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
