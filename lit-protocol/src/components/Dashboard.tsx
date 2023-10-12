import { AuthMethod, IRelayPKP, SessionSigs } from '@lit-protocol/types';
import { ethers } from 'ethers';
import { useState } from 'react';
import { PKPEthersWallet } from '@lit-protocol/pkp-ethers';
import { useRouter } from 'next/router';
import { useDisconnect } from 'wagmi';
import Openfort from '@openfort/openfort-js';
import { IRelayPKPExtended } from '../utils/openfort';

const openfort = new Openfort(process.env.NEXT_PUBLIC_OPENFORT_PUBLIC_KEY!);

interface DashboardProps {
  currentAccount: IRelayPKPExtended;
  sessionSigs: SessionSigs;
}

export default function Dashboard({
  currentAccount,
  sessionSigs,
}: DashboardProps) {
  const [result, setResult] = useState<string>();
  const [verified, setVerified] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  const { disconnectAsync } = useDisconnect();
  const router = useRouter();

  /**
   * Sign a message with current PKP
   */
  async function signMessageWithPKP() {
    setLoading(true);

    try {
      const createAccountRequest = await fetch('/api/collect-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ethAddress: currentAccount.ethAddress }),
      });
      if (createAccountRequest.status === 200) {
        const data = await createAccountRequest.json();
        const pkpWallet = new PKPEthersWallet({
          controllerSessionSigs: sessionSigs,
          pkpPubKey: currentAccount.publicKey,
        });
        await pkpWallet.init();

        const signature = await pkpWallet.signMessage(
          ethers.utils.arrayify(data.nextAction)
        );

        const tin = await openfort.sendSignatureTransactionIntentRequest(
          data.transactionIntentId,
          signature
        );
        if (!tin.response.error) {
          setResult(tin.response.logs[0].transactionHash);
          setVerified(true);
        } else {
          setResult(tin.response.error);
          setVerified(false);
        }
      } else {
        setResult('Error');
        setVerified(false);
      }
    } catch (err) {
      console.error(err);
      setError(err);
    }

    setLoading(false);
  }

  async function handleLogout() {
    try {
      await disconnectAsync();
    } catch (err) {}
    localStorage.removeItem('lit-wallet-sig');
    router.reload();
  }

  return (
    <div className="container">
      <div className="logout-container">
        <button className="btn btn--link" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <h1>Ready for the open web</h1>
      <div className="details-card">
        <p>
          My address:{' '}
          <a
            target="_blank"
            href={
              'https://mumbai.polygonscan.com/address/' +
              currentAccount.smartWalletAddress.toLowerCase()
            }
          >
            {currentAccount.smartWalletAddress.toLowerCase()}
          </a>
        </p>
      </div>
      <div className="divider"></div>
      <div className="message-card">
        <button
          onClick={signMessageWithPKP}
          disabled={loading}
          className={`btn ${
            result ? (verified ? 'btn--success' : 'btn--error') : ''
          } ${loading && 'btn--loading'}`}
        >
          {result ? (
            verified ? (
              <span>Verified ✓</span>
            ) : (
              <span>Failed x</span>
            )
          ) : (
            <span>Mint NFT</span>
          )}
        </button>
        {verified && (
          <div className="details-card">
            <p>
              Transaction:{' '}
              <a
                target="_blank"
                href={'https://mumbai.polygonscan.com/tx/' + result}
              >
                {result}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
