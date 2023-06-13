import React, { useState, useEffect } from 'react';

type NFTAsset = {
    assetType: number;
    address: string;
    tokenId: number;
    amount: number;
  };
  
  type NativeAsset = {
    assetType: number;
    amount: number;
  };
  
  type Inventory = {
    object: string;
    nftAssets: NFTAsset[];
    nativeAsset: NativeAsset;
    tokenAssets: any[];
  };

const InventoryComponent: React.FC = () => {
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(process.env.NEXT_PUBLIC_ECOSYSTEM_BACKEND_URL + 'auth/inventory', {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
        })
      .then((response) => response.json())
      .then((data: any) => {
        setInventory(data.data as Inventory);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!inventory) {
    return <p>Empty inventory.</p>;
  }

  return (
    <div>
      <br/>
      <h1 className='font-bold'>Collectibles Inventory</h1>
      <br/>
      <ul>
        {inventory.nftAssets.map((asset, index) => (
          <li key={index}>
            <p>Address: {asset.address}</p>
            <p>Token ID: {asset.tokenId}</p>
            <p>Amount: {asset.amount}</p>
            <br/>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryComponent;
