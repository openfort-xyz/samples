import { Provider } from "@particle-network/connect";
import { ethers, utils } from "ethers";

export default class EthereumRpc {
    private provider: Provider;
    private web3Provider: ethers.providers.Web3Provider;

    constructor(provider: Provider) {
        this.provider = provider;
        this.web3Provider = new ethers.providers.Web3Provider(this.provider as any);
    }

    private async getSigner() {
        return this.web3Provider.getSigner();
    }

    async signMessage(message: string): Promise<string> {
        try {
            return await (await this.getSigner()).signMessage(utils.arrayify(message));
        } catch (error) {
            return error as string;
        }
    }

}