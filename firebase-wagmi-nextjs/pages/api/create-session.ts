import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import adminInit from "../../lib/firebaseConfig/init-admin";
import { recoverPersonalSignature } from "@metamask/eth-sig-util";
import Openfort from "@openfort/openfort-node";

const openfort = new Openfort(process.env.NEXTAUTH_OPENFORT_SECRET_KEY!);
type Data = {
  token?: string;
  error?: string;
};

// should verify signature and create a token

const handler: NextApiHandler = async (
  request: NextApiRequest,
  response: NextApiResponse<Data>
) => {
  try {
    if (request.method !== "POST") {
      response.status(403).json({ error: "Endpoint only accepts POST method" });
    }
    if (!request.body.address || !request.body.signedMessage) {
      response.status(400).json({ error: "Missing address or singedMessage" });
    }
    const address = request.body.address;
    const sig = request.body.signedMessage;

    const userDocRef = adminInit.firestore().collection("users").doc(address);
    const userDoc = await userDocRef.get();
    if (userDoc.exists) {
      const existingNonce = userDoc.data()?.nonce;
      const existingAddress = userDoc.data()?.address;
      const existingPlayerOf = userDoc.data()?.playerOf;
      let newOFAccount;
      if (!existingAddress) {
        newOFAccount = await openfort.accounts.create({
          externalOwnerAddress: address,
          chainId: 80001,
          player: existingPlayerOf,
        });
      }
      // Recover the address of the account used to create the given Ethereum signature.
      const recoveredAddress = recoverPersonalSignature({
        data: existingNonce,
        signature: sig,
      });

      // See if that matches the address the user is claiming the signature is from
      if (recoveredAddress === address.toLowerCase()) {
        // The signature was verified - update the nonce to prevent replay attacks
        // update nonce

        await userDocRef.update({
          nonce: Math.floor(Math.random() * 1000000).toString(),
        });
        // Create a custom token for the specified address
        const firebaseToken = await adminInit.auth().createCustomToken(address);
        // Return the token
        response.status(200).json({ token: firebaseToken });
      } else {
        // The signature could not be verified
        response.status(401).json({ error: "Signature could not be verified" });
      }
    } else {
      console.log("user doc does not exist");
      response.status(500).json({ error: "User doc does not exist" });
    }
  } catch (err) {
    console.log(err);
    response.status(401).json({ error: "Invalid login or password" });
  }
};

export default handler;
