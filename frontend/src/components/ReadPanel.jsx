import React from "react";
import JSONBlock from "./JSONBlock.jsx";

export default function ReadPanel({ client }) {
  const [getItemId, setGetItemId] = React.useState("");
  const [getItemOut, setGetItemOut] = React.useState("");
  const [itemCountOut, setItemCountOut] = React.useState("");
  const [rentalCountOut, setRentalCountOut] = React.useState("");
  const [rentalId, setRentalId] = React.useState("");
  const [getRentalOut, setGetRentalOut] = React.useState("");
  const [itemRentalsItemId, setItemRentalsItemId] = React.useState("");
  const [itemRentalsOut, setItemRentalsOut] = React.useState("");
  const [userAddress, setUserAddress] = React.useState("");
  const [userRentalsOut, setUserRentalsOut] = React.useState("");
  const [isOverdueRentalId, setIsOverdueRentalId] = React.useState("");
  const [isOverdueOut, setIsOverdueOut] = React.useState("");

  const getItem = async (e) => {
    e?.preventDefault();
    try {
      const tx = await client.get_item(
        { item_id: BigInt(getItemId) },
        { simulate: true },
      );
      setGetItemOut(tx.result);
    } catch (e) {
      setGetItemOut({ error: String(e) });
    }
  };
  const getItemCount = async () => {
    try {
      const tx = await client.get_item_count({ simulate: true });
      setItemCountOut(tx.result);
    } catch (e) {
      setItemCountOut({ error: String(e) });
    }
  };
  const getRentalCount = async () => {
    try {
      const tx = await client.get_rental_count({ simulate: true });
      setRentalCountOut(tx.result);
    } catch (e) {
      setRentalCountOut({ error: String(e) });
    }
  };
  const getRental = async (e) => {
    e?.preventDefault();
    try {
      const tx = await client.get_rental(
        { rental_id: BigInt(rentalId) },
        { simulate: true },
      );
      setGetRentalOut(tx.result);
    } catch (e) {
      setGetRentalOut({ error: String(e) });
    }
  };
  const getItemRentals = async (e) => {
    e?.preventDefault();
    try {
      const tx = await client.get_item_rentals(
        { item_id: BigInt(itemRentalsItemId) },
        { simulate: true },
      );
      setItemRentalsOut(tx.result);
    } catch (e) {
      setItemRentalsOut({ error: String(e) });
    }
  };
  const getUserRentals = async (e) => {
    e?.preventDefault();
    try {
      const tx = await client.get_user_rentals(
        { user: userAddress.trim() },
        { simulate: true },
      );
      setUserRentalsOut(tx.result);
    } catch (e) {
      setUserRentalsOut({ error: String(e) });
    }
  };
  const isOverdue = async (e) => {
    e?.preventDefault();
    try {
      const tx = await client.is_overdue(
        { rental_id: BigInt(isOverdueRentalId) },
        { simulate: true },
      );
      setIsOverdueOut(tx.result);
    } catch (e) {
      setIsOverdueOut({ error: String(e) });
    }
  };

  return (
    <>
      <div className="card">
        <h2 className="title">Read: Get Item</h2>
        <form onSubmit={getItem}>
          <label className="label" htmlFor="getItemId">
            Item ID
          </label>
          <input
            id="getItemId"
            name="getItemId"
            className="input"
            type="number"
            value={getItemId}
            onChange={(e) => setGetItemId(e.target.value)}
            min={0}
            required
          />
          <button className="btn" type="submit">
            Get Item
          </button>
        </form>
        <JSONBlock value={getItemOut} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="title">Read: Item Count</h2>
          <button className="btn" onClick={getItemCount}>
            Get Item Count
          </button>
          <JSONBlock value={itemCountOut} />
        </div>
        <div className="card">
          <h2 className="title">Read: Rental Count</h2>
          <button className="btn" onClick={getRentalCount}>
            Get Rental Count
          </button>
          <JSONBlock value={rentalCountOut} />
        </div>
      </div>

      <div className="card">
        <h2 className="title">Read: Get Rental</h2>
        <form onSubmit={getRental}>
          <label className="label" htmlFor="rentalId">
            Rental ID
          </label>
          <input
            id="rentalId"
            name="rentalId"
            className="input"
            type="number"
            value={rentalId}
            onChange={(e) => setRentalId(e.target.value)}
            min={0}
            required
          />
          <button className="btn" type="submit">
            Get Rental
          </button>
        </form>
        <JSONBlock value={getRentalOut} />
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 className="title">Read: Item Rentals</h2>
          <form onSubmit={getItemRentals}>
            <label className="label" htmlFor="itemRentalsItemId">
              Item ID
            </label>
            <input
              id="itemRentalsItemId"
              name="itemRentalsItemId"
              className="input"
              type="number"
              value={itemRentalsItemId}
              onChange={(e) => setItemRentalsItemId(e.target.value)}
              min={0}
              required
            />
            <button className="btn" type="submit">
              Get Item Rentals
            </button>
          </form>
          <JSONBlock value={itemRentalsOut} />
        </div>
        <div className="card">
          <h2 className="title">Read: User Rentals</h2>
          <form onSubmit={getUserRentals}>
            <label className="label" htmlFor="userAddress">
              User Address (StrKey)
            </label>
            <input
              id="userAddress"
              name="userAddress"
              className="input"
              type="text"
              placeholder="G..."
              value={userAddress}
              onChange={(e) => setUserAddress(e.target.value)}
              required
            />
            <button className="btn" type="submit">
              Get User Rentals
            </button>
          </form>
          <JSONBlock value={userRentalsOut} />
        </div>
      </div>

      <div className="card">
        <h2 className="title">Check: Is Overdue</h2>
        <form onSubmit={isOverdue}>
          <label className="label" htmlFor="isOverdueRentalId">
            Rental ID
          </label>
          <input
            id="isOverdueRentalId"
            name="isOverdueRentalId"
            className="input"
            type="number"
            value={isOverdueRentalId}
            onChange={(e) => setIsOverdueRentalId(e.target.value)}
            min={0}
            required
          />
          <button className="btn" type="submit">
            Check
          </button>
        </form>
        <JSONBlock value={isOverdueOut} />
      </div>
    </>
  );
}
