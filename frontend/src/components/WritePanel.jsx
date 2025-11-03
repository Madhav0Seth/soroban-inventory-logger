import React from 'react'
import JSONBlock from './JSONBlock.jsx'

export default function WritePanel({ client, requireWallet }) {
	const [owner, setOwner] = React.useState('')
	const [name, setName] = React.useState('')
	const [description, setDescription] = React.useState('')
	const [rentalPrice, setRentalPrice] = React.useState('')
	const [issueRenter, setIssueRenter] = React.useState('')
	const [issueItemId, setIssueItemId] = React.useState('')
	const [rentalDays, setRentalDays] = React.useState('')
	const [depositAmount, setDepositAmount] = React.useState('')
	const [returnRentalId, setReturnRentalId] = React.useState('')
	const [returner, setReturner] = React.useState('')
	const [out, setOut] = React.useState('')

	const addItem = async (e) => { e?.preventDefault(); try { requireWallet(); const tx = await client.add_item({ owner: owner.trim(), name: name.trim(), description: description.trim(), rental_price_per_day: rentalPrice.trim() }); const sent = await tx.signAndSend(); setOut({ method: 'add_item', result: sent.result }); } catch (e) { setOut({ method: 'add_item', error: String(e) }); } }
	const issueItem = async (e) => { e?.preventDefault(); try { requireWallet(); const tx = await client.issue_item({ renter: issueRenter.trim(), item_id: BigInt(issueItemId), rental_days: BigInt(rentalDays), deposit_amount: depositAmount.trim() }); const sent = await tx.signAndSend(); setOut({ method: 'issue_item', result: sent.result }); } catch (e) { setOut({ method: 'issue_item', error: String(e) }); } }
	const returnItem = async (e) => { e?.preventDefault(); try { requireWallet(); const tx = await client.return_item({ rental_id: BigInt(returnRentalId), returner: returner.trim() }); const sent = await tx.signAndSend(); setOut({ method: 'return_item', result: sent.result }); } catch (e) { setOut({ method: 'return_item', error: String(e) }); } }

	return (
		<div className="card" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, margin: '16px 0' }}>
			<h2>Write</h2>
			<p className="muted">These will build, sign with Freighter, submit, and show the final result.</p>
			<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
				<form onSubmit={addItem}>
					<h3>Add Item</h3>
					<label>Owner (StrKey)</label>
					<input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="G..." required />
					<label>Name</label>
					<input value={name} onChange={(e) => setName(e.target.value)} required />
					<label>Description</label>
					<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
					<label>Rental price per day (i128 as string)</label>
					<input value={rentalPrice} onChange={(e) => setRentalPrice(e.target.value)} placeholder="e.g. 10000000" required />
					<button type="submit">Submit add_item</button>
				</form>

				<form onSubmit={issueItem}>
					<h3>Issue Item</h3>
					<label>Renter (StrKey)</label>
					<input value={issueRenter} onChange={(e) => setIssueRenter(e.target.value)} placeholder="G..." required />
					<label>Item ID</label>
					<input type="number" value={issueItemId} onChange={(e) => setIssueItemId(e.target.value)} min={0} required />
					<label>Rental days</label>
					<input type="number" value={rentalDays} onChange={(e) => setRentalDays(e.target.value)} min={1} required />
					<label>Deposit amount (i128 as string)</label>
					<input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="e.g. 50000000" required />
					<button type="submit">Submit issue_item</button>
				</form>
			</div>

			<form onSubmit={returnItem}>
				<h3>Return Item</h3>
				<label>Rental ID</label>
				<input type="number" value={returnRentalId} onChange={(e) => setReturnRentalId(e.target.value)} min={0} required />
				<label>Returner (StrKey)</label>
				<input value={returner} onChange={(e) => setReturner(e.target.value)} placeholder="G..." required />
				<button type="submit">Submit return_item</button>
			</form>
			<JSONBlock value={out} />
		</div>
	)
}
