import * as React from 'react'
import {
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

export function AcceptOwnership({accountAddress}: {accountAddress: `0x${string}`}) {
  const { config } = usePrepareContractWrite({
    address: accountAddress,
    abi: [
      {
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: 'acceptOwnership',
  })
  const { data, write } = useContractWrite(config)

  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  })

  return (
    <div>
      <button disabled={!write || isLoading} onClick={() => write!()}>
        {isLoading ? 'Accepting...' : 'Accept custody'}
      </button>
      {isSuccess && (
        <div style={{marginTop:'10px'}}>
          <small>
          Successfully accepted custody.
          <div>
            <a href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}>Polyscan transaction</a>
          </div>
          </small>
        </div>
      )}
    </div>
  )
}
