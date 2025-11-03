import React from 'react'

export default function WalletBar({ status, onConnect, networkInfo }) {
	return (
		<div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: '16px 0' }}>
			<h2>Network</h2>
			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<button onClick={onConnect}>Connect Freighter</button>
				<span>{status}</span>
			</div>
			<pre style={{ background: '#0b1220', color: '#e5e7eb', padding: 12, borderRadius: 8 }}>{JSON.stringify(networkInfo, null, 2)}</pre>
		</div>
	)
}
