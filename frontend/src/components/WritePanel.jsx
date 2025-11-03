import React from "react";
import JSONBlock from "./JSONBlock.jsx";

export default function WritePanel({ client, requireWallet }) {
  const [owner, setOwner] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [rentalPrice, setRentalPrice] = React.useState("");
  const [issueRenter, setIssueRenter] = React.useState("");
  const [issueItemId, setIssueItemId] = React.useState("");
  const [rentalDays, setRentalDays] = React.useState("");
  const [depositAmount, setDepositAmount] = React.useState("");
  const [returnRentalId, setReturnRentalId] = React.useState("");
  const [returner, setReturner] = React.useState("");
  const [out, setOut] = React.useState("");

  const debugSend = async (label, assemble) => {
    try {
      const tx = await assemble();
      const sent = await tx.signAndSend();
      setOut({ method: label, result: sent.result });
    } catch (e) {
      setOut({ method: label, error: String(e) });
    }
  };

  const addItem = async (e) => {
    e?.preventDefault();
    try {
      requireWallet();
      await debugSend("add_item", () =>
        client.add_item({
          owner: owner.trim(),
          name: name.trim(),
          description: description.trim(),
          rental_price_per_day: rentalPrice.trim(),
        }),
      );
    } catch {}
  };

  const issueItem = async (e) => {
    e?.preventDefault();
    try {
      requireWallet();
      const renter = issueRenter.trim();
      if (!/^G[A-Z2-7]{55}$/.test(renter)) {
        setOut({
          method: "issue_item",
          error: "Invalid renter address (StrKey expected)",
        });
        return;
      }
      const item_id = BigInt(issueItemId);
      const days = BigInt(rentalDays);
      if (item_id <= 0n || days <= 0n) {
        setOut({
          method: "issue_item",
          error: "Item ID and Rental days must be positive",
        });
        return;
      }
      const sim = await client.get_item({ item_id }, { simulate: true });
      const item = sim.result;
      if (!item) {
        setOut({
          method: "issue_item",
          error: `Item ${item_id.toString()} not found`,
        });
        return;
      }
      if (item && item.is_available === false) {
        setOut({
          method: "issue_item",
          error: "Item is not available for rent",
        });
        return;
      }
      const price = BigInt(item.rental_price_per_day);
      const minDeposit = price * days;
      const provided = BigInt(depositAmount.trim());
      if (provided < minDeposit) {
        setOut({
          method: "issue_item",
          error: `Deposit too low. Minimum required: ${minDeposit.toString()}`,
        });
        return;
      }
      await debugSend("issue_item", () =>
        client.issue_item({
          renter,
          item_id,
          rental_days: days,
          deposit_amount: provided.toString(),
        }),
      );
    } catch (err) {
      setOut({ method: "issue_item", error: String(err) });
    }
  };

  const returnItem = async (e) => {
    e?.preventDefault();
    try {
      requireWallet();
      await debugSend("return_item", () =>
        client.return_item({
          rental_id: BigInt(returnRentalId),
          returner: returner.trim(),
        }),
      );
    } catch {}
  };

  return (
    <div className="card">
      <h2 className="title">Write</h2>
      <p className="muted">
        These will build, sign with Freighter, submit, and show the final
        result.
      </p>
      <div className="grid grid-2">
        <form onSubmit={addItem}>
          <h3>Add Item</h3>
          <label className="label" htmlFor="owner">
            Owner (StrKey)
          </label>
          <input
            id="owner"
            name="owner"
            className="input"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="G..."
            required
          />
          <label className="label" htmlFor="itemName">
            Name
          </label>
          <input
            id="itemName"
            name="itemName"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            className="textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            required
          />
          <label className="label" htmlFor="rentalPrice">
            Rental price per day (i128 as string)
          </label>
          <input
            id="rentalPrice"
            name="rentalPrice"
            className="input"
            value={rentalPrice}
            onChange={(e) => setRentalPrice(e.target.value)}
            placeholder="e.g. 10000000"
            required
          />
          <button className="btn" type="submit">
            Submit add_item
          </button>
        </form>

        <form onSubmit={issueItem}>
          <h3>Issue Item</h3>
          <label className="label" htmlFor="renter">
            Renter (StrKey)
          </label>
          <input
            id="renter"
            name="renter"
            className="input"
            value={issueRenter}
            onChange={(e) => setIssueRenter(e.target.value)}
            placeholder="G..."
            required
          />
          <label className="label" htmlFor="issueItemId">
            Item ID
          </label>
          <input
            id="issueItemId"
            name="issueItemId"
            className="input"
            type="number"
            value={issueItemId}
            onChange={(e) => setIssueItemId(e.target.value)}
            min={0}
            required
          />
          <label className="label" htmlFor="rentalDays">
            Rental days
          </label>
          <input
            id="rentalDays"
            name="rentalDays"
            className="input"
            type="number"
            value={rentalDays}
            onChange={(e) => setRentalDays(e.target.value)}
            min={1}
            required
          />
          <label className="label" htmlFor="depositAmount">
            Deposit amount (i128 as string)
          </label>
          <input
            id="depositAmount"
            name="depositAmount"
            className="input"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="e.g. 50000000"
            required
          />
          <button className="btn" type="submit">
            Submit issue_item
          </button>
        </form>
      </div>

      <form onSubmit={returnItem}>
        <h3>Return Item</h3>
        <label className="label" htmlFor="returnRentalId">
          Rental ID
        </label>
        <input
          id="returnRentalId"
          name="returnRentalId"
          className="input"
          type="number"
          value={returnRentalId}
          onChange={(e) => setReturnRentalId(e.target.value)}
          min={0}
          required
        />
        <label className="label" htmlFor="returner">
          Returner (StrKey)
        </label>
        <input
          id="returner"
          name="returner"
          className="input"
          value={returner}
          onChange={(e) => setReturner(e.target.value)}
          placeholder="G..."
          required
        />
        <button className="btn" type="submit">
          Submit return_item
        </button>
      </form>
      <JSONBlock value={out} />
    </div>
  );
}
