import { useCallback, useMemo, useState } from 'react'
import { Client, networks } from '/src/packages/inventory_logger/dist/index.js'

export function useClient() {
	const [pubKey, setPubKey] = useState(null)
	const client = useMemo(() => new Client({ ...networks.testnet, rpcUrl: 'https://soroban-testnet.stellar.org' }), [])

	const connect = useCallback(async () => {
		if (!window.freighterApi) throw new Error('Freighter not found.')
		const granted = await window.freighterApi.requestAccess()
		if (!granted) throw new Error('Access not granted in Freighter.')
		const key = await window.freighterApi.getPublicKey()
		const passphrase = networks.testnet.networkPassphrase
		client.options.publicKey = key
		client.options.signTransaction = async (xdr) => window.freighterApi.signTransaction(xdr, { networkPassphrase: passphrase })
		setPubKey(key)
		return key
	}, [client])

	return { client, pubKey, connect }
}
