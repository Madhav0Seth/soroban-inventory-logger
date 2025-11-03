import React from "react";
import { networks } from "/src/packages/inventory_logger/src/index.ts";
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
    <div className="container">
      <div className="header">
        <div className="brand">Inventory Logger</div>
        <span className="badge">Testnet</span>
      </div>
      <p className="muted">
        Connected to Soroban Testnet. Use Freighter to sign write transactions.
      </p>

      <WalletBar
        status={status}
        onConnect={onConnect}
        networkInfo={networkInfo}
        connecting={connecting}
        error={error}
        diagnostics={undefined}
      />
      <div className="grid grid-2">
        <div>
          <ReadPanel client={client} />
        </div>
        <div>
          <WritePanel client={client} requireWallet={requireWallet} />
        </div>
      </div>
    </div>
  );
}
