import { useCallback, useMemo, useState } from "react";
import { Client, networks } from "/src/packages/inventory_logger/dist/index.js";
import {
  isFreighterAvailable,
  connectFreighter,
  getFreighterPublicKey,
  getNetworkDetails,
  signTransaction,
} from "../utils/wallet.js";

export function useClient() {
  const [pubKey, setPubKey] = useState(null);
  const [status, setStatus] = useState("Wallet: not connected");
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [diagnostics, setDiagnostics] = useState({
    origin: location.origin,
    ua: navigator.userAgent,
  });

  const client = useMemo(
    () =>
      new Client({
        ...networks.testnet,
        rpcUrl: "https://soroban-testnet.stellar.org",
      }),
    []
  );

  const ensureFreighterOk = useCallback(async () => {
    if (!(await isFreighterAvailable())) {
      throw new Error(
        "Freighter not available. Ensure the extension is enabled for this site and not in private mode."
      );
    }
    const details = (await getNetworkDetails()) || {};
    setDiagnostics((d) => ({
      ...d,
      freighter: { network: details.network, passphrase: details.networkPassphrase },
    }));
    if (
      details.networkPassphrase &&
      details.networkPassphrase !== networks.testnet.networkPassphrase
    ) {
      throw new Error(
        `Freighter is on a different network: ${
          details.network || details.networkPassphrase
        }. Switch to Testnet.`
      );
    }
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError("");
    try {
      await ensureFreighterOk();
      const key = await connectFreighter();
      const passphrase = networks.testnet.networkPassphrase;
      client.options.publicKey = key;
      client.options.signTransaction = async (xdr) => {
        const res = await signTransaction(xdr, { networkPassphrase: passphrase });
        if (res?.error || !res?.signedTxXdr) throw new Error(res?.error || "Failed to sign");
        return res.signedTxXdr;
      };
      setPubKey(key);
      setStatus(`Wallet: ${key.slice(0, 6)}... connected`);
      return key;
    } catch (e) {
      setStatus("Wallet connect failed");
      setError(String(e));
      throw e;
    } finally {
      setConnecting(false);
    }
  }, [client, ensureFreighterOk]);

  return { client, pubKey, connect, status, error, connecting, diagnostics };
}
