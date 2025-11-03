import React from 'react'

export default function WalletBar({ status, onConnect, networkInfo, connecting = false, error = '', diagnostics }) {
	return (
		<div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: '16px 0' }}>
			<h2>Network</h2>
			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<button onClick={onConnect} disabled={connecting}>{connecting ? 'Connecting…' : 'Connect Freighter'}</button>
				<span>{status}</span>
			</div>
			{error ? <div style={{ color: '#b91c1c', marginTop: 8 }}>{error}</div> : null}
			<pre style={{ background: '#0b1220', color: '#e5e7eb', padding: 12, borderRadius: 8 }}>{JSON.stringify(networkInfo, null, 2)}</pre>
			{diagnostics ? (
				<pre style={{ background: '#111827', color: '#d1d5db', padding: 12, borderRadius: 8, marginTop: 8 }}>
					{JSON.stringify(diagnostics, null, 2)}
				</pre>
			) : null}
		</div>
	)
}
