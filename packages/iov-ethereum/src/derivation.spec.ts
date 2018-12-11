import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/base-types";
import { Encoding } from "@iov/encoding";

import { isValidAddress, keyToAddress, toChecksumAddress } from "./derivation";

const { fromHex } = Encoding;

describe("derivation", () => {
  describe("isValidAddress", () => {
    it("should check valid addresses", () => {
      // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md#test-cases
      expect(isValidAddress("0x52908400098527886E0F7030069857D2E4169EE7")).toEqual(true);
      expect(isValidAddress("0x8617E340B3D01FA5F11F306F4090FD50E238070D")).toEqual(true);
      expect(isValidAddress("0xde709f2102306220921060314715629080e2fb77")).toEqual(true);
      expect(isValidAddress("0x27b1fdb04752bbc536007a920d24acb045561c26")).toEqual(true);
      expect(isValidAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed")).toEqual(true);
      expect(isValidAddress("0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359")).toEqual(true);
      expect(isValidAddress("0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB")).toEqual(true);
      expect(isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9aDb")).toEqual(true);
    });

    it("rejects malformed addresses", () => {
      // changed some letters from previous test from upper to lowercase and vice versa
      expect(isValidAddress("0x52908400098527886E0F7030069857D2E4169ee7")).toEqual(false);
      expect(isValidAddress("0x8617E340B3D01FA5F11F306F4090FD50e238070d")).toEqual(false);
      expect(isValidAddress("0xde709f2102306220921060314715629080e2FB77")).toEqual(false);
      expect(isValidAddress("0x27b1fdb04752bbc536007a920d24acb045561C26")).toEqual(false);
      expect(isValidAddress("0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAED")).toEqual(false);
      expect(isValidAddress("0xfB6916095ca1df60bB79Ce92cE3Ea74c37C5D359")).toEqual(false);
      expect(isValidAddress("0xdbF03B407c01E7cD3CBea99509d93f8DDDC8C6fb")).toEqual(false);
      expect(isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9ADB")).toEqual(false);
      // to short
      expect(isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b9")).toEqual(false);
      // to long
      expect(isValidAddress("0xD1220A0cf47c7B9Be7A2E6BA89F429762e7b91234")).toEqual(false);
      // not starting with 0x
      expect(isValidAddress("D1220A0cf47c7B9Be7A2E6BA89F429762e7b91234")).toEqual(false);
    });
  });

  describe("toChecksumAddress", () => {
    it("convert address properly", () => {
      // test cases from https://github.com/ethereum/EIPs/blob/master/EIPS/eip-55.md#test-cases
      expect(toChecksumAddress("0x52908400098527886E0F7030069857D2E4169EE7")).toEqual(
        "0x52908400098527886E0F7030069857D2E4169EE7",
      );
      expect(toChecksumAddress("0x8617E340B3D01FA5F11F306F4090FD50E238070D")).toEqual(
        "0x8617E340B3D01FA5F11F306F4090FD50E238070D",
      );
      expect(toChecksumAddress("0xde709f2102306220921060314715629080e2fb77")).toEqual(
        "0xde709f2102306220921060314715629080e2fb77",
      );
      expect(toChecksumAddress("0x27b1fdb04752bbc536007a920d24acb045561c26")).toEqual(
        "0x27b1fdb04752bbc536007a920d24acb045561c26",
      );
      expect(toChecksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toEqual(
        "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
      );
      expect(toChecksumAddress("0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359")).toEqual(
        "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359",
      );
    });
  });

  describe("keyToAddress", () => {
    it("derives addresses properly", () => {
      // Test cases from https://github.com/MaiaVictor/eth-lib/blob/master/test/test.js#L56
      const pubkey: PublicKeyBundle = {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
        ) as PublicKeyBytes,
      };
      expect(keyToAddress(pubkey)).toEqual("0x9d8A62f656a8d1615C1294fd71e9CFb3E4855A4F");
    });

    it("throws error for invalid inputs", () => {
      const pubkeyInvalidAlgo: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: fromHex(
          "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
        ) as PublicKeyBytes,
      };
      const pubkeyInvalidDataLenght: PublicKeyBundle = {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff9923",
        ) as PublicKeyBytes,
      };
      const pubkeyInvalidDataPrefix: PublicKeyBundle = {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "074bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
        ) as PublicKeyBytes,
      };
      expect(() => keyToAddress(pubkeyInvalidAlgo)).toThrowError(/Invalid pubkey data input/);
      expect(() => keyToAddress(pubkeyInvalidDataLenght)).toThrowError(/Invalid pubkey data input/);
      expect(() => keyToAddress(pubkeyInvalidDataPrefix)).toThrowError(/Invalid pubkey data input/);
    });
  });
});
