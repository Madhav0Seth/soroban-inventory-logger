import React from "react";
import { networks } from "/src/packages/inventory_logger/dist/index.js";
import { useClient } from "./hooks/useClient.js";
import WalletBar from "./components/WalletBar.jsx";
import ReadPanel from "./components/ReadPanel.jsx";
import WritePanel from "./components/WritePanel.jsx";

export default function App() {
  const { client, pubKey, connect, status, error, connecting, diagnostics } =
    useClient();
  const networkInfo = React.useMemo(
    () => ({
      networkPassphrase: networks.testnet.networkPassphrase,
      contractId: networks.testnet.contractId,
    }),
    []
  );

  const onConnect = async () => {
    try {
      await connect();
    } catch (_) {}
  };

  const requireWallet = () => {
    if (!pubKey) throw new Error("Connect Freighter first");
  };

  return (
    <div
      style={{
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, "Helvetica Neue", Arial',
        margin: "2rem",
        lineHeight: 1.4,
      }}
    >
      <h1>Inventory Logger</h1>
      <p className="muted">
        Connected to Soroban Testnet. Use Freighter to sign write transactions.
      </p>

      <WalletBar
        status={status}
        onConnect={onConnect}
        networkInfo={networkInfo}
        connecting={connecting}
        error={error}
        diagnostics={diagnostics}
      />
      <ReadPanel client={client} />
      <WritePanel client={client} requireWallet={requireWallet} />
    </div>
  );
}
