import { getShieldRecoveryBaseUrl } from "../utils/config";

export async function getEncryptionSessionFromEndpoint(): Promise<string> {
  const baseUrl = getShieldRecoveryBaseUrl();
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const endpoint = `${cleanBaseUrl}/api/shield-session`;

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error("[WALLET RECOVERY] Failed to fetch wallet recovery session");
  }

  const data = await response.json();
  return data.session as string;
}
