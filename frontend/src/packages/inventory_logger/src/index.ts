import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Typepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
import type { Buffer } from "buffer";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CAKVDQJ4OEC6KXVDUWIACJV37V6MY3PNASD7V6ASCRVNIET2D5HF5UES",
  },
} as const;

export type DataKey =
  | { tag: "ItemCounter"; values: void }
  | { tag: "RentalCounter"; values: void }
  | { tag: "Item"; values: readonly [u64] }
  | { tag: "Rental"; values: readonly [u64] }
  | { tag: "ItemRentals"; values: readonly [u64] }
  | { tag: "UserRentals"; values: readonly [string] };

export interface RentalRecord {
  actual_return_date: Option<u64>;
  deposit_amount: i128;
  expected_return_date: u64;
  is_active: boolean;
  issue_date: u64;
  item_id: u64;
  rental_id: u64;
  renter: string;
}

export interface InventoryItem {
  description: string;
  is_available: boolean;
  item_id: u64;
  name: string;
  owner: string;
  rental_price_per_day: i128;
}

export interface Client {
  /**
   * Construct and simulate a add_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Add a new inventory item
   */
  add_item: (
    {
      owner,
      name,
      description,
      rental_price_per_day,
    }: {
      owner: string;
      name: string;
      description: string;
      rental_price_per_day: i128;
    },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a get_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get item details
   */
  get_item: (
    { item_id }: { item_id: u64 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Option<InventoryItem>>>;

  /**
   * Construct and simulate a get_rental transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get rental details
   */
  get_rental: (
    { rental_id }: { rental_id: u64 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Option<RentalRecord>>>;

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract
   */
  initialize: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<null>>;

  /**
   * Construct and simulate a is_overdue transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Check if item is overdue
   */
  is_overdue: (
    { rental_id }: { rental_id: u64 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<boolean>>;

  /**
   * Construct and simulate a issue_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Issue/rent an item
   */
  issue_item: (
    {
      renter,
      item_id,
      rental_days,
      deposit_amount,
    }: { renter: string; item_id: u64; rental_days: u64; deposit_amount: i128 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a return_item transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Return an item
   */
  return_item: (
    { rental_id, returner }: { rental_id: u64; returner: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<boolean>>;

  /**
   * Construct and simulate a get_item_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of items
   */
  get_item_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a get_item_rentals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all rentals for an item
   */
  get_item_rentals: (
    { item_id }: { item_id: u64 },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<u64>>>;

  /**
   * Construct and simulate a get_rental_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get total number of rentals
   */
  get_rental_count: (options?: {
    /**
     * The fee to pay for the transaction. Default: BASE_FEE
     */
    fee?: number;

    /**
     * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
     */
    timeoutInSeconds?: number;

    /**
     * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
     */
    simulate?: boolean;
  }) => Promise<AssembledTransaction<u64>>;

  /**
   * Construct and simulate a get_user_rentals transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Get all rentals for a user
   */
  get_user_rentals: (
    { user }: { user: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<Array<u64>>>;

  /**
   * Construct and simulate a update_item_availability transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Update item availability manually (owner only)
   */
  update_item_availability: (
    {
      item_id,
      is_available,
      caller,
    }: { item_id: u64; is_available: boolean; caller: string },
    options?: {
      /**
       * The fee to pay for the transaction. Default: BASE_FEE
       */
      fee?: number;

      /**
       * The maximum amount of time to wait for the transaction to complete. Default: DEFAULT_TIMEOUT
       */
      timeoutInSeconds?: number;

      /**
       * Whether to automatically simulate the transaction when constructing the AssembledTransaction. Default: true
       */
      simulate?: boolean;
    },
  ) => Promise<AssembledTransaction<null>>;
}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      },
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options);
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABgAAAAAAAAAAAAAAC0l0ZW1Db3VudGVyAAAAAAAAAAAAAAAADVJlbnRhbENvdW50ZXIAAAAAAAABAAAAAAAAAARJdGVtAAAAAQAAAAYAAAABAAAAAAAAAAZSZW50YWwAAAAAAAEAAAAGAAAAAQAAAAAAAAALSXRlbVJlbnRhbHMAAAAAAQAAAAYAAAABAAAAAAAAAAtVc2VyUmVudGFscwAAAAABAAAAEw==",
        "AAAAAQAAAAAAAAAAAAAADFJlbnRhbFJlY29yZAAAAAgAAAAAAAAAEmFjdHVhbF9yZXR1cm5fZGF0ZQAAAAAD6AAAAAYAAAAAAAAADmRlcG9zaXRfYW1vdW50AAAAAAALAAAAAAAAABRleHBlY3RlZF9yZXR1cm5fZGF0ZQAAAAYAAAAAAAAACWlzX2FjdGl2ZQAAAAAAAAEAAAAAAAAACmlzc3VlX2RhdGUAAAAAAAYAAAAAAAAAB2l0ZW1faWQAAAAABgAAAAAAAAAJcmVudGFsX2lkAAAAAAAABgAAAAAAAAAGcmVudGVyAAAAAAAT",
        "AAAAAQAAAAAAAAAAAAAADUludmVudG9yeUl0ZW0AAAAAAAAGAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAAAxpc19hdmFpbGFibGUAAAABAAAAAAAAAAdpdGVtX2lkAAAAAAYAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAAFHJlbnRhbF9wcmljZV9wZXJfZGF5AAAACw==",
        "AAAAAAAAABhBZGQgYSBuZXcgaW52ZW50b3J5IGl0ZW0AAAAIYWRkX2l0ZW0AAAAEAAAAAAAAAAVvd25lcgAAAAAAABMAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAtkZXNjcmlwdGlvbgAAAAAQAAAAAAAAABRyZW50YWxfcHJpY2VfcGVyX2RheQAAAAsAAAABAAAABg==",
        "AAAAAAAAABBHZXQgaXRlbSBkZXRhaWxzAAAACGdldF9pdGVtAAAAAQAAAAAAAAAHaXRlbV9pZAAAAAAGAAAAAQAAA+gAAAfQAAAADUludmVudG9yeUl0ZW0AAAA=",
        "AAAAAAAAABJHZXQgcmVudGFsIGRldGFpbHMAAAAAAApnZXRfcmVudGFsAAAAAAABAAAAAAAAAAlyZW50YWxfaWQAAAAAAAAGAAAAAQAAA+gAAAfQAAAADFJlbnRhbFJlY29yZA==",
        "AAAAAAAAABdJbml0aWFsaXplIHRoZSBjb250cmFjdAAAAAAKaW5pdGlhbGl6ZQAAAAAAAAAAAAA=",
        "AAAAAAAAABhDaGVjayBpZiBpdGVtIGlzIG92ZXJkdWUAAAAKaXNfb3ZlcmR1ZQAAAAAAAQAAAAAAAAAJcmVudGFsX2lkAAAAAAAABgAAAAEAAAAB",
        "AAAAAAAAABJJc3N1ZS9yZW50IGFuIGl0ZW0AAAAAAAppc3N1ZV9pdGVtAAAAAAAEAAAAAAAAAAZyZW50ZXIAAAAAABMAAAAAAAAAB2l0ZW1faWQAAAAABgAAAAAAAAALcmVudGFsX2RheXMAAAAABgAAAAAAAAAOZGVwb3NpdF9hbW91bnQAAAAAAAsAAAABAAAABg==",
        "AAAAAAAAAA5SZXR1cm4gYW4gaXRlbQAAAAAAC3JldHVybl9pdGVtAAAAAAIAAAAAAAAACXJlbnRhbF9pZAAAAAAAAAYAAAAAAAAACHJldHVybmVyAAAAEwAAAAEAAAAB",
        "AAAAAAAAABlHZXQgdG90YWwgbnVtYmVyIG9mIGl0ZW1zAAAAAAAADmdldF9pdGVtX2NvdW50AAAAAAAAAAAAAQAAAAY=",
        "AAAAAAAAABtHZXQgYWxsIHJlbnRhbHMgZm9yIGFuIGl0ZW0AAAAAEGdldF9pdGVtX3JlbnRhbHMAAAABAAAAAAAAAAdpdGVtX2lkAAAAAAYAAAABAAAD6gAAAAY=",
        "AAAAAAAAABtHZXQgdG90YWwgbnVtYmVyIG9mIHJlbnRhbHMAAAAAEGdldF9yZW50YWxfY291bnQAAAAAAAAAAQAAAAY=",
        "AAAAAAAAABpHZXQgYWxsIHJlbnRhbHMgZm9yIGEgdXNlcgAAAAAAEGdldF91c2VyX3JlbnRhbHMAAAABAAAAAAAAAAR1c2VyAAAAEwAAAAEAAAPqAAAABg==",
        "AAAAAAAAAC5VcGRhdGUgaXRlbSBhdmFpbGFiaWxpdHkgbWFudWFsbHkgKG93bmVyIG9ubHkpAAAAAAAYdXBkYXRlX2l0ZW1fYXZhaWxhYmlsaXR5AAAAAwAAAAAAAAAHaXRlbV9pZAAAAAAGAAAAAAAAAAxpc19hdmFpbGFibGUAAAABAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAA",
      ]),
      options,
    );
  }
  public readonly fromJSON = {
    add_item: this.txFromJSON<u64>,
    get_item: this.txFromJSON<Option<InventoryItem>>,
    get_rental: this.txFromJSON<Option<RentalRecord>>,
    initialize: this.txFromJSON<null>,
    is_overdue: this.txFromJSON<boolean>,
    issue_item: this.txFromJSON<u64>,
    return_item: this.txFromJSON<boolean>,
    get_item_count: this.txFromJSON<u64>,
    get_item_rentals: this.txFromJSON<Array<u64>>,
    get_rental_count: this.txFromJSON<u64>,
    get_user_rentals: this.txFromJSON<Array<u64>>,
    update_item_availability: this.txFromJSON<null>,
  };
}
