import { AppProps } from 'next/app';
import '../styles/globals.css';
import { WagmiConfig, createClient, configureChains } from 'wagmi';
import { goerli, mainnet, optimism } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { StytchProvider } from '@stytch/nextjs';
import { createStytchUIClient } from '@stytch/nextjs/ui';
import { Albert_Sans } from 'next/font/google';

const { provider, chains } = configureChains(
  [mainnet, goerli, optimism],
  [publicProvider()]
);

const client = createClient({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({
      chains,
      options: {
        UNSTABLE_shimOnConnectSelectAccount: true,
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'wagmi',
      },
    }),
  ],
  provider,
});

const stytch = createStytchUIClient(
  process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || ''
);

const font = Albert_Sans({ subsets: ['latin'] });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <StytchProvider stytch={stytch}>
      <WagmiConfig client={client}>
        <main className={font.className}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 12,
            }}
          >
            <h1 className="title">
              <a
                target="_blank"
                href="https://litprotocol.com/"
                rel="noreferrer"
              >
                Lit Protocol
              </a>
              {' & '}
              <a target="_blank" href="https://openfort.xyz" rel="noreferrer">
                Openfort
              </a>
            </h1>
          </div>
          <Component {...pageProps} />
        </main>
        <footer>
          <a
            href="https://github.com/openfort-xyz/samples/tree/main/lit-protocol"
            target="_blank"
            rel="noopener nofollow"
            className="footer-link"
          >
            View the source code
          </a>
        </footer>
      </WagmiConfig>
    </StytchProvider>
  );
}
