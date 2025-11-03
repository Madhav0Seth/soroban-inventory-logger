import React from 'react'

const stringify = (data) => JSON.stringify(data, (_, v) => (typeof v === 'bigint' ? v.toString() : v), 2)

export default function JSONBlock({ value }) {
	return (
		<pre style={{ background: '#0b1220', color: '#e5e7eb', padding: 12, borderRadius: 8 }}>
			{typeof value === 'string' ? value : stringify(value)}
		</pre>
	)
}
