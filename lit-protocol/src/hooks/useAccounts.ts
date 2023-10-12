import { useCallback, useState } from 'react';
import { AuthMethod } from '@lit-protocol/types';
import { getPKPs, mintPKP } from '../utils/lit';
import { IRelayPKPExtended, createOpenfortAccount, getOpenfortAccounts } from '../utils/openfort';


export default function useAccounts() {
  const [accounts, setAccounts] = useState<IRelayPKPExtended[]>([]);
  const [currentAccount, setCurrentAccount] = useState<IRelayPKPExtended>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error>();

  /**
   * Fetch PKPs tied to given auth method
   */
  const fetchAccounts = useCallback(
    async (authMethod: AuthMethod): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        // Fetch PKPs tied to given auth method
        const myPKPs = await getPKPs(authMethod);
        const myExtendedPKPs = await getOpenfortAccounts(myPKPs);

        setAccounts(myExtendedPKPs);
        // If only one PKP, set as current account
        if (myPKPs.length === 1) {
          setCurrentAccount(myExtendedPKPs[0]);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );


  /**
   * Mint a new PKP for current auth method
   */
  const createAccount = useCallback(
    async (authMethod: AuthMethod): Promise<void> => {
      setLoading(true);
      setError(undefined);
      try {
        const newPKP = await mintPKP(authMethod);
        const accountAddress = await createOpenfortAccount(newPKP.ethAddress);
        console.log('createAccount data: ', accountAddress);
        setAccounts(prev => [...prev, {...newPKP, smartWalletAddress: accountAddress}]);
        setCurrentAccount({...newPKP, smartWalletAddress: accountAddress});
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    fetchAccounts,
    createAccount,
    setCurrentAccount,
    accounts,
    currentAccount,
    createOpenfortAccount,
    loading,
    error,
  };
}
