import React from "react";

export default function WalletBar({
  status,
  onConnect,
  networkInfo,
  connecting = false,
  error = "",
  diagnostics,
}) {
  return (
    <div className="card">
      <h2 className="title">Network</h2>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <button onClick={onConnect} disabled={connecting} className="btn">
          {connecting ? "Connecting…" : "Connect Freighter"}
        </button>
        <span className="badge">{status}</span>
      </div>
      {error ? <div className="banner error">{error}</div> : null}
      <pre>{JSON.stringify(networkInfo, null, 2)}</pre>
    </div>
  );
}
