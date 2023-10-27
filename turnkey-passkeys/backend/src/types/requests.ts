import { TSignedRequest, TurnkeyApiTypes } from "@turnkey/http";

type TAttestation = TurnkeyApiTypes["v1Attestation"];

export interface RegistrationRequest {
  email: string;
  attestation: TAttestation;
  challenge: string;
  privateKeyName: string;
}

export interface AuthenticationRequest {
  signedWhoamiRequest: TSignedRequest;
}

export interface SignedTurnkeyRequest {
  signedTxnRequest: TSignedRequest;
  transactionIntentId: string;
}

export interface ConstructTxParams {
  destination: string;
  amount: string;
}
