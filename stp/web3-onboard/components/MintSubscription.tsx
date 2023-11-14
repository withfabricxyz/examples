import { SubscriptionTokenV1__factory as STPV1 } from '../lib/stp/factories/SubscriptionTokenV1__factory';
import { ethers } from 'ethers';
import { useState } from 'react';
import { buttonStyles } from '../pages';

const styles = {
  display: 'flex',
  'flex-direction': 'column',
  'align-items': 'center',
}

export function MintSubscription({ provider }: { provider: ethers.providers.Web3Provider }) {
  const [txHash, setTxHash] = useState<string | null>(null);

  // Sepolia contract address for minting time on
  const contractAddress = '0x7af52234088c99a4dd0895d8e6ea99db83ffadfe';

  // Mint for the minimum amount of time
  // TODO: Deal with errors! ... And probably switch to wagmi ;)
  async function mint() {
    // Get an ethers instance of the contract to interact with
    const contract = STPV1.connect(contractAddress, provider.getUncheckedSigner());
    const tps = await contract.tps();
    const minPurchaseSeconds = await contract.minPurchaseSeconds();
    const purchasePrice = tps.toBigInt() * minPurchaseSeconds.toBigInt();
    const tx = await contract.mint(purchasePrice, { value: purchasePrice });

    setTxHash(tx.hash);
  };

  return (
    <div style={styles}>
      <button style={buttonStyles} onClick={mint}>Mint</button>
      {txHash && <p>Transaction hash: {txHash}</p>}
    </div>
  );
};