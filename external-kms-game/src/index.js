"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const kms_1 = require("@google-cloud/kms");
const ethers_gcp_kms_signer_1 = require("ethers-gcp-kms-signer");
const ethers_1 = require("ethers");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT;
const apiUrl = process.env.API_URL;
const authSecretToken = process.env.OPENFORT_SECRET_KEY;
const authPublicToken = process.env.OPENFORT_PUBLIC_KEY;
const client = new kms_1.KeyManagementServiceClient();
function sign_userop_hash(userop_hash) {
    return __awaiter(this, void 0, void 0, function* () {
        const kmsCredentials = {
            projectId: process.env.PROJECTID,
            locationId: process.env.LOCATIONID,
            keyRingId: process.env.KEYRINGID,
            keyId: process.env.KEYID,
            keyVersion: process.env.KEYVERSION, // the version of the key
        };
        let signer = new ethers_gcp_kms_signer_1.GcpKmsSigner(kmsCredentials);
        let address = yield signer.getAddress();
        console.log('Address: ', address);
        const signed_message = signer.signMessage(ethers_1.utils.arrayify(userop_hash));
        return signed_message;
    });
}
function sendGetRequest(url, params, authToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(url, {
                params,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${authToken}`,
                },
            });
            return response.data;
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    });
}
function sendPostRequest(url, data, authToken) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.post(url, data, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Bearer ${authToken}`,
                },
            });
            console.log(response.data);
            return response.data;
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let result;
    try {
        if (!apiUrl) {
            throw "No API URL provided";
        }
        let endpoint = apiUrl + 'v1/players';
        result = yield sendGetRequest(endpoint, '', authSecretToken);
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
    res.send('Send a request to /KMS to sign a transaction intent using our KMS');
    console.log(result);
}));
// KMS call:
// It will generate a transaction intent that will later sign using the GCP KMS
app.get('/KMS', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!apiUrl) {
            throw "No API URL provided";
        }
        let endpoint = apiUrl + 'v1/transaction_intents';
        result = yield sendPostRequest(endpoint, requestData, authSecretToken);
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
    let userop_hash = result.next_action.payload.user_op_hash;
    let tin = result.id;
    console.log(userop_hash);
    let response = 'Creating a transaction intent by sending a POST request to /v1/transaction_intents </br> </br>\n';
    response += 'UserOp hash to sign: ' + userop_hash;
    let signed_message = yield sign_userop_hash(userop_hash);
    console.log(signed_message);
    response += '</br>  </br> Signed userop hash: ' + signed_message;
    response += '</br>  </br> Submitting the signature...';
    const requestData2 = {
        signature: signed_message
    };
    try {
        if (!apiUrl) {
            throw "No API URL provided";
        }
        let endpoint = apiUrl + 'v1/transaction_intents/' + tin + '/signature';
        result = yield sendPostRequest(endpoint, requestData2, authPublicToken);
    }
    catch (error) {
        console.error('Error:', error);
        throw error;
    }
    response += result.user_operation_hash;
    res.send(response);
}));
app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
