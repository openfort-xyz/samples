# .NET API Sample

## How to run locally

**1. Clone and configure the sample**

You will need an Openfort account in order to run the demo. Once you set up your account, go to the Openfort [developer dashboard](https://dashboard.openfort.xyz/apikeys) to find your API keys.

In the provided .NET code, you have two environment variables: `OPENFORT_PUBLISHABLE_KEY` and `OPENFORT_SECRET_KEY`.

<details>
<summary>Environment variables for development (your local machine):</summary>

    - **Windows (CMD)**:
      ```
      setx OPENFORT_SECRET_KEY "your_secret_key_here"
      ```

    - **Windows (PowerShell)**:
      ```powershell
      $env:OPENFORT_SECRET_KEY="your_secret_key_here"
      ```

    - **Linux/macOS**:
      ```bash
      export OPENFORT_SECRET_KEY=your_secret_key_here
      ```

    After setting them, you may need to restart any running servers or shells for the variables to take effect.

</details>

<details>
<summary>Environment variables for production:</summary>

    The way you set environment variables depends on your hosting solution:

    - **Azure Web Apps**: You can set them in the "Application settings" pane.
  
    - **Docker**: You can set them using the `-e` flag with `docker run` or in a `docker-compose.yml` file under `environment`.
  
    - **AWS Elastic Beanstalk**: You can set them in the software configuration of your environment.
  
    - **Other Cloud Providers**: Most cloud providers offer a way to set environment variables for applications. Check the documentation of your chosen provider.
</details>


**2. Create a Policy and add a Contract**

[![Required](https://img.shields.io/badge/REQUIRED-TRUE-ORANGE.svg)](https://shields.io/)

You can create Policies and add Contracts in the Dashboard or with the API. This sample requires a Policy and a Contract to run. 

The ID of a [Contract](https://www.openfort.xyz/docs/reference/api/create-contract-object) for your imported smart contract.
If you need a test contract address, use 0x38090d1636069c0ff1Af6bc1737Fb996B7f63AC0 (NFT contract deployed in 80001 Mumbai).

`policyId` is the ID of a [Policy](https://www.openfort.xyz/docs/reference/api/create-a-policy-object) to sponsor gas interactions with the NFT contract. A policy has a contract and chainId. For this demo to work, the policy must have both the contract and the register sessions as rules.

**3. Run locally**

```sh
dotnet run Program.cs
```

## Get support

If you have questions, comments, or need help with code, we're here to help:
- on [Discord](https://discord.com/invite/t7x7hwkJF4)
- on Twitter at [@openfortxyz](https://twitter.com/openfortxyz)
- by [email](mailto:support+github@openfort.xyz)
