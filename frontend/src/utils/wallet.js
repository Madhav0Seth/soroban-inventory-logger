import {
  isConnected,
  getAddress,
  requestAccess,
  getNetworkDetails,
  signTransaction,
} from "@stellar/freighter-api";

export async function isFreighterAvailable() {
  try {
    const res = await isConnected();
    return !!res?.isConnected;
  } catch {
    return false;
  }
}

export async function connectFreighter() {
  const access = await requestAccess();
  if (!access || access.error)
    throw new Error(access?.error || "Access to Freighter wallet was denied");
  const addr = await getAddress();
  if (addr.error || !addr.address)
    throw new Error(addr.error || "Failed to get address from Freighter");
  return addr.address;
}

export async function getFreighterPublicKey() {
  try {
    const addr = await getAddress();
    if (addr.error || !addr.address) return null;
    return addr.address;
  } catch {
    return null;
  }
}

export { getNetworkDetails, signTransaction };
