import express, { Express, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { GcpKmsSigner } from 'ethers-gcp-kms-signer';
import { utils } from 'ethers';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const apiUrl = process.env.API_URL;
const authSecretToken = process.env.OPENFORT_SECRET_KEY;
const authPublicToken = process.env.OPENFORT_PUBLIC_KEY;

async function sign_userop_hash(userop_hash: string) {
  const kmsCredentials = {
    projectId: process.env.PROJECTID!, // your project id in gcp
    locationId: process.env.LOCATIONID!, // the location where your key ring was created
    keyRingId: process.env.KEYRINGID!, // the id of the key ring
    keyId: process.env.KEYID!, // the name/id of your key in the key ring
    keyVersion: process.env.KEYVERSION!, // the version of the key
  }
  let signer = new GcpKmsSigner(kmsCredentials)
  let address = await signer.getAddress()
  console.log('Address: ', address)
  const signed_message = signer.signMessage(utils.arrayify(userop_hash))
  return signed_message
}

async function sendGetRequest(url: string, params: any, authToken: string): Promise<any> {
  try {
    const response: AxiosResponse = await axios.get(url, {
      params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${authToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

async function sendPostRequest(url: string, data: any, authToken: string): Promise<any> {
  try {
    const response: AxiosResponse = await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${authToken}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

app.get('/', async (req: Request, res: Response) => {
  let result;
  try {
    if(!apiUrl) {
      throw "No API URL provided";
    }
    let endpoint = apiUrl + 'v1/players';
    result = await sendGetRequest(endpoint, '', authSecretToken!);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
  let message = 'Send a request to /FULL_KMS_EXAMPLE to create a transaction intent and sign it using your own KMS.';
  message += '</br></br>If you already have a userOp hash you want to sign, send it using the endpoint /Sign_KMS?userOpHash= to get the signature';
  res.send(message);
  console.log(result);
});

// FULL_KMS_EXAMPLE call:
// It will generate a transaction intent that will later sign using the configured GCP KMS
app.get('/FULL_KMS_EXAMPLE', async (req: Request, res: Response) => {
  let result;
  const requestData = {
    player: process.env.OPENFORT_PLAYER,
    chain_id: process.env.CHAIN_ID,
    optimistic: true,
    interactions: [
      {
        contract: process.env.OPENFORT_CONTRACT,
        function_name: 'mint',
        function_args: ['0x8a16DBD0970D7829C7375eE86E58AC33Ee8ECE4a'],
      },
    ],
    external_owner_address: process.env.EXTERNAL_OWNER_ADDRESS,
    policy: process.env.OPENFORT_POLICY,
  };

  try {
    if(!apiUrl) {
      throw "No API URL provided";
    }
    let endpoint = apiUrl + 'v1/transaction_intents';
    result = await sendPostRequest(endpoint, requestData, authSecretToken!);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
  let userop_hash = result.next_action.payload.user_op_hash
  let tin = result.id
  console.log(userop_hash);
  let response = '1- Sending a POST request to /v1/transaction_intents, so Openfort generates a userOperation for us to sign</br> </br>\n'
  response += '2- Receiving the userOp generated by Openfort. Its hash, that need to be signed to sign by the account owner, is: ' + userop_hash;
  let signed_message = await sign_userop_hash(userop_hash)
  console.log(signed_message);
  response += '</br>  </br>3- Signed userop hash generated by the KMS: ' + signed_message;

  const requestData2 = {
    signature: signed_message
  };

  try {
    if(!apiUrl) {
      throw "No API URL provided";
    }
    let endpoint = apiUrl + 'v1/transaction_intents/' + tin + '/signature';
    result = await sendPostRequest(endpoint, requestData2, authPublicToken!);
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
  response += '</br>  </br>4- Submitting the signature above by sending a POST request to /v1/transaction_intents/transaction_id/signature';
  res.send(response);
});

// Sign_KMS call:
// It will get a userOp hash and sign it using the configured GCP KMS
app.get('/Sign_KMS', async (req: Request, res: Response) => {
  if(!req.query.userOpHash) {
    let error = 'Error: Missing userOpHash parameter.'
    console.error(error);
    res.send(error);
  }
  else if(req.query.userOpHash.length != 66) {
    let error = 'Wrong userOp hash length.'
    console.error(error);
    res.send(error);
  }
  else {
    let userop_hash = req.query.userOpHash as string;
    console.log(userop_hash);
    let response = '1- UserOp hash to sign: ' + userop_hash;
    let signed_message = await sign_userop_hash(userop_hash)
    console.log(signed_message);
    response += '</br>  </br> 2- Signed userop hash: ' + signed_message
    res.send(response);
  }
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
