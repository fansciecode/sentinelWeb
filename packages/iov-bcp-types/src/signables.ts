import { As } from "type-tagger";

import { ChainId, PostableBytes, PublicKeyBundle, SignatureBytes } from "@iov/base-types";

import { Nonce, UnsignedTransaction, FungibleToken, SessionID } from "./transactions";

/**
 * A printable transaction ID in a blockchain-specific format.
 *
 * In Lisk, this is a uint64 number like 3444561236416494115 and in BNS this is an upper
 * hex encoded 20 byte hash like 3A0DB99E82E11DBB9F987EFCD04264305C2CA6F2. Ethereum uses
 * 0x-prefixed hashes like 0xce8145665aa6ce4c7d01aabffbb610efd03de4d84785840d43b000e1b7e785c3
 */
export type TransactionId = string & As<"transaction-id">;

export type SignableBytes = Uint8Array & As<"signable">;

// Specifies which hash function to apply before signing.
// The identity function is indicated using None.
export enum PrehashType {
  None,
  Sha512,
  Sha256,
  Keccak256,
}

export interface SigningJob {
  readonly bytes: SignableBytes;
  readonly prehashType: PrehashType;
}

// NB: use Buffer or String, we should be consistent....
// I figure string if this will be json dumped, but maybe less efficient
export interface FullSignature {
  readonly nonce: Nonce;
  readonly pubkey: PublicKeyBundle;
  readonly signature: SignatureBytes;
}

/** A signable transaction knows how to serialize itself and how to store signatures */
export interface SignedTransaction<T extends UnsignedTransaction = UnsignedTransaction> {
  /** transaction is the user request */
  readonly transaction: T;

  readonly primarySignature: FullSignature;

  /** signatures can be appended as this is signed */
  readonly otherSignatures: ReadonlyArray<FullSignature>;
}

/** A codec specific address encoded as a string */
export type Address = string & As<"address">;

export interface TxReadCodec {
  /** parseBytes will recover bytes from the blockchain into a format we can use */
  readonly parseBytes: (bytes: PostableBytes, chainId: ChainId) => SignedTransaction;
  /** chain-dependent way to calculate address from key */
  readonly keyToAddress: (key: PublicKeyBundle) => Address;
  /** chain-dependent validation of address */
  readonly isValidAddress: (address: string) => boolean;
}

/** TxCodec knows how to convert Transactions to bytes for a given blockchain */
export interface TxCodec extends TxReadCodec {
  /** these are the bytes we create to add a signature */
  /** they often include nonce and chainID, but not other signatures */
  readonly bytesToSign: (tx: UnsignedTransaction, nonce: Nonce) => SigningJob;
  /** bytesToPost includes the raw transaction appended with the various signatures */
  readonly bytesToPost: (tx: SignedTransaction) => PostableBytes;
  /** identifier is usually some sort of hash of bytesToPost, chain-dependent */
  readonly identifier: (tx: SignedTransaction) => TransactionId;
}
