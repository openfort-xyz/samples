import express, { Express, Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { KeyManagementServiceClient } from "@google-cloud/kms"
import { GcpKmsSigner } from 'ethers-gcp-kms-signer';
import { utils } from 'ethers';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const apiUrl = process.env.API_URL;
const authSecretToken = process.env.OPENFORT_SECRET_KEY;
const authPublicToken = process.env.OPENFORT_PUBLIC_KEY;

const client = new KeyManagementServiceClient()

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
  res.send('Send a request to /KMS to create a transaction intent and sign it using our KMS');
  console.log(result);
});

// KMS call:
// It will generate a transaction intent that will later sign using the GCP KMS
app.get('/KMS', async (req: Request, res: Response) => {
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
  let response = 'Creating a transaction intent by sending a POST request to /v1/transaction_intents </br> </br>\n'
  response += 'UserOp hash to sign: ' + userop_hash;
  let signed_message = await sign_userop_hash(userop_hash)
  console.log(signed_message);
  response += '</br>  </br> Signed userop hash: ' + signed_message
  response += '</br>  </br> Submitting the signature...'

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
  response += result.user_operation_hash;
  res.send(response);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
