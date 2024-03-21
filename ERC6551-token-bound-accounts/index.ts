import Openfort, {Interaction} from "@openfort/openfort-node";
import {ethers} from "ethers";
const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY!);

const ERC721_ABI = [
    "function approve(address to, uint256 tokenId) external",
    "function transferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId) external",
    "function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata _data) external",
    "function balanceOf(address owner) external view returns (uint256 balance)",
];

async function Option1() {
    try {
        // Create a player in OF that will own the NFT (owner of the 6551 account)
        const player = await openfort.players.create({
            name: "new player",
        });
        const chainId = 80001;
        const account = await openfort.accounts.create({
            player: player.id,
            chainId: chainId,
        });
        console.log("OF Upgradeable address:", account.address);

        // Add ERC6551Registry to OF
        const ERC6551Registry = await openfort.contracts.create({
            name: "ERC6551Registry",
            address: "0x5881d55A031ee61060c4cf5AF0d055461d1538b1",
            chainId: chainId,
        });
        // Add ExampleERC6551Account721 (implementation) to OF
        const ExampleERC6551Account721 = await openfort.contracts.create({
            name: "ExampleERC6551Account721",
            address: "0x18D09e44C4C39A48c90694021E5D8364367578aF",
            chainId: chainId,
        });
        // Add SimpleNFT to OF
        const SimpleNFT = await openfort.contracts.create({
            name: "SimpleNFT",
            address: "0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0",
            chainId: chainId,
        });
        // Create a policy on OF
        const policy = await openfort.policies.create({
            name: "test",
            chainId: chainId,
            strategy: {
                sponsorSchema: "pay_for_user",
            },
        });
        // Create a policy rule for the ERC6551Registry contract
        await openfort.policyRules.create({
            contract: ERC6551Registry.id,
            type: "contract_functions",
            policy: policy.id,
            functionName: "All functions",
        });
        // Create a policy rule for SimpleNFT
        await openfort.policyRules.create({
            contract: SimpleNFT.id,
            type: "contract_functions",
            policy: policy.id,
            functionName: "All functions",
        });

        // Mint an NFT into the OF account
        const interactionsSimpleNFT: Interaction[] = [
            {
                contract: SimpleNFT.id,
                functionName: "mint",
                functionArgs: [player.id],
            },
        ];
        const transactionIntentSimpleNFT = await openfort.transactionIntents.create({
            player: player.id,
            interactions: interactionsSimpleNFT,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentSimpleNFT.response?.status === 0) {
            console.log(transactionIntentSimpleNFT.response?.error);
            return;
        }

        // Owner of this NFT is owner of the ERC6551Account
        let tokenId;

        if (transactionIntentSimpleNFT.response?.logs) {
            var log = transactionIntentSimpleNFT.response?.logs[7];

            const eventFragment = ethers.utils.Fragment.from(
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            );
            const hexData = log.data;
            const iface = new ethers.utils.Interface([eventFragment]);
            const decodedLog: any = iface.parseLog({
                data: hexData,
                topics: log.topics,
            });
            tokenId = decodedLog.args.tokenId.toNumber();
        }
        console.log("TokenId of the owner NFT minted : ", tokenId);

        const salt = 0;
        const initData = "0x";

        // Create a 6551 account
        const interactionsCreateAccount: Interaction[] = [
            {
                contract: ERC6551Registry.id,
                functionName: "createAccount",
                functionArgs: [ExampleERC6551Account721.id, chainId, SimpleNFT.id, tokenId, salt, initData],
            },
        ];
        const transactionIntentCreateAccount = await openfort.transactionIntents.create({
            player: player.id,
            interactions: interactionsCreateAccount,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentCreateAccount.response?.status === 0) {
            console.log(transactionIntentCreateAccount.response?.error);
            return;
        }

        let ERC6551AccountAddress;
        if (transactionIntentCreateAccount.response?.logs) {
            var log = transactionIntentCreateAccount.response?.logs[1];
            const eventFragment = ethers.utils.Fragment.from(
                "event AccountCreated (address account, address implementation, uint256 chainId, address tokenContract, uint256 tokenId, uint256 salt)",
            );
            const hexData = log.data;
            const iface = new ethers.utils.Interface([eventFragment]);
            const decodedLog: any = iface.parseLog({
                data: hexData,
                topics: log.topics,
            });
            ERC6551AccountAddress = decodedLog.args.account;
        }
        console.log("Address of the 6551 account created : ", ERC6551AccountAddress);

        // Add the newly created 6551 as a contract to OF
        const ERC6551Account = await openfort.contracts.create({
            name: "ERC6551Account",
            address: ERC6551AccountAddress,
            abi: ExampleERC6551Account721.abi,
            chainId: chainId,
        });

        // Add the newly created account to the policy to allow for sponsoring
        await openfort.policyRules.create({
            contract: ERC6551Account.id,
            type: "contract_functions",
            policy: policy.id,
            functionName: "All functions",
        });

        // Mint an NFT into the ERC6551Account
        const interactionsSimpleNFT6551: Interaction[] = [
            {
                contract: SimpleNFT.id,
                functionName: "mint",
                functionArgs: [ERC6551Account.id],
            },
        ];
        const transactionIntentSimpleNFT6551 = await openfort.transactionIntents.create({
            player: player.id,
            interactions: interactionsSimpleNFT6551,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentSimpleNFT6551.response?.status === 0) {
            console.log(transactionIntentSimpleNFT6551.response?.error);
            return;
        }

        let simpleNFT6551TokenId;
        if (transactionIntentSimpleNFT6551.response?.logs) {
            // Should find the tokenId from the logs
            var log = transactionIntentSimpleNFT6551.response?.logs[1];
            const eventFragment = ethers.utils.Fragment.from(
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            );
            const hexData = log.data;
            const iface = new ethers.utils.Interface([eventFragment]);
            const decodedLog: any = iface.parseLog({
                data: hexData,
                topics: log.topics,
            });
            simpleNFT6551TokenId = decodedLog.args.tokenId.toNumber();
        }
        console.log("TokenId of the NFT minted by 6551 account : ", simpleNFT6551TokenId);

        const transferInterface = new ethers.utils.Interface(ERC721_ABI);

        // Approve & SaveTransferFrom from 6551 OF account to player OF account
        const encodedApproveFunctionCall = transferInterface.encodeFunctionData(
            "approve(address to, uint256 tokenId)",
            [account.address, simpleNFT6551TokenId],
        );
        const encodedSafeTransferFromFunctionCall = transferInterface.encodeFunctionData(
            "safeTransferFrom(address from,address to, uint256 tokenId)",
            [ERC6551Account.address, account.address, simpleNFT6551TokenId],
        );

        // Execute the batched call of approve and safeTransferFrom
        const interactionsExecCall: Interaction[] = [
            {
                contract: ERC6551Account.id,
                functionName: "executeCall",
                value: "0",
                functionArgs: [SimpleNFT.id, "0", encodedApproveFunctionCall],
            },
            {
                contract: ERC6551Account.id,
                functionName: "executeCall",
                value: "0",
                functionArgs: [SimpleNFT.id, "0", encodedSafeTransferFromFunctionCall],
            },
        ];
        const transactionIntentExecCall = await openfort.transactionIntents.create({
            player: player.id,
            interactions: interactionsExecCall,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentExecCall.response?.status === 0) {
            console.log(transactionIntentExecCall.response?.error);
            return;
        }

        console.log(transactionIntentExecCall.response);
    } catch (error) {
        console.log(error);
    }
}

async function Option2() {
    try {
        const chainId = 80001;

        // Create a SimpleNFT contract on OF
        const SimpleNFT = await openfort.contracts.create({
            name: "SimpleNFT",
            address: "0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0",
            chainId: chainId,
        });

        // Create a policy on OF
        const policy = await openfort.policies.create({
            name: "test",
            chainId: chainId,
            strategy: {
                sponsorSchema: "pay_for_user",
            },
        });
        // Create a policy rule for the SimpleNFT contract
        await openfort.policyRules.create({
            contract: SimpleNFT.id,
            type: "contract_functions",
            policy: policy.id,
            functionName: "All functions",
        });
        // Create a policy rule for self account interactions
        await openfort.policyRules.create({
            type: "contract_functions",
            policy: policy.id,
        });
        // Create player in OF for the 6551 account
        const player_6551 = await openfort.players.create({
            name: "6551 account",
        });

        // Create player in OF for the upgradeable account
        const player_upgradeable = await openfort.players.create({
            name: "upgradeable account",
        });
        // Create a upgradeable OF account
        const upgradeable_account = await openfort.accounts.create({
            player: player_upgradeable.id,
            chainId: chainId,
        });
        console.log("Upgradeable account address:", upgradeable_account.address);

        // Interaction to mint an NFT into the upgradeable OF account
        const interactionsMintOwnerNFT: Interaction[] = [
            {
                contract: SimpleNFT.id,
                functionName: "mint",
                functionArgs: [player_upgradeable.id],
            },
        ];
        // Execute the minting of the NFT
        const transactionIntentSimpleNFT = await openfort.transactionIntents.create({
            player: player_upgradeable.id,
            interactions: interactionsMintOwnerNFT,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentSimpleNFT.response?.status === 0) {
            console.log(transactionIntentSimpleNFT.response?.error);
            return;
        }

        let simpleOwnerNFTTokenId;
        if (transactionIntentSimpleNFT.response?.logs) {
            // Should find the tokenId from the logs
            var log = transactionIntentSimpleNFT.response?.logs[7];
            const eventFragment = ethers.utils.Fragment.from(
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            );
            const hexData = log.data;
            const iface = new ethers.utils.Interface([eventFragment]);
            const decodedLog: any = iface.parseLog({
                data: hexData,
                topics: log.topics,
            });
            simpleOwnerNFTTokenId = decodedLog.args.tokenId.toNumber();
        }
        console.log("TokenId of the OwnerNFT : ", simpleOwnerNFTTokenId);

        // Create a 6551 - 4337 account in OF
        const account = await openfort.accounts.create({
            player: player_6551.id,
            chainId: chainId,
            accountType: 'ERC6551V1',
            tokenContract: SimpleNFT.id,
            tokenId: simpleOwnerNFTTokenId,
            externalOwnerAddress: upgradeable_account.address,
        });
        console.log("6551 account address:", account.address);

        const ownerAddress = account.ownerAddress;
        console.log("EOA Owner address of 6551 account:", ownerAddress);

        // Execute the batched call of approve and safeTransferFrom from player_upgradeable to ownerAddress
        const interactionsExecCall: Interaction[] = [
            {
                contract: SimpleNFT.id,
                functionName: "approve",
                functionArgs: [ownerAddress, simpleOwnerNFTTokenId],
            },
            {
                contract: SimpleNFT.id,
                functionName: "safeTransferFrom",
                functionArgs: [player_upgradeable.id, ownerAddress, simpleOwnerNFTTokenId],
            },
        ];
        const transactionIntentTransferOwnerNFT = await openfort.transactionIntents.create({
            player: player_upgradeable.id,
            interactions: interactionsExecCall,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });

        if (transactionIntentTransferOwnerNFT.response?.status === 0) {
            console.log(transactionIntentTransferOwnerNFT.response?.error);
            return;
        }

        // Mint an NFT with the 6551 OF account and into the 6551 OF account
        const interactionsMintNFT: Interaction[] = [
            {
                contract: SimpleNFT.id,
                functionName: "mint",
                functionArgs: [player_6551.id],
            },
        ];
        const transactionIntentSimpleNFT6551 = await openfort.transactionIntents.create({
            player: player_6551.id,
            interactions: interactionsMintNFT,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentSimpleNFT6551.response?.status === 0) {
            console.log(transactionIntentSimpleNFT6551.response?.error);
            return;
        }

        // Get the tokenId of the NFT minted
        let simpleNFT6551TokenId;
        if (transactionIntentSimpleNFT6551.response?.logs) {
            // Should find the tokenId from the logs
            var log = transactionIntentSimpleNFT6551.response?.logs[5];
            const eventFragment = ethers.utils.Fragment.from(
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
            );
            const hexData = log.data;
            const iface = new ethers.utils.Interface([eventFragment]);
            const decodedLog: any = iface.parseLog({
                data: hexData,
                topics: log.topics,
            });
            simpleNFT6551TokenId = decodedLog.args.tokenId.toNumber();
        }
        console.log("TokenId of the NFT minted by 6551 account : ", simpleNFT6551TokenId);

        // Approve & SaveTransferFrom from 6551 OF account to upgradeable OF account
        const interactionsNFT: Interaction[] = [
            {
                contract: SimpleNFT.id,
                functionName: "approve",
                functionArgs: [player_upgradeable.id, simpleNFT6551TokenId],
            },
            {
                contract: SimpleNFT.id,
                functionName: "safeTransferFrom",
                functionArgs: [player_6551.id, player_upgradeable.id, simpleNFT6551TokenId],
            },
        ];
        const transactionIntentNFT = await openfort.transactionIntents.create({
            player: player_6551.id,
            interactions: interactionsNFT,
            policy: policy.id,
            chainId: chainId,
            optimistic: false,
        });
        if (transactionIntentNFT.response?.status === 0) {
            console.log(transactionIntentNFT.response?.error);
            return;
        }

        console.log(transactionIntentNFT.response);
    } catch (error) {
        console.log(error);
    }
}

Option2();
