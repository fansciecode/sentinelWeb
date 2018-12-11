// Keep all classes requiring libsodium-js in one file as having multiple
// requiring of the libsodium-wrappers module currently crashes browsers
//
// libsodium.js API: https://gist.github.com/webmaster128/b2dbe6d54d36dd168c9fabf441b9b09c

// use require instead of import because of this bug
// https://github.com/jedisct1/libsodium.js/issues/148
import sodium = require("libsodium-wrappers");
import { As } from "type-tagger";

export type Xchacha20poly1305IetfKey = Uint8Array & As<"xchacha20poly1305ietf-key">;
export type Xchacha20poly1305IetfMessage = Uint8Array & As<"xchacha20poly1305ietf-message">;
export type Xchacha20poly1305IetfNonce = Uint8Array & As<"xchacha20poly1305ietf-nonce">;
export type Xchacha20poly1305IetfCiphertext = Uint8Array & As<"xchacha20poly1305ietf-ciphertext">;

export interface Argon2idOptions {
  // in bytes
  readonly outputLength: number;
  // integer between 1 and 4294967295
  readonly opsLimit: number;
  // memory limit measured in KiB (like argon2 command line tool)
  // Note: only ~ 16 MiB of memory are available using the non-sumo version of libsodium
  readonly memLimitKib: number;
}

export class Argon2id {
  public static async execute(
    password: string,
    salt: Uint8Array,
    options: Argon2idOptions,
  ): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.crypto_pwhash(
      options.outputLength,
      password,
      salt, // libsodium only supports 16 byte salts and will throw when you don't respect that
      options.opsLimit,
      options.memLimitKib * 1024,
      sodium.crypto_pwhash_ALG_ARGON2ID13,
    );
  }
}

export class Random {
  // Get `count` bytes of cryptographically secure random bytes
  public static async getBytes(count: number): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.randombytes_buf(count);
  }
}

export class Ed25519Keypair {
  // a libsodium privkey has the format `<ed25519 privkey> + <ed25519 pubkey>`
  public static fromLibsodiumPrivkey(libsodiumPrivkey: Uint8Array): Ed25519Keypair {
    if (libsodiumPrivkey.length !== 64) {
      throw new Error(`Unexpected key length ${libsodiumPrivkey.length}. Must be 64.`);
    }
    return new Ed25519Keypair(libsodiumPrivkey.slice(0, 32), libsodiumPrivkey.slice(32, 64));
  }

  constructor(public readonly privkey: Uint8Array, public readonly pubkey: Uint8Array) {}

  public toLibsodiumPrivkey(): Uint8Array {
    return new Uint8Array([...this.privkey, ...this.pubkey]);
  }
}

export class Ed25519 {
  /**
   * Generates a keypair deterministically from a given 32 bytes seed.
   *
   * This seed equals the Ed25519 private key.
   * For implementation details see crypto_sign_seed_keypair in
   * https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures.html
   * and diagram on https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
   */
  public static async makeKeypair(seed: Uint8Array): Promise<Ed25519Keypair> {
    await sodium.ready;
    const keypair = sodium.crypto_sign_seed_keypair(seed);
    return Ed25519Keypair.fromLibsodiumPrivkey(keypair.privateKey);
  }

  public static async createSignature(message: Uint8Array, keyPair: Ed25519Keypair): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.crypto_sign_detached(message, keyPair.toLibsodiumPrivkey());
  }

  public static async verifySignature(
    signature: Uint8Array,
    message: Uint8Array,
    pubkey: Uint8Array,
  ): Promise<boolean> {
    await sodium.ready;
    return sodium.crypto_sign_verify_detached(signature, message, pubkey);
  }
}

export class Xchacha20poly1305Ietf {
  public static async encrypt(
    message: Xchacha20poly1305IetfMessage,
    key: Xchacha20poly1305IetfKey,
    nonce: Xchacha20poly1305IetfNonce,
  ): Promise<Xchacha20poly1305IetfCiphertext> {
    await sodium.ready;

    const additionalData = undefined;

    return sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
      message,
      additionalData,
      null, // secret nonce: unused and should be null (https://download.libsodium.org/doc/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction)
      nonce,
      key,
    ) as Xchacha20poly1305IetfCiphertext;
  }

  public static async decrypt(
    ciphertext: Xchacha20poly1305IetfCiphertext,
    key: Xchacha20poly1305IetfKey,
    nonce: Xchacha20poly1305IetfNonce,
  ): Promise<Xchacha20poly1305IetfMessage> {
    await sodium.ready;

    const additionalData = undefined;

    return sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
      null, // secret nonce: unused and should be null (https://download.libsodium.org/doc/secret-key_cryptography/aead/chacha20-poly1305/xchacha20-poly1305_construction)
      ciphertext,
      additionalData,
      nonce,
      key,
    ) as Xchacha20poly1305IetfMessage;
  }
}
