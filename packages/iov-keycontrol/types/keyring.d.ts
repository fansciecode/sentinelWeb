import { As } from "type-tagger";
import { Wallet, WalletId, WalletImplementationIdString, WalletSerializationString } from "./wallet";
export declare type KeyringSerializationString = string & As<"keyring-serialization">;
export declare type WalletDeserializer = (data: WalletSerializationString) => Wallet;
/**
 * A collection of wallets
 */
export declare class Keyring {
    static registerWalletType(implementationId: WalletImplementationIdString, deserializer: WalletDeserializer): void;
    private static readonly deserializationRegistry;
    private static deserializeWallet;
    private readonly wallets;
    constructor(data?: KeyringSerializationString);
    add(wallet: Wallet): void;
    /**
     * this returns an array with mutable element references. Thus e.g.
     * .getWallets().createIdentity() will change the keyring.
     */
    getWallets(): ReadonlyArray<Wallet>;
    /**
     * Finds a wallet and returns a mutable references. Thus e.g.
     * .getWallet(xyz).createIdentity() will change the keyring.
     *
     * @returns a wallet if ID is found, undefined otherwise
     */
    getWallet(id: WalletId): Wallet | undefined;
    serialize(): KeyringSerializationString;
    clone(): Keyring;
}
