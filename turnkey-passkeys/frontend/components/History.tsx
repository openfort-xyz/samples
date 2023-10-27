"use client";
import { getWalletHistoryUrl } from "@/utils/urls";
import axios from "axios";
import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

async function historyFetcher(url: string): Promise<any> {
  let response = await axios.get(url, { withCredentials: true });

  if (response.status === 200) {
    return response.data;
  } else {
    // Other status codes indicate an error of some sort
    return [];
  }
}

function abbreviateAddress(address: string): string {
  return (
    address.substring(0, 6) +
    "..." +
    address.substring(address.length - 4, address.length)
  );
}

export function History() {
  const { data } = useSWR(getWalletHistoryUrl(), historyFetcher, {
    refreshInterval: 10000,
  });

  const successTransactions = useMemo(() => {
    if (!data) return [];
    return data.history.filter((txn: any) => {
      return txn.response && txn.response.status === 1;
    });
  }, [data]);

  return (
    <>
      {successTransactions.length > 0 ? (
        <>
          <h2 className="text-3xl font-medium favorit m-8">History</h2>

          <div className="table table-auto w-full border-collapse border border-zinc-300">
            <div className="table-header-group text-zinc-500">
              <div className="table-row bg-subtle-accent text-sm">
                <div className="table-cell p-3">Transaction type</div>
                <div className="table-cell p-3">Txn hash</div>
                <div className="table-cell p-3">Gas Cost</div>
              </div>
            </div>
            <div className="table-row-group">
              {successTransactions.map((txn: any) => (
                <div
                  className="table-row h-8 border border-t-1 border-zinc-300"
                  key={txn.response.transactionHash}
                >
                  <div className="table-cell p-3">
                    {
                      <span className="inline-block text-zinc-500 bg-receive-pill rounded-xl p-2">
                        Mint
                      </span>
                    }
                    <Link
                      target="_blank"
                      href={
                        "https://mumbai.polygonscan.com/tx/" +
                        txn.response.transactionHash
                      }
                      title="View on Polyscan"
                      className="inline-block ml-2"
                    >
                      <Image
                        src="/external_link.svg"
                        alt="->"
                        width={16}
                        height={16}
                        priority
                      />
                    </Link>
                  </div>
                  <div className="table-cell p-3 font-mono">
                    {abbreviateAddress(txn.response.transactionHash)}
                  </div>
                  <div className="table-cell p-3 font-mono">
                    {txn.response.gasUsed}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
