/* tslint:disable:no-bitwise */
import since = require("jasmine2-custom-message");

import { Chacha20poly1305Ietf, Ed25519, Encoding, Random, Secp256k1, Sha256 } from "../src/crypto";

const toHex = Encoding.toHex;
const fromHex = Encoding.fromHex;

describe("Crypto", () => {
  describe("Encoding", () => {
    it("encodes to hex", () => {
      expect(Encoding.toHex(new Uint8Array([]))).toEqual("");
      expect(Encoding.toHex(new Uint8Array([0x00]))).toEqual("00");
      expect(Encoding.toHex(new Uint8Array([0x01]))).toEqual("01");
      expect(Encoding.toHex(new Uint8Array([0x10]))).toEqual("10");
      expect(Encoding.toHex(new Uint8Array([0x11]))).toEqual("11");
      expect(Encoding.toHex(new Uint8Array([0x11, 0x22, 0x33]))).toEqual("112233");
      expect(Encoding.toHex(new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]))).toEqual("0123456789abcdef");
    });

    it("decodes from hex", () => {
      // simple
      expect(Encoding.fromHex("")).toEqual(new Uint8Array([]));
      expect(Encoding.fromHex("00")).toEqual(new Uint8Array([0x00]));
      expect(Encoding.fromHex("01")).toEqual(new Uint8Array([0x01]));
      expect(Encoding.fromHex("10")).toEqual(new Uint8Array([0x10]));
      expect(Encoding.fromHex("11")).toEqual(new Uint8Array([0x11]));
      expect(Encoding.fromHex("112233")).toEqual(new Uint8Array([0x11, 0x22, 0x33]));
      expect(Encoding.fromHex("0123456789abcdef")).toEqual(new Uint8Array([0x01, 0x23, 0x45, 0x67, 0x89, 0xab, 0xcd, 0xef]));

      // capital letters
      expect(Encoding.fromHex("AA")).toEqual(new Uint8Array([0xaa]));
      expect(Encoding.fromHex("aAbBcCdDeEfF")).toEqual(new Uint8Array([0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff]));

      // error
      expect(() => {
        Encoding.fromHex("a");
      }).toThrow();
      expect(() => {
        Encoding.fromHex("aaa");
      }).toThrow();
      expect(() => {
        Encoding.fromHex("a!");
      }).toThrow();
      expect(() => {
        Encoding.fromHex("a ");
      }).toThrow();
      expect(() => {
        Encoding.fromHex("aa ");
      }).toThrow();
      expect(() => {
        Encoding.fromHex(" aa");
      }).toThrow();
      expect(() => {
        Encoding.fromHex("a a");
      }).toThrow();
      expect(() => {
        Encoding.fromHex("gg");
      }).toThrow();
    });
  });

  describe("Random", () => {
    it("creates random bytes", () => {
      (async () => {
        {
          const bytes = await Random.getBytes(0);
          expect(bytes.length).toEqual(0);
        }

        {
          const bytes = await Random.getBytes(1);
          expect(bytes.length).toEqual(1);
        }

        {
          const bytes = await Random.getBytes(32);
          expect(bytes.length).toEqual(32);
        }

        {
          const bytes = await Random.getBytes(4096);
          expect(bytes.length).toEqual(4096);
        }

        {
          const bytes1 = await Random.getBytes(32);
          const bytes2 = await Random.getBytes(32);
          expect(bytes1).not.toEqual(bytes2);
        }
      })();
    });
  });

  describe("Ed25519", () => {
    it("exists", () => {
      expect(Ed25519).toBeTruthy();
    });

    it("generates keypairs", done => {
      (async () => {
        {
          // ok
          const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
          const keypair = await Ed25519.generateKeypair(seed);
          expect(keypair).toBeTruthy();
          expect(keypair.pubkey).toBeTruthy();
          expect(keypair.privkey).toBeTruthy();
          expect(keypair.pubkey.byteLength).toEqual(32);
          expect(keypair.privkey.byteLength).toEqual(64);
        }

        {
          // seed too short
          const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0");
          await Ed25519.generateKeypair(seed)
            .then(() => {
              fail("promise must not resolve");
            })
            .catch(error => {
              expect(error.message).toContain("invalid seed length");
            });
        }

        {
          // seed too long
          const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9aa");
          await Ed25519.generateKeypair(seed)
            .then(() => {
              fail("promise must not resolve");
            })
            .catch(error => {
              expect(error.message).toContain("invalid seed length");
            });
        }

        done();
      })();
    });

    it("generates keypairs deterministically", done => {
      (async () => {
        const seedA1 = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const seedA2 = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const seedB1 = fromHex("c0c42a0276d456ee007faae2cc7d1bc8925dd74983726d548e10da14c3aed12a");
        const seedB2 = fromHex("c0c42a0276d456ee007faae2cc7d1bc8925dd74983726d548e10da14c3aed12a");

        const keypairA1 = await Ed25519.generateKeypair(seedA1);
        const keypairA2 = await Ed25519.generateKeypair(seedA2);
        const keypairB1 = await Ed25519.generateKeypair(seedB1);
        const keypairB2 = await Ed25519.generateKeypair(seedB2);

        expect(keypairA1).toEqual(keypairA2);
        expect(keypairB1).toEqual(keypairB2);
        expect(keypairA1).not.toEqual(keypairB1);
        expect(keypairA2).not.toEqual(keypairB2);

        done();
      })();
    });

    it("creates signatures", done => {
      (async () => {
        const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Ed25519.generateKeypair(seed);
        const message = new Uint8Array([0x11, 0x22]);
        const signature = await Ed25519.createSignature(message, keypair.privkey);
        expect(signature).toBeTruthy();
        expect(signature.byteLength).toEqual(64);

        done();
      })();
    });

    it("creates signatures deterministically", done => {
      (async () => {
        const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Ed25519.generateKeypair(seed);
        const message = new Uint8Array([0x11, 0x22]);

        const signature1 = await Ed25519.createSignature(message, keypair.privkey);
        const signature2 = await Ed25519.createSignature(message, keypair.privkey);
        expect(signature1).toEqual(signature2);

        done();
      })();
    });

    it("verifies signatures", done => {
      (async () => {
        const seed = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Ed25519.generateKeypair(seed);
        const message = new Uint8Array([0x11, 0x22]);
        const signature = await Ed25519.createSignature(message, keypair.privkey);

        {
          // valid
          const ok = await Ed25519.verifySignature(signature, message, keypair.pubkey);
          expect(ok).toEqual(true);
        }

        {
          // message corrupted
          const corruptedMessage = message.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const ok = await Ed25519.verifySignature(signature, corruptedMessage, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        {
          // signature corrupted
          const corruptedSignature = signature.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const ok = await Ed25519.verifySignature(corruptedSignature, message, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        {
          // wrong pubkey
          const otherSeed = fromHex("91099374790843e29552c3cfa5e9286d6c77e00a2c109aaf3d0a307081314a09");
          const wrongPubkey = (await Ed25519.generateKeypair(otherSeed)).pubkey;
          const ok = await Ed25519.verifySignature(signature, message, wrongPubkey);
          expect(ok).toEqual(false);
        }

        done();
      })();
    });

    it("works with RFC8032 test vectors", done => {
      (async () => {
        {
          // TEST 1 from https://tools.ietf.org/html/rfc8032#section-7.1
          const privkey = fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a");
          const pubkey = fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a");
          const message = fromHex("");
          const signature = await Ed25519.createSignature(message, privkey);
          expect(signature).toEqual(fromHex("e5564300c360ac729086e2cc806e828a84877f1eb8e5d974d873e065224901555fb8821590a33bacc61e39701cf9b46bd25bf5f0595bbe24655141438e7a100b"));
          const valid = await Ed25519.verifySignature(signature, message, pubkey);
          expect(valid).toEqual(true);
        }

        {
          // TEST 2 from https://tools.ietf.org/html/rfc8032#section-7.1
          const privkey = fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c");
          const pubkey = fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c");
          const message = fromHex("72");
          const signature = await Ed25519.createSignature(message, privkey);
          expect(signature).toEqual(fromHex("92a009a9f0d4cab8720e820b5f642540a2b27b5416503f8fb3762223ebdb69da085ac1e43e15996e458f3613d0f11d8c387b2eaeb4302aeeb00d291612bb0c00"));
          const valid = await Ed25519.verifySignature(signature, message, pubkey);
          expect(valid).toEqual(true);
        }

        {
          // TEST 3 from https://tools.ietf.org/html/rfc8032#section-7.1
          const privkey = fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025");
          const pubkey = fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025");
          const message = fromHex("af82");
          const signature = await Ed25519.createSignature(message, privkey);
          expect(signature).toEqual(fromHex("6291d657deec24024827e69c3abe01a30ce548a284743a445e3680d7db5ac3ac18ff9b538d16f290ae67f760984dc6594a7c15e9716ed28dc027beceea1ec40a"));
          const valid = await Ed25519.verifySignature(signature, message, pubkey);
          expect(valid).toEqual(true);
        }

        {
          // TEST 1024 from https://tools.ietf.org/html/rfc8032#section-7.1
          const privkey = fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e");
          const pubkey = fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e");
          const message = fromHex("08b8b2b733424243760fe426a4b54908632110a66c2f6591eabd3345e3e4eb98fa6e264bf09efe12ee50f8f54e9f77b1e355f6c50544e23fb1433ddf73be84d879de7c0046dc4996d9e773f4bc9efe5738829adb26c81b37c93a1b270b20329d658675fc6ea534e0810a4432826bf58c941efb65d57a338bbd2e26640f89ffbc1a858efcb8550ee3a5e1998bd177e93a7363c344fe6b199ee5d02e82d522c4feba15452f80288a821a579116ec6dad2b3b310da903401aa62100ab5d1a36553e06203b33890cc9b832f79ef80560ccb9a39ce767967ed628c6ad573cb116dbefefd75499da96bd68a8a97b928a8bbc103b6621fcde2beca1231d206be6cd9ec7aff6f6c94fcd7204ed3455c68c83f4a41da4af2b74ef5c53f1d8ac70bdcb7ed185ce81bd84359d44254d95629e9855a94a7c1958d1f8ada5d0532ed8a5aa3fb2d17ba70eb6248e594e1a2297acbbb39d502f1a8c6eb6f1ce22b3de1a1f40cc24554119a831a9aad6079cad88425de6bde1a9187ebb6092cf67bf2b13fd65f27088d78b7e883c8759d2c4f5c65adb7553878ad575f9fad878e80a0c9ba63bcbcc2732e69485bbc9c90bfbd62481d9089beccf80cfe2df16a2cf65bd92dd597b0707e0917af48bbb75fed413d238f5555a7a569d80c3414a8d0859dc65a46128bab27af87a71314f318c782b23ebfe808b82b0ce26401d2e22f04d83d1255dc51addd3b75a2b1ae0784504df543af8969be3ea7082ff7fc9888c144da2af58429ec96031dbcad3dad9af0dcbaaaf268cb8fcffead94f3c7ca495e056a9b47acdb751fb73e666c6c655ade8297297d07ad1ba5e43f1bca32301651339e22904cc8c42f58c30c04aafdb038dda0847dd988dcda6f3bfd15c4b4c4525004aa06eeff8ca61783aacec57fb3d1f92b0fe2fd1a85f6724517b65e614ad6808d6f6ee34dff7310fdc82aebfd904b01e1dc54b2927094b2db68d6f903b68401adebf5a7e08d78ff4ef5d63653a65040cf9bfd4aca7984a74d37145986780fc0b16ac451649de6188a7dbdf191f64b5fc5e2ab47b57f7f7276cd419c17a3ca8e1b939ae49e488acba6b965610b5480109c8b17b80e1b7b750dfc7598d5d5011fd2dcc5600a32ef5b52a1ecc820e308aa342721aac0943bf6686b64b2579376504ccc493d97e6aed3fb0f9cd71a43dd497f01f17c0e2cb3797aa2a2f256656168e6c496afc5fb93246f6b1116398a346f1a641f3b041e989f7914f90cc2c7fff357876e506b50d334ba77c225bc307ba537152f3f1610e4eafe595f6d9d90d11faa933a15ef1369546868a7f3a45a96768d40fd9d03412c091c6315cf4fde7cb68606937380db2eaaa707b4c4185c32eddcdd306705e4dc1ffc872eeee475a64dfac86aba41c0618983f8741c5ef68d3a101e8a3b8cac60c905c15fc910840b94c00a0b9d0");
          const signature = await Ed25519.createSignature(message, privkey);
          expect(signature).toEqual(fromHex("0aab4c900501b3e24d7cdf4663326a3a87df5e4843b2cbdb67cbf6e460fec350aa5371b1508f9f4528ecea23c436d94b5e8fcd4f681e30a6ac00a9704a188a03"));
          const valid = await Ed25519.verifySignature(signature, message, pubkey);
          expect(valid).toEqual(true);
        }

        done();
      })();
    });
  });

  describe("Secp256k1", () => {
    // How to generate Secp256k1 test vectors:
    // $ git clone https://github.com/pyca/cryptography.git && cd cryptography
    // $ python2 -m virtualenv venv
    // $ source venv/bin/activate
    // $ pip install cryptography cryptography_vectors pytest ecdsa
    // $ curl https://patch-diff.githubusercontent.com/raw/webmaster128/cryptography/pull/1.diff | git apply
    // $ python ./docs/development/custom-vectors/secp256k1/generate_secp256k1.py > secp256k1_test_vectors.txt

    it("can load private keys", done => {
      (async () => {
        expect(await Secp256k1.makeKeypair(fromHex("5eaf4344dab73d0caee1fd03607bb969074fb217f076896c2125f8607feab7b1"))).toBeTruthy();
        expect(await Secp256k1.makeKeypair(fromHex("f7ac570ea2844e29e7f3b3c6a724ee1f47d3de8c2175a69abae94ae871573d0e"))).toBeTruthy();
        expect(await Secp256k1.makeKeypair(fromHex("e4ade2a5232a7c6f37e7b854a774e25e6047ee7c6d63e8304ae04fa190bc1732"))).toBeTruthy();

        // smallest and largest allowed values: 1 and N-1 (from https://crypto.stackexchange.com/a/30273)
        expect(await Secp256k1.makeKeypair(fromHex("0000000000000000000000000000000000000000000000000000000000000001"))).toBeTruthy();
        expect(await Secp256k1.makeKeypair(fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364140"))).toBeTruthy();

        // too short and too long
        await Secp256k1.makeKeypair(fromHex("e4ade2a5232a7c6f37e7b854a774e25e6047ee7c6d63e8304ae04fa190bc17"))
          .then(() => {
            fail("promise must be rejected");
          })
          .catch(error => {
            expect(error.message).toContain("not a valid secp256k1 private key");
          });
        await Secp256k1.makeKeypair(fromHex("e4ade2a5232a7c6f37e7b854a774e25e6047ee7c6d63e8304ae04fa190bc1732aa"))
          .then(() => {
            fail("promise must be rejected");
          })
          .catch(error => {
            expect(error.message).toContain("not a valid secp256k1 private key");
          });
        // value out of range (too small)
        await Secp256k1.makeKeypair(fromHex("0000000000000000000000000000000000000000000000000000000000000000"))
          .then(() => {
            fail("promise must be rejected");
          })
          .catch(error => {
            expect(error.message).toContain("not a valid secp256k1 private key");
          });
        // value out of range (>= n)
        await Secp256k1.makeKeypair(fromHex("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"))
          .then(() => {
            fail("promise must be rejected");
          })
          .catch(error => {
            expect(error.message).toContain("not a valid secp256k1 private key");
          });
        await Secp256k1.makeKeypair(fromHex("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141"))
          .then(() => {
            fail("promise must be rejected");
          })
          .catch(error => {
            expect(error.message).toContain("not a valid secp256k1 private key");
          });

        done();
      })().catch(error => {
        setTimeout(() => {
          throw error;
        });
      });
    });

    it("creates signatures", done => {
      (async () => {
        const privkey = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Secp256k1.makeKeypair(privkey);
        const message = new Uint8Array([0x11, 0x22]);
        const signature = await Secp256k1.createSignature(message, keypair.privkey);
        expect(signature).toBeTruthy();
        expect(signature.byteLength).toBeGreaterThanOrEqual(70);
        expect(signature.byteLength).toBeLessThanOrEqual(72);

        done();
      })().catch(error => {
        setTimeout(() => {
          throw error;
        });
      });
    });

    it("creates signatures deterministically", done => {
      (async () => {
        const privkey = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Secp256k1.makeKeypair(privkey);
        const message = new Uint8Array([0x11, 0x22]);

        const signature1 = await Secp256k1.createSignature(message, keypair.privkey);
        const signature2 = await Secp256k1.createSignature(message, keypair.privkey);
        expect(signature1).toEqual(signature2);

        done();
      })().catch(error => {
        setTimeout(() => {
          throw error;
        });
      });
    });

    it("verifies signatures", done => {
      (async () => {
        const privkey = fromHex("43a9c17ccbb0e767ea29ce1f10813afde5f1e0a7a504e89b4d2cc2b952b8e0b9");
        const keypair = await Secp256k1.makeKeypair(privkey);
        const message = new Uint8Array([0x11, 0x22]);
        const signature = await Secp256k1.createSignature(message, keypair.privkey);

        {
          // valid
          const ok = await Secp256k1.verifySignature(signature, message, keypair.pubkey);
          expect(ok).toEqual(true);
        }

        {
          // message corrupted
          const corruptedMessage = message.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const ok = await Secp256k1.verifySignature(signature, corruptedMessage, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        {
          // signature corrupted
          const corruptedSignature = signature.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const ok = await Secp256k1.verifySignature(corruptedSignature, message, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        {
          // wrong pubkey
          const otherPrivkey = fromHex("91099374790843e29552c3cfa5e9286d6c77e00a2c109aaf3d0a307081314a09");
          const wrongPubkey = (await Secp256k1.makeKeypair(otherPrivkey)).pubkey;
          const ok = await Secp256k1.verifySignature(signature, message, wrongPubkey);
          expect(ok).toEqual(false);
        }

        done();
      })().catch(error => {
        setTimeout(() => {
          throw error;
        });
      });
    });

    it("verifies unnormalized pyca/cryptography signatures", done => {
      (async () => {
        // signatures are mixed lowS and non-lowS
        const data: ReadonlyArray<any> = [
          {
            message: fromHex("5c868fedb8026979ebd26f1ba07c27eedf4ff6d10443505a96ecaf21ba8c4f0937b3cd23ffdc3dd429d4cd1905fb8dbcceeff1350020e18b58d2ba70887baa3a9b783ad30d3fbf210331cdd7df8d77defa398cdacdfc2e359c7ba4cae46bb74401deb417f8b912a1aa966aeeba9c39c7dd22479ae2b30719dca2f2206c5eb4b7"),
            privkey: fromHex("21142a7e90031ea750c9fa1ba1beae16782386be438133bd43195826ae2e25f0"),
            signature: fromHex("30440220207082eb2c3dfa0b454e0906051270ba4074ac93760ba9e7110cd94714751111022051eb0dbbc9920e72146fb564f99d039802bf6ef2561446eb126ef364d21ee9c4"),
          },
          {
            message: fromHex("17cd4a74d724d55355b6fb2b0759ca095298e3fd1856b87ca1cb2df5409058022736d21be071d820b16dfc441be97fbcea5df787edc886e759475469e2128b22f26b82ca993be6695ab190e673285d561d3b6d42fcc1edd6d12db12dcda0823e9d6079e7bc5ff54cd452dad308d52a15ce9c7edd6ef3dad6a27becd8e001e80f"),
            privkey: fromHex("824282b6069fe3df857ce37204df4312c35750ee7a0f5e5fd8181666d5e46fb2"),
            signature: fromHex("30440220626d61b7be1488b563e8a85bfb623b2331903964b5c0476c9f9ad29144f076fe02202002a2c0ab5e48626bf761cf677dfeede9c7309d2436d4b8c2b89f21ee2ebc6a"),
          },
          {
            message: fromHex("db0d31717b04802adbbae1997487da8773440923c09b869e12a57c36dda34af11b8897f266cd81c02a762c6b74ea6aaf45aaa3c52867eb8f270f5092a36b498f88b65b2ebda24afe675da6f25379d1e194d093e7a2f66e450568dbdffebff97c4597a00c96a5be9ba26deefcca8761c1354429622c8db269d6a0ec0cc7a8585c"),
            privkey: fromHex("5c0da42cec87a6b7a173514965343c30013386c0fe9b39203ed7af43ea425944"),
            signature: fromHex("304602210083de9be443bcf480892b8c8ca1d5ee65c79a315642c3f7b5305aff3065fda2780221009747932122b93cec42cad8ee4630a8f6cbe127578b8c495b4ab927275f657658"),
          },
          {
            message: fromHex("47c9deddfd8c841a63a99be96e972e40fa035ae10d929babfc86c437b9d5d495577a45b7f8a35ce3f880e7d8ae8cd8eb685cf41f0506e68046ccf5559232c674abb9c3683829dcc8002683c4f4ca3a29a7bfde20d96dd0f1a0ead847dea18f297f220f94932536ca4deacedc2c6701c3ee50e28e358dcc54cdbf69daf0eb87f6"),
            privkey: fromHex("ab30a326599165b48c65ab8d3c77d312d7b2ea4853f721e18cc278628a866980"),
            signature: fromHex("30440220723da69da81c8f6b081a9a728b9bba785d2067e0ed769675f8a7563d22ed8a1602203a993793cf39b96b3cd625df0e06f206e17579cd8ebcb7e704174c3d94dba684"),
          },
          {
            message: fromHex("f15433188c2bbc93b2150bb2f34d36ba8ae49f8f7e4e81aed651c8fb2022b2a7e851c4dbbbc21c14e27380316bfdebb0a049246349537dba687581c1344e40f75afd2735bb21ea074861de6801d28b22e8beb76fdd25598812b2061ca3fba229daf59a4ab416704543b02e16b8136c22acc7e197748ae19b5cbbc160fdc3a8cd"),
            privkey: fromHex("1560b9fa5229f623a9c556132da4fc0e58633f39ce6421d25b5a6cde4ad7e019"),
            signature: fromHex("304502200e0c5228e6783bee4d0406f4f7b7d79f705f0dbb55126966f79e631bd8b23079022100faae33aec5b0fafd3413c14bfdef9c7c9ac6abd06c923c48ab136a2c56826118"),
          },
          {
            message: fromHex("1bc796124b87793b7f7fdd53b896f8f0d0f2d2be36d1944e3c2a0ac5c6b2839f59a4b4fad200f8035ec98630c51ef0d40863a5ddd69b703d73f06b4afae8ad1a88e19b1b26e8c10b7bff953c05eccc82fd771b220910165f3a906b7c931683e431998d1fd06c32dd11b4f872bf980d547942f22124c7e50c9523321aee23a36d"),
            privkey: fromHex("42f7d48e1c90f3d20252713f7c7c6ce8492c2b99bcef198927de334cda6bad00"),
            signature: fromHex("3046022100b9d3962edadc893f8eeff379f136c7b8fc6ea824a5afc6cbda7e3cb4c7a1e860022100bb1c1f901cf450edfdce20686352bb0cf0a643301123140ec87c92480d7f9d6a"),
          },
          {
            message: fromHex("18e55ac264031da435b613fc9dc6c4aafc49aae8ddf6f220d523415896ff915fae5c5b2e6aed61d88e5721823f089c46173afc5d9b47fd917834c85284f62dda6ed2d7a6ff10eb553b9312b05dad7decf7f73b69479c02f14ea0a2aa9e05ec07396cd37c28795c90e590631137102315635d702278e352aa41d0826adadff5e1"),
            privkey: fromHex("6fe5b986c18da5d4fbcea6f602f469ac039085247ccb97b6292992363ea1d21c"),
            signature: fromHex("30460221009369ab86afae5e22ed5f4012964804d2a19c36b8b58cf2855205b1cfcc937422022100a27dfc38d899b78edcf38a1b2b53578e72270b083d7d69424c4b4a7d25d39f4d"),
          },
          {
            message: fromHex("a5290666c97294d090f8da898e555cbd33990579e5e95498444bfb318b4aa1643e0d4348425e21c7c6f99f9955f3048f56c22b68c4a516af5c90ed5268acc9c5a20fec0200c2a282a90e20d3c46d4ecdda18ba18b803b19263de2b79238da921707a0864799cdee9f02913b40681c02c6923070688844b58fe415b7d71ea6845"),
            privkey: fromHex("fbf02ff086b215d057130a509346b64eb63bec0e38db692e07ad24c6ca8fe210"),
            signature: fromHex("3045022100c5e439cef76b28dc0fe9d260763bec05b5e795ac8d90b25d9fccbc1918bc32f302201b06144e6b191224d5eda822a5b3b2026af6aa7f25a9061c9e81c312728aa94a"),
          },
          {
            message: fromHex("13ad0600229c2a66b2f11617f69c7210ad044c49265dc98ec3c64f56e56a083234d277d404e2c40523c414ad23af5cc2f91a47fe59e7ca572f7fe1d3d3cfceaedadac4396749a292a38e92727273272335f12b2acea21cf069682e67d7e7d7a31ab5bb8e472298a9451aeae6f160f36e6623c9b632b9c93371a002818addc243"),
            privkey: fromHex("474a7dc7f5033b6bf5e3027254cd0dbd956f16f61874b2992839a867f607d0dd"),
            signature: fromHex("3045022100ee8615a5fab6fc674e6d3d9cde8da2b18dece076ae94d96662e16109db12d72002203171705cdab2b3d34c58e556c80358c105807e98243f5754b70b771071308b94"),
          },
          {
            message: fromHex("51ad843da5eafc177d49a50a82609555e52773c5dfa14d7c02db5879c11a6b6e2e0860df38452dc579d763f91a83ade23b73f4fcbd703f35dd6ecfbb4c9578d5b604ed809c8633e6ac5679a5f742ce94fea3b97b5ba8a29ea28101a7b35f9eaa894dda54e3431f2464d18faf8342b7c59dfe0598c0ab29a14622a08eea70126b"),
            privkey: fromHex("e8a2939a46e6bb7e706e419c0101d39f0494935b17fe3ca907b2ea3558d6ab3a"),
            signature: fromHex("3046022100f753c447161aa3a58e5deeca31797f21484fb0ec3a7fe6e464ab1914896f253b02210099640fbcce1f25fd66744b046e0dfd57fa23070555f438af6c5e5828d47e9fa7"),
          },
          {
            message: fromHex("678b505467d55ce01aec23fd4851957137c3a1de3ff2c673ec95a577aa9fb011b4b4a8eb7a0e6f391d4236a35b7e769692ace5851d7c53700e180fa522d3d37dbaa496163f3de6d96391e38ff83271e621f2458729ff74de462cdce6b3029f308d4eb8aef036357b9de06d68558e0388a6e88af91340c875050b8c91c4e26fc8"),
            privkey: fromHex("08ce8f7118eda55b008f6eb3281a445a3ddbc5209d5ac16c09dbf40fe4bbc22c"),
            signature: fromHex("30440220439fd0423bde36a1616a6fa4343bb7e07a6b3f6dc629aa8c93c91831055e476c022020998a26ae4b96ef36d48d83e8af0288f0bbc2db5ca5c8271a42f3fdc478fcb2"),
          },
          {
            message: fromHex("9bf457159f0d44b78d0e151ee53c41cecd98fb4e4129fcda8cc84a758636f84dcad9032f3ec422219d8a7ec61ea89f45d19cab3c3d451de1a634e3d2532231bc03031973d7150cf8e83d8b6a34f25fc136446878e3851b780abdca069c8e981b3ea3f1bf1ff6e47a03f97aed64c1cc90dd00389fa21bb973f142af5e8ceccef4"),
            privkey: fromHex("820be5c5e14e802300ca024fce318910f00470f6c3eabb12e7f3fac9383cf247"),
            signature: fromHex("304502204ce72a83cf1d148db4d1e46e2f773c677f72933c40d7100b9192750a1c8222a80221009d5fbd67ce89ba8c79df9dc3b42922026a8498921c2bdb4ea8f36496d88c2cfb"),
          },
          {
            message: fromHex("2469172b7a046e6112dfe365590dfddb7c045cccd4ab353edc3076091aad1c780a9a73ff93f3dbf9e2189c5d1fdd6f6167d0ae8cc0f53dc8950e60dd0410e23589999d4ce4fa49e268774defd4edce01c05b205014b63591a041745bfffc6ae4d72d3add353e49478106653cc735b07b0fe665c42d0e6766e525bb9718264c87"),
            privkey: fromHex("d92d6170e63bc33647e6dcdf1981771ecd57e11d47d73138696fbf49a430c3ab"),
            signature: fromHex("304502201f1e1fb673e9a7dee09961c6824b473189904deb4f0d8e28da51f77f4de2efe6022100ae8df1fcdb226fac8b46e494720e45f6d9a5350174faaf22e47b6329ee6c5e1b"),
          },
          {
            message: fromHex("6f8983e74f304c3657cffde0682b42699cb2c3475b925058ff37292c40a0aa296690ad129730339ac60cf784225b2fd3db58297c8ce5889df7a48d3e74a363ae4135e8a234cab53ca4c11c031d561a6cf7dd47b925ed5bc4c2794ba7b74a868b0c3da31ff1e4540d0768612192a236d86f74fb8c73f375b71c62f1648c0e6126"),
            privkey: fromHex("a70eb435feaeb6ccda7d3ebd3c4ae40b60643bc933f37ad1aca41dd086e8ae50"),
            signature: fromHex("30460221009cf7d941dcbbbe61c2a6f5112cb518094e79e5d203891de2247e75fd532c3f21022100fc5a04579b2526f2543efd2a57e82b647da08b6924bff39cf021398a56ad70de"),
          },
          {
            message: fromHex("6fbe6f0f178fdc8a3ad1a8eecb02d37108c5831281fe85e3ff8eeb66ca1082a217b6d602439948f828e140140412544f994da75b6efc203b295235deca060ecfc7b71f05e5af2acc564596772ddbfb4078b4665f6b85f4e70641af26e31f6a14e5c88604459df4eeeed9b77b33c4b82a3c1458bd2fd1dc7214c04f9c79c8f09b"),
            privkey: fromHex("34a677d6f0c132eeffc3451b61e5d55969399699019ac929e6fdb5215d37be5e"),
            signature: fromHex("3045022059cd6c2a30227afbd693d87b201d0989435d6e116c144276a5223466a822c0f2022100b01495efda969b3fd3a2c05aa098a4e04b0d0e748726fc6174627da15b143799"),
          },
          {
            message: fromHex("2b49de971bb0f705a3fb5914eb7638d72884a6c3550667dbfdf301adf26bde02f387fd426a31be6c9ff8bfe8690c8113c88576427f1466508458349fc86036afcfb66448b947707e791e71f558b2bf4e7e7507773aaf4e9af51eda95cbce0a0f752b216f8a54a045d47801ff410ee411a1b66a516f278327df2462fb5619470e"),
            privkey: fromHex("2258cdecaf3510bc398d08c000245cadceadcf149022730d93b176b4844713e1"),
            signature: fromHex("30460221009eaf69170aeba44966afe957295526ee9852b5034c18dc5aeef3255c8567838a022100ebd4c8de2c22b5cb8803d6e070186786f6d5dae2202b9f899276fa31a66cb3bb"),
          },
          {
            message: fromHex("1fa7201d96ad4d190415f2656d1387fa886afc38e5cd18b8c60da367acf32c627d2c9ea19ef3f030e559fc2a21695cdbb65ddf6ba36a70af0d3fa292a32de31da6acc6108ab2be8bd37843338f0c37c2d62648d3d49013edeb9e179dadf78bf885f95e712fcdfcc8a172e47c09ab159f3a00ed7b930f628c3c48257e92fc7407"),
            privkey: fromHex("a67cf8cead99827c7956327aa04ab30cfd2d67f21b78f28a35694ece51052a61"),
            signature: fromHex("304402210091058d1b912514940e1002855cc930c01a21234bad88f607f213af495c32b69f021f5d387ce3de25f1b9bad1fb180de110686d91b461ae2972fa4e4a7018519870"),
          },
          {
            message: fromHex("74715fe10748a5b98b138f390f7ca9629c584c5d6ad268fc455c8de2e800b73fa1ea9aaee85de58baa2ce9ce68d822fc31842c6b153baef3a12bf6b4541f74af65430ae931a64c8b4950ad1c76b31aea8c229b3623390e233c112586aa5907bbe419841f54f0a7d6d19c003b91dc84bbb59b14ec477a1e9d194c137e21c75bbb"),
            privkey: fromHex("4f1050422c4fce146bab0d735a70a91d6447210964b064309f90315c986be400"),
            signature: fromHex("3046022100fe43eb9c38b506d118e20f8605ac8954fc0406efd306ba7ea5b07577a2735d15022100d589e91bf5014c7c360342ad135259dd7ae684e2c21234d7a912b43d148fcf19"),
          },
          {
            message: fromHex("d10131982dd1a1d839aba383cd72855bf41061c0cb04dfa1acad3181f240341d744ca6002b52f25fb3c63f16d050c4a4ef2c0ebf5f16ce987558f4b9d4a5ad3c6b81b617de00e04ba32282d8bf223bfedbb325b741dfdc8f56fa85c65d42f05f6a1330d8cc6664ad32050dd7b9e3993f4d6c91e5e12cbd9e82196e009ad22560"),
            privkey: fromHex("79506f5f68941c60a0d7c62595652a5f42f2b9f5aa2b6456af1c56a79a346c2f"),
            signature: fromHex("3046022100ccdbbd2500043bf7f705536d5984ab5f05fdc0fa3cf464d8c88f861e3fc8e54c022100d5c6342c08dcd8242e1daf3595cae968e320a025aa45ec4bc725795da3d1becb"),
          },
          {
            message: fromHex("ef9dbd90ded96ad627a0a987ab90537a3e7acc1fdfa991088e9d999fd726e3ce1e1bd89a7df08d8c2bf51085254c89dc67bc21e8a1a93f33a38c18c0ce3880e958ac3e3dbe8aec49f981821c4ac6812dd29fab3a9ebe7fbd799fb50f12021b48d1d9abca8842547b3b99befa612cc8b4ca5f9412e0352e72ab1344a0ac2913db"),
            privkey: fromHex("4c53b8e372f70593afb08fb0f3ba228e1bd2430f562414e9bd1b89e53becbac8"),
            signature: fromHex("304402205c707b6df7667324f950216b933d28e307a0223b24d161bc5887208d7f880b3a02204b7bc56586dc51d806ac3ad72807bc62d1d06d0812f121bd91e9770d84885c39"),
          },
        ];

        for (const [index, row] of data.entries()) {
          const pubkey = (await Secp256k1.makeKeypair(row.privkey)).pubkey;
          const isValid = await Secp256k1.verifySignature(row.signature, row.message, pubkey);
          since(`(index ${index}) #{message}`)
            .expect(isValid)
            .toEqual(true);
        }

        done();
      })().catch(error => {
        setTimeout(() => {
          throw error;
        });
      });
    });
  });

  describe("Sha256", () => {
    it("exists", () => {
      expect(Sha256).toBeTruthy();
    });

    it("works for empty input", done => {
      (async () => {
        const hash = await Sha256.digest(new Uint8Array([]));
        expect(toHex(hash)).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

        done();
      })();
    });

    it("works for all the Botan test vectors", done => {
      // https://github.com/randombit/botan/blob/2.6.0/src/tests/data/hash/sha2_32.vec#L13
      (async () => {
        expect(toHex(await Sha256.digest(fromHex("")))).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
        expect(toHex(await Sha256.digest(fromHex("61")))).toEqual("ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb");
        expect(toHex(await Sha256.digest(fromHex("616263")))).toEqual("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
        expect(toHex(await Sha256.digest(fromHex("6d65737361676520646967657374")))).toEqual("f7846f55cf23e14eebeab5b4e1550cad5b509e3348fbc4efa3a1413d393cb650");
        expect(toHex(await Sha256.digest(fromHex("6162636462636465636465666465666765666768666768696768696a68696a6b696a6b6c6a6b6c6d6b6c6d6e6c6d6e6f6d6e6f706e6f7071")))).toEqual("248d6a61d20638b8e5c026930c3e6039a33ce45964ff2167f6ecedd419db06c1");
        expect(toHex(await Sha256.digest(fromHex("3132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930313233343536373839303132333435363738393031323334353637383930")))).toEqual("f371bc4a311f2b009eef952dd83ca80e2b60026c8e935592d0f9c308453c813e");
        expect(toHex(await Sha256.digest(fromHex("8000000000000000000000000000000000000000000000000000000000000000")))).toEqual("84b3f13b0a4fbcce4c3f811e0313e00dcbd27431c229eff576598be8d1afb848");
        expect(toHex(await Sha256.digest(fromHex("4000000000000000000000000000000000000000000000000000000000000000")))).toEqual("94ce3f7973aaed52c6c446bcc59bd8d43b6695fa3fdb9e3d1cc47503a432d3d8");
        expect(toHex(await Sha256.digest(fromHex("2000000000000000000000000000000000000000000000000000000000000000")))).toEqual("6d0855a335802f0bc20946f3c48c05b6b98c14b578020d5f42a166b97fe6f59f");
        expect(toHex(await Sha256.digest(fromHex("1000000000000000000000000000000000000000000000000000000000000000")))).toEqual("56fd25956f759e64e853071ff01587c364eaf6286c97da600e0be78c701637db");
        expect(toHex(await Sha256.digest(fromHex("0800000000000000000000000000000000000000000000000000000000000000")))).toEqual("067dc6a810183e9069f63c2020b692c122c8d58263ed7f5c0e531504dc3b6e06");
        expect(toHex(await Sha256.digest(fromHex("0400000000000000000000000000000000000000000000000000000000000000")))).toEqual("4b78063b9c224da311bd1d3fb969bba19e7e91ee07b506f9c4c438828915563f");
        expect(toHex(await Sha256.digest(fromHex("0200000000000000000000000000000000000000000000000000000000000000")))).toEqual("5778f985db754c6628691f56fadae50c65fddbe8eb2e93039633fefa05d45e31");
        expect(toHex(await Sha256.digest(fromHex("0100000000000000000000000000000000000000000000000000000000000000")))).toEqual("01d0fabd251fcbbe2b93b4b927b26ad2a1a99077152e45ded1e678afa45dbec5");
        expect(toHex(await Sha256.digest(fromHex("0080000000000000000000000000000000000000000000000000000000000000")))).toEqual("0cad7906b177460ef96d15a612e83653862592a190f78fbb7c09f4aa89e616a7");
        expect(toHex(await Sha256.digest(fromHex("0040000000000000000000000000000000000000000000000000000000000000")))).toEqual("e30c1ba805347bc13f4e4e4e82658ab2c1c97bef72c4f3d555590784c64b3587");
        expect(toHex(await Sha256.digest(fromHex("0020000000000000000000000000000000000000000000000000000000000000")))).toEqual("3b5c755fc2a3a868da0a668b2704635b13e3dda0acfd386b4c025acb644400c3");
        expect(toHex(await Sha256.digest(fromHex("0010000000000000000000000000000000000000000000000000000000000000")))).toEqual("9f911fc19889661af03c2e9849208883bb606beb75bb6c162ff63f65e4ca8157");
        expect(toHex(await Sha256.digest(fromHex("0008000000000000000000000000000000000000000000000000000000000000")))).toEqual("3ec07f4585ef5c91814f7ddcae396dc42156df82307c46c7ae977cfcddbd04a3");
        expect(toHex(await Sha256.digest(fromHex("0004000000000000000000000000000000000000000000000000000000000000")))).toEqual("7e8bbd09e5c09de409cdf71c4b39f59b350b4b5dec4a45d0b6127fdf873b4602");
        expect(toHex(await Sha256.digest(fromHex("0002000000000000000000000000000000000000000000000000000000000000")))).toEqual("1616c4b5c8dbb446f269f2c9705b857b4a4315355a52966933e6b0e51da74a76");
        expect(toHex(await Sha256.digest(fromHex("0001000000000000000000000000000000000000000000000000000000000000")))).toEqual("36258e205d83bfad1642d88f39a6cc128ca554016de9cf414bef5c5c4df31019");
        expect(toHex(await Sha256.digest(fromHex("0000800000000000000000000000000000000000000000000000000000000000")))).toEqual("9b885490f45e3558384e94fe2c64773323ae14bcb8f9e8e02b3fed18eb930a30");
        expect(toHex(await Sha256.digest(fromHex("0000400000000000000000000000000000000000000000000000000000000000")))).toEqual("3bfb6efd3afc93bcd7ecde51304456c2dc0c697a337de3fd611cbec3b3bcc53c");
        expect(toHex(await Sha256.digest(fromHex("0000200000000000000000000000000000000000000000000000000000000000")))).toEqual("1d8052462938001afe80a3a2dd04ea8b28aea9f613849c5285401b7df2e8d604");
        expect(toHex(await Sha256.digest(fromHex("0000100000000000000000000000000000000000000000000000000000000000")))).toEqual("c15f125ada3b323c7d79fb6d1c96d87ca7890c468a209c66f80b5ea223e5e533");
        expect(toHex(await Sha256.digest(fromHex("0000080000000000000000000000000000000000000000000000000000000000")))).toEqual("4c49b88894d742530818a686961a640ca28692c2e2ad020b7cfd86de3e594068");
        expect(toHex(await Sha256.digest(fromHex("0000040000000000000000000000000000000000000000000000000000000000")))).toEqual("85bfb6e1a0aa50099696212dce8a0067f4fc8a2c4da0946b6106be1dd01d7d78");
        expect(toHex(await Sha256.digest(fromHex("0000020000000000000000000000000000000000000000000000000000000000")))).toEqual("5d5e9793d0f89cc3a709d2ffc1b488f1fdc7caade69ba027ea7b44f18bcd082f");
        expect(toHex(await Sha256.digest(fromHex("0000010000000000000000000000000000000000000000000000000000000000")))).toEqual("1eb50e78e6dfb0a4725fb71ba0443c3129a6822213f3d40da2439fcd2bced580");
        expect(toHex(await Sha256.digest(fromHex("0000008000000000000000000000000000000000000000000000000000000000")))).toEqual("f7b7700280839e9e0ff8aeccb3be5c586df0bd6b7bdb4ac8c8ed45ae3eef3686");
        expect(toHex(await Sha256.digest(fromHex("0000004000000000000000000000000000000000000000000000000000000000")))).toEqual("2e0d44f2be93b23accb8e7680fa0b58e25f48e33334481a9297c8f5e9428f326");
        expect(toHex(await Sha256.digest(fromHex("0000002000000000000000000000000000000000000000000000000000000000")))).toEqual("672504ffc411a43e4e9cac5a44bb62df4a7da166d18e4d47607cefaadfb667f1");
        expect(toHex(await Sha256.digest(fromHex("0000001000000000000000000000000000000000000000000000000000000000")))).toEqual("4a9f5ff8813d3465074fd633b060b49318d9ee98b3cf3b3f4a3c903e4ac66396");
        expect(toHex(await Sha256.digest(fromHex("0000000800000000000000000000000000000000000000000000000000000000")))).toEqual("c68386bcdcef8edf31d9ecce2a34e006f49ae1652ff0bbda847ff6601f762815");
        expect(toHex(await Sha256.digest(fromHex("0000000400000000000000000000000000000000000000000000000000000000")))).toEqual("a5fe20624689a0f3378834e922989ddaaedad5bf51d3b1f5e84d63778a8f43e7");
        expect(toHex(await Sha256.digest(fromHex("0000000200000000000000000000000000000000000000000000000000000000")))).toEqual("03de22d278e3be1e8fdb7da3ee6679e6d514dee8fc118fb27a91664cdebed8af");
        expect(toHex(await Sha256.digest(fromHex("0000000100000000000000000000000000000000000000000000000000000000")))).toEqual("d1ad35a94f018ccb8e40a06fed17db11f0638da3f3e638108ade5d151eccce23");
        expect(toHex(await Sha256.digest(fromHex("0000000080000000000000000000000000000000000000000000000000000000")))).toEqual("4d205614446cbdf1a8160a7182bcb24efb32d725e016bb91d84c1e7df55201aa");
        expect(toHex(await Sha256.digest(fromHex("0000000040000000000000000000000000000000000000000000000000000000")))).toEqual("72171d3bfe9863d702b81ae9c69135ad007200a5a7b8dc419f884c944a309dd0");
        expect(toHex(await Sha256.digest(fromHex("0000000020000000000000000000000000000000000000000000000000000000")))).toEqual("3f0a6edf24b8d9f9038b828d2f45f7625123f8a1b07e39892c86fabb2fe687d7");
        expect(toHex(await Sha256.digest(fromHex("0000000010000000000000000000000000000000000000000000000000000000")))).toEqual("c9bf3eea4d22268bd1ef0027a5e1e398f0d6c4a8190bd99ad869a8796eb0cd4f");
        expect(toHex(await Sha256.digest(fromHex("0000000008000000000000000000000000000000000000000000000000000000")))).toEqual("5706ed5b0db45898c5c01f4c4b5360043e1029ca00b33c33e684c27c30222a1d");
        expect(toHex(await Sha256.digest(fromHex("0000000004000000000000000000000000000000000000000000000000000000")))).toEqual("ecab997b21788d277cfccc07aa388c4b199ae63d6e606cde28328ec209b794bc");
        expect(toHex(await Sha256.digest(fromHex("0000000002000000000000000000000000000000000000000000000000000000")))).toEqual("58d2c35ffac68bcf336a44b98aff5740823cabaee65865c608d487ffcffc95bf");
        expect(toHex(await Sha256.digest(fromHex("0000000001000000000000000000000000000000000000000000000000000000")))).toEqual("909f22c2b34103bf854580c5f2c4f64c2520aa57b492e422d1801a160b6c6e67");
        expect(toHex(await Sha256.digest(fromHex("0000000000800000000000000000000000000000000000000000000000000000")))).toEqual("a0fc0a816ab024c9ded26d9a474b53c66635376400fb3ab117bab262321a1308");
        expect(toHex(await Sha256.digest(fromHex("0000000000400000000000000000000000000000000000000000000000000000")))).toEqual("9debededb5b1b6a2a2fabe9104c8d3f425144f290490ed788d6b6a19994c703b");
        expect(toHex(await Sha256.digest(fromHex("0000000000200000000000000000000000000000000000000000000000000000")))).toEqual("cbbf98775780c3b92bbc871c1d5137107be63933d0f3fe1be7aee434aa5509bd");
        expect(toHex(await Sha256.digest(fromHex("0000000000100000000000000000000000000000000000000000000000000000")))).toEqual("c1b245d91a44973947297e576511b7fc55cbcd06159cb0f111101e601b36843e");
        expect(toHex(await Sha256.digest(fromHex("0000000000080000000000000000000000000000000000000000000000000000")))).toEqual("6986e93dbc3b044d949945c0af3bc35ed63915e0268e9395d552d4acbc5a79b9");
        expect(toHex(await Sha256.digest(fromHex("0000000000040000000000000000000000000000000000000000000000000000")))).toEqual("5ff28a82880765e64116aec484f2b3a0ec1dbeacec2bbc78737e5504a94c2df2");
        expect(toHex(await Sha256.digest(fromHex("0000000000020000000000000000000000000000000000000000000000000000")))).toEqual("76dbb5ba9ec438d93638bfa8f62664201e29ba84bc6b1ab704d9688e89431503");
        expect(toHex(await Sha256.digest(fromHex("0000000000010000000000000000000000000000000000000000000000000000")))).toEqual("80d3eb7836cb04382bbaf764eec343f07c9618bdfe98e01fd2ba2958902253c0");
        expect(toHex(await Sha256.digest(fromHex("0000000000008000000000000000000000000000000000000000000000000000")))).toEqual("89ff132255600368de253f025bf92bb5af9bf4d1ffebb25575ce30eb77e4e4a6");
        expect(toHex(await Sha256.digest(fromHex("0000000000004000000000000000000000000000000000000000000000000000")))).toEqual("2012053e7ae584deee9b71a412fcc9351c29961e9d3972615c10ea59329a1d3a");
        expect(toHex(await Sha256.digest(fromHex("0000000000002000000000000000000000000000000000000000000000000000")))).toEqual("414daaed4defcabb5a3e4a82131b914e597522efce506af7b294a14486b40ed8");
        expect(toHex(await Sha256.digest(fromHex("0000000000001000000000000000000000000000000000000000000000000000")))).toEqual("bc52effbbb3c6f7c66ad400b707cd98930a828f6b5ba3e0c71d706f42000e80c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000800000000000000000000000000000000000000000000000000")))).toEqual("6225473f5d9bab2a34928d9f3c9891c990982718319f2408d07670a7460d783d");
        expect(toHex(await Sha256.digest(fromHex("0000000000000400000000000000000000000000000000000000000000000000")))).toEqual("b2b2dea4697fceb6cc466a7859a30c2bf5c6e477f6f442a1918802bfe707990b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000200000000000000000000000000000000000000000000000000")))).toEqual("873d4cb3f71aa7704660011b30e9b573ae0e839cf0b102633f197290f19998a7");
        expect(toHex(await Sha256.digest(fromHex("0000000000000100000000000000000000000000000000000000000000000000")))).toEqual("da24cf903bb826bfc026106f54eacfe50c0e8319be205b47e181642723da2305");
        expect(toHex(await Sha256.digest(fromHex("0000000000000080000000000000000000000000000000000000000000000000")))).toEqual("afe22988ec899e95704b9e87082ee375f78db2687478ccfbc2dfdc1e121c49f4");
        expect(toHex(await Sha256.digest(fromHex("0000000000000040000000000000000000000000000000000000000000000000")))).toEqual("497d0d90f9a77f1d67f0567e67f7ed60f9d324cde0db266e51afd4b25cf24fa4");
        expect(toHex(await Sha256.digest(fromHex("0000000000000020000000000000000000000000000000000000000000000000")))).toEqual("0845ca0aaaf8f899437303a1c4a24101437da7c90d1147e653295ba68ced2d1c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000010000000000000000000000000000000000000000000000000")))).toEqual("a1bd23817c23ba5910b9ee8404740a0ce3e81df31a5afcd172b4613ecb1a9b65");
        expect(toHex(await Sha256.digest(fromHex("0000000000000008000000000000000000000000000000000000000000000000")))).toEqual("13ea147d01f645b321e81f39d15ce4aeb9cf2e0373d6fcbbc1ca7cdcfcc40c29");
        expect(toHex(await Sha256.digest(fromHex("0000000000000004000000000000000000000000000000000000000000000000")))).toEqual("912e64c464286112afc2ccd15e638707f293d8a8133e03d6795e96562d471183");
        expect(toHex(await Sha256.digest(fromHex("0000000000000002000000000000000000000000000000000000000000000000")))).toEqual("1af94aa75bdb9b976831e1a6a1a7bbd14697f710e514ac4019b33815f167b555");
        expect(toHex(await Sha256.digest(fromHex("0000000000000001000000000000000000000000000000000000000000000000")))).toEqual("e13fcb8f649438f18530ec00daa36a110fc641a226c3dde990f82c4b561da4db");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000800000000000000000000000000000000000000000000000")))).toEqual("c8387bf8dbadf1c9ba583a8d27b620f4bd13cee4ea2ef98bcb0e1bdfd6f3d8c8");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000400000000000000000000000000000000000000000000000")))).toEqual("79a257d3b1260eae2c407b55a33c28e19777c185b5254ab051442d2353b35464");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000200000000000000000000000000000000000000000000000")))).toEqual("6552ebe29b1b037562f1888498bbb208054638e97c0c625f127c1a203efffc65");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000100000000000000000000000000000000000000000000000")))).toEqual("2d77a6f16003c7f09e6daea5caf4e61b9cd822cdf21a33f300eeaf33264ac67f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000080000000000000000000000000000000000000000000000")))).toEqual("f5b8339cb1efc7f3fcb94dcdf8bb3ec191ee016609082e47242ee6253a05da9b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000040000000000000000000000000000000000000000000000")))).toEqual("bd7cdcc82d46856db3e580548999dfba0d8bd38e0edbb797188de335d933c8b3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000020000000000000000000000000000000000000000000000")))).toEqual("d340dbc1256765fea41925fda295bdfeaa1055cbfeae0fdba8608e3116d746dc");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000010000000000000000000000000000000000000000000000")))).toEqual("49293309d25cafc914c11063c2d1cd286a4500d519b11b4fc98500efb85f6d9c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000008000000000000000000000000000000000000000000000")))).toEqual("6091339d451e8f830a46c5ce040717c9d06f36aa4c5a9a8a9f1622384a6eb694");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000004000000000000000000000000000000000000000000000")))).toEqual("6cbd66038b54d94a931006ea23db48c300e1384ce7fa0f7ccfb8efe2fc0ac4f8");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000002000000000000000000000000000000000000000000000")))).toEqual("8a1a30a8f415d71bbb03c5ae3df4836ce54cbcfd78816bce86e0b983b059e972");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000001000000000000000000000000000000000000000000000")))).toEqual("8039aa16a81b23f2410448563996605c13766d1e7417f4bdfbd8ad5d0d33554e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000800000000000000000000000000000000000000000000")))).toEqual("7549d699d3d1989d940600f25501c243e9af21fe51ef2adb8358c159c9e9663f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000400000000000000000000000000000000000000000000")))).toEqual("831f3936cacea264ef4fae2e36b2110f6729baf434e61a6ee379d0c014f2daae");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000200000000000000000000000000000000000000000000")))).toEqual("013edbd6b8ea866d7ae7f553c079663ca22acf4e21e64f0085ece1b449bd10ef");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000100000000000000000000000000000000000000000000")))).toEqual("d9b846387ce55ac512a1e2807aaf6f8dcfbeb462ed6d4176cc56a0b0bdfe1047");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000080000000000000000000000000000000000000000000")))).toEqual("0528b59ed6ebba187a69c3c41e88120b1315cee497bb6731191dc05000cd1e78");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000040000000000000000000000000000000000000000000")))).toEqual("1eba730823ba27ecade25b38144d339053446006ec3f66131aee473ea3fb9e04");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000020000000000000000000000000000000000000000000")))).toEqual("b8ae9bf4e323c6ef3bfe75b6969ebfa68fe6c14b06481cf06869d12c555dbfa9");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000010000000000000000000000000000000000000000000")))).toEqual("c89944ef4886967a517064a212e38bda5fca80ca54e18103a75d54a6e230c694");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000008000000000000000000000000000000000000000000")))).toEqual("452e5d0af5dabfdc5c74868d916f1e390a7354937785f1f6d4d0b1d72f06bd8f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000004000000000000000000000000000000000000000000")))).toEqual("87ad2f7f2e5db1be3bcc982ea058955ae34a3cf0cbf87dc4813ae5b0e6b3c517");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000002000000000000000000000000000000000000000000")))).toEqual("fb4635ac471cbebe2eb3367f259232d7b62b8a6342e1bf73294fe447c3b8076e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000001000000000000000000000000000000000000000000")))).toEqual("9ada02e914eb181d22e7f6d9b3f39804a0f758bda23995e567e3a1edff0b60e8");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000800000000000000000000000000000000000000000")))).toEqual("d41bc420cd25ba9038a4e1d1c4ceb1b05d993d0b68095f46b4bb524b72f15287");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000400000000000000000000000000000000000000000")))).toEqual("329954d9cb855dd7798e587403353dd69cebf91a5020ae5fc4d742656e4cad0b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000200000000000000000000000000000000000000000")))).toEqual("7ff37d832db4da7cc3473fc3f0b263949630f21dfd8522a544994c5a3b12644b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000100000000000000000000000000000000000000000")))).toEqual("7f27bee720048484188f774d660d86276b6383ab2e40990f181e5349dc72fc52");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000080000000000000000000000000000000000000000")))).toEqual("aafca0ac1d6c80ee40fb43fad51f006d39de0a101449b450a3e0fd9d44fe0230");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000040000000000000000000000000000000000000000")))).toEqual("941a10f2333950e3501c6229c085a54185e55a1017c9b8dfd9187b614371884c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000020000000000000000000000000000000000000000")))).toEqual("fa7862ed967e19ec63f91344184684099c7bd734edf810509e2fb308fe5daf16");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000010000000000000000000000000000000000000000")))).toEqual("e5c92e4c6590ad2f982267be2b13e110c44d9c69e93516f594b7e433a0e93af4");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000008000000000000000000000000000000000000000")))).toEqual("0656dd98ded7d764bcdee4e96a9699e70974ae77cf72f166b7a979b707f1878b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000004000000000000000000000000000000000000000")))).toEqual("1fa047efed4a196a9b538c099e50b67a0f537897fca6f0aeb386f43e65d48a31");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000002000000000000000000000000000000000000000")))).toEqual("74bf1c0e1da85358fa86ecbbab419c9223f41d47702583593cd01539e861db73");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000001000000000000000000000000000000000000000")))).toEqual("846c472932fda94b56483e7a903c6545b5cde4fe5d0a2ffa03b52ad53570d54a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000800000000000000000000000000000000000000")))).toEqual("e78743b610392b52cd122071f9071a8e9c35aabec0bd63c73c5fd12171838b32");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000400000000000000000000000000000000000000")))).toEqual("4a435a44a2be1f40d8e6a1f7c332c5330ede4e0f55505304e571b4443255a5a9");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000200000000000000000000000000000000000000")))).toEqual("18122cf13ab2412fa65cb693713794de6b30403b65688234a6fa940fc6d506ff");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000100000000000000000000000000000000000000")))).toEqual("bae3e67a9d5505a5685ebb52b8510b44315c0faa422f0ebfd4ef3413490248fb");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000080000000000000000000000000000000000000")))).toEqual("b7f300939fcc6ea45a8920c7b8d3f18e753c0076062e4a499b69af96328ceaf9");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000040000000000000000000000000000000000000")))).toEqual("7e5aafc21b6238fffc561283ac2b592c1f5bb35237061629ac9a4af7153cdb3a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000020000000000000000000000000000000000000")))).toEqual("b98f3c9fa25cc07aa02f7456e15c7707da6702628ab589351b8737a814dbcb9b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000010000000000000000000000000000000000000")))).toEqual("b01668cf19c69b22737f7409ede201cc37bf1b23fc0630fda9364652171389ac");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000008000000000000000000000000000000000000")))).toEqual("a8bbe8b393ab0e3d0e822c8ab9f23b8f1c985e93e6ec17050cc6a0d82b27a078");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000004000000000000000000000000000000000000")))).toEqual("fb246a9eec0aa00a971416718cf0bb789f44496183642024c5a3c8043c5e72f0");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000002000000000000000000000000000000000000")))).toEqual("5937034d4c6184bc32cef38aca4bcea720f3d3061191d1e0eb5c84e242c7deef");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000001000000000000000000000000000000000000")))).toEqual("c0deb1f9a2060a3ce111bc6c36ddfdeaed2713229eac55c75608b9272e10b78e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000800000000000000000000000000000000000")))).toEqual("08cc99bd1c9e6c2ac03dd17c7be3f0d744aac4144d542d2f4d2f3366837e030e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000400000000000000000000000000000000000")))).toEqual("b5026f002368efab1fc2aa97be628698c41db381b44f8bc2c8be3635c8f0bcfa");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000200000000000000000000000000000000000")))).toEqual("98a020137d37236b11d0acfec699107679eaf0339e8c0aab3aff1538296f754e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000100000000000000000000000000000000000")))).toEqual("a30b09a7870d5fcf10704ca8a00083ff4ed2d0b78f530161c698a0dc272c5f12");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000080000000000000000000000000000000000")))).toEqual("c4cef7219fba14b0515ff84ca552273e471efb23a26274778c11d0fb61805a8d");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000040000000000000000000000000000000000")))).toEqual("0f70f20e2513a79ad1d153c98981d5cd21de4c134977658d1c9c4b4367a73f99");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000020000000000000000000000000000000000")))).toEqual("690a81f1fe0464fab24a2e9861c24e52087d902b2dfb344713b42285051e5c81");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000010000000000000000000000000000000000")))).toEqual("403e430c39eeca88d967926b543a06fbb68654c348801fde7466f34a5579e2ed");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000008000000000000000000000000000000000")))).toEqual("715623d0a82109017f74e8de00bf5b700bc6c161ca403cdeb9a09b659268b779");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000004000000000000000000000000000000000")))).toEqual("6e367ff2768a6d4c980d7d1b75f312663cb816e5c0191a8839f6f9e50a44853f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000002000000000000000000000000000000000")))).toEqual("81f33a1bc1018f2c4886865f55ad2fddd891160d06717805f2687155e26dc2e4");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000001000000000000000000000000000000000")))).toEqual("1c074ca4abaf8b662d0c75635f84fe4ed9011ce476c45f8214f798438e1cb9fd");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000800000000000000000000000000000000")))).toEqual("003d837bbb718e13778188399eacd53df9781ee8ad3f77bbd35f5b617d38ab24");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000400000000000000000000000000000000")))).toEqual("37212e518e30d555ea442ec7467b1e95dc06371c9784705d0d885d1c61981029");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000200000000000000000000000000000000")))).toEqual("74119615b3146e59d08dddf07cf0614264d73f2118cf4a5cecfbaa691b005f2b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000100000000000000000000000000000000")))).toEqual("3269aeb6831504cb8679ea40f749072951eb1728cc5e21e45fd0d6b423f6fa42");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000080000000000000000000000000000000")))).toEqual("d504fd065f8d2bcd3d1d3a4b298328e09f1cb44e3106d156477e992aabe9812c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000040000000000000000000000000000000")))).toEqual("8aa4012b4573828d21c20ac64d18a6ea73da0347b5d1a71442091ca48655db70");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000020000000000000000000000000000000")))).toEqual("650189d78de4cf754ed237a9ddadd9686b58d85d06d82e937df6075f4cc87642");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000010000000000000000000000000000000")))).toEqual("d140e61d738c3298875886b8d8de576e48ff5c7e9f4d0e66d0149d0bdee19f49");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000008000000000000000000000000000000")))).toEqual("59e7addb5e068640de3f8fb015017e7aa7495430d2533f87d4ece9f7ee548fa3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000004000000000000000000000000000000")))).toEqual("5481b8528ef488d0a4ed259244306aff83145b7d675e159efece21def7561297");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000002000000000000000000000000000000")))).toEqual("671eaa12d76be21eb2ced2f61ac1e98df94c1952c2cdfc047895c74f15a7f3fa");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000001000000000000000000000000000000")))).toEqual("6cc4f0e930b34481d03a4134331852eaed66667e3b3d8605f7cd3777551d2b6f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000800000000000000000000000000000")))).toEqual("58a971df91f981284dfca88c6a21ab89d4e6a12e0d8a1e12bb585eb697d597e3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000400000000000000000000000000000")))).toEqual("afe25f910412d62db9fefbac5caf3d240153725fff1b8d85ff835bd418028738");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000200000000000000000000000000000")))).toEqual("ac99c31bff7b16e8916e8ed5c969ce7dd1b7a4a009f2f03ea8fb240b1ab16ce5");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000100000000000000000000000000000")))).toEqual("85a6cecfa95e645104a45e2e34e98f92039ed921adf65e78631e270548521637");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000080000000000000000000000000000")))).toEqual("1c686e808a38e9d3d800ab94f8ef98888fa959593fe9a78850ee01ccabf170b9");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000040000000000000000000000000000")))).toEqual("058ae81be2477d2bb0ef309f69713d68196a0a9d758be3814b565088fd752ab3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000020000000000000000000000000000")))).toEqual("5b1919a40f9a5aef568e1e24b414a85c0d60d1dcabaa2cceca09a91d78a91d15");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000010000000000000000000000000000")))).toEqual("ffd4927e8c35afd614a39aec5654a8cef3cfb47b737bcd55342bfda0b9d81e53");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000008000000000000000000000000000")))).toEqual("d47a6b8bdba65ddf5820dbcb3f1733018cfa0a3a278540c7fbd575e36e20f063");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000004000000000000000000000000000")))).toEqual("9d8a03520fc2f2653ac52b7c0da06f5436858a811e5f4b2db0b2182c2c8f6d12");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000002000000000000000000000000000")))).toEqual("13a17e3e7c07f58935075a41b2b5b332cc64f7099e320430dbef41685dd95b27");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000001000000000000000000000000000")))).toEqual("9250c7028c00aad64f1a1140f4de8812608fcf15f3e91ab886c911e71bd41324");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000800000000000000000000000000")))).toEqual("c019bc0605ed4157c8d3e4761bc74d403558e426d04403b17c9923aa5a732c48");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000400000000000000000000000000")))).toEqual("524fcbe1456ce1d535e6e75098f7a817eeb99f6d3b77a9705bf40674e84aeaf6");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000200000000000000000000000000")))).toEqual("f4a5e902e2633f78a4ad90c9305dca8ccff31a8ce6fe8dc3755a591d201bb51c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000100000000000000000000000000")))).toEqual("bb242c3d49140119969ce07f0021e400ecdcbdeb3fc8c92459eff346878a6ff6");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000080000000000000000000000000")))).toEqual("362b9130763c98696ace92e946f2646edb7a9d419cbe12abf9cb40b9bbdb32df");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000040000000000000000000000000")))).toEqual("6bf88e66479d09985823f2b87bd7dfdda415442b5132b2482f9b092cd3fbaa4a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000020000000000000000000000000")))).toEqual("df6777df2585349325132c5a6ab16481498bf9a1957ebc2f113095669c7afe96");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000010000000000000000000000000")))).toEqual("37108d63c635ff214af8a98dca6a3e288fa14ea8f5e8c52a583b6f12bdba3cf5");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000008000000000000000000000000")))).toEqual("c22faef7e57a7bf3e344132436fae85bd59a9bf4ae01da2545a6ee3779773af2");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000004000000000000000000000000")))).toEqual("a1947f12bd61d72067884d47ac2c8df8541fbb4a9eb2d0f1a8f6997207819ae0");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000002000000000000000000000000")))).toEqual("dda4abdad1290fd66a171d9724a409b02612f8606c58d85d530f30e7cedea3d2");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000001000000000000000000000000")))).toEqual("658fce7342d3c8e1edebd0ef0b72612346500b72ceeb1aeed11845f1ad1401f6");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000800000000000000000000000")))).toEqual("518ee98053e9d1f1f42f9e59dd74a6d9aa0d1f1fdddd4f799134b4c111226d98");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000400000000000000000000000")))).toEqual("1f2513f0cd6195005b81727f7784b1f109c2f680a5e3343a9ea0fac21f35bab6");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000200000000000000000000000")))).toEqual("2d05a4ed553cbd1f532eea35d158f01f2867d49a7120abe733a5f6c2e5c92c21");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000100000000000000000000000")))).toEqual("0bfc42ae0f93d32617bb3c7cf8e4a6515aa8668922e05af39a27cae39f9ca221");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000080000000000000000000000")))).toEqual("c3f2631b8f76c94534abde0eb456efa47dc43b08f7cdbe379622621b28458915");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000040000000000000000000000")))).toEqual("9c15e4a671eb6e390bdb67ac4441da8ccc9e56afe28b8bcc928fc6f3e552569a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000020000000000000000000000")))).toEqual("efd7a7e53f7f21fe9b9d4a5bf3be5ae7adb0947f8412be25f7e88a45743e6fb8");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000010000000000000000000000")))).toEqual("a524ac0d0dacf565bba3b84015d995202e1f67409d63fe16d442caf5c72c3d3c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000008000000000000000000000")))).toEqual("80073614fb76a09c3dd701e83be717117a3694d05331b032f8104ca241f11482");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000004000000000000000000000")))).toEqual("c475a4c797002b5c66a21def4295cdc4c9de4f045fb0fce7a1bdb977224bac97");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000002000000000000000000000")))).toEqual("6d8547cabf8f0aeaf7a9b3598cba769f545c61e8873ffd6d5e7ee9c1c5527f95");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000001000000000000000000000")))).toEqual("7187108d9f4506c15b5e6ad523167bd2badabe69242eb6aebcfe52f70874e757");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000800000000000000000000")))).toEqual("a195eaa4e6377b4c0360c343d52f82704bd85bc5905d669c5e4eca7c1f028c88");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000400000000000000000000")))).toEqual("72c72361133dffebfd3ebbb8fdc6b76dc530aa7ff5e22ee709b65be866dacd86");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000200000000000000000000")))).toEqual("20f3bf2e8f3876fa733f41cecfda7c641ce579b8ace9dfe06a64a4ba72bfa901");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000100000000000000000000")))).toEqual("d3b0f2a184d2aedacc760448dc351b63e975d5e48444320733f19381eb973659");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000080000000000000000000")))).toEqual("25d380557ddacd3761fed7b1ef2ad9b2cb25ef263dddc08e34646efbb696f718");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000040000000000000000000")))).toEqual("7df39f3b439912e4859500ed516f4096ef60a96911f626052b3315416c307f90");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000020000000000000000000")))).toEqual("d05070bc61fc95f05359b8b36c70db0e3d5fc077f73c02ccf4310a24c91a0f33");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000010000000000000000000")))).toEqual("cd3683d700693575fbb3355f844458ed60b1a45294cd27cd380a9a10e660e407");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000008000000000000000000")))).toEqual("ab19432215b64f93a344f7e6a46b386c4ac159924ab4a6f366fb8552a96dbce6");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000004000000000000000000")))).toEqual("1f6b7158c0b0a4311fbef86e39bd812bc94207d154b9cb2380433f16f6821b7b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000002000000000000000000")))).toEqual("e65a4e3567d420d98ef51c29405ab004a019d794c51a67a680f6d54f21f08e5c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000001000000000000000000")))).toEqual("53382a486c2390f7ff94a33bafce7285f382bdb5bed4ff076d7a161b169d6b4a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000800000000000000000")))).toEqual("9e36673a278e023992b653aa0683ce64ba7cce51239e091c80d98bc627b45a00");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000400000000000000000")))).toEqual("ad51cb9156c8cb66c202133e098061688a0360ea0e5b49a9f47eb00c346eb1f4");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000200000000000000000")))).toEqual("9dd8990fd868111f6854ac54d85ba38b9b0be3e02037b4a3dad2d0d9e89dbce3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000100000000000000000")))).toEqual("8a4a51aeb3bfe9feecd9f4af22d2d34c534f3a2b127e959236407206a4e1db2e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000080000000000000000")))).toEqual("32f59d1c8e62ee49bedccf59007194eebbc698b888050723c5325a746463e3c2");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000040000000000000000")))).toEqual("fccd7332fbd25ce39ee7522f432185f2322ef05cf1f5e36a2458272ff1397a0a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000020000000000000000")))).toEqual("62775bb6a290e509389c0ea6bae5c8567a0e034a813f9ad62666b4871d8faca3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000010000000000000000")))).toEqual("264af724ebd387076f1427eaf7d7e94734a209ddffab1bf455528d8bfb548681");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000008000000000000000")))).toEqual("96fc8ff80897ed6f514a67fb4fa5cf9d53814e305fed248bae6b5761a331e0c3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000004000000000000000")))).toEqual("f98b7c970726889639c19c75fa4e63bff6d48063806a19ea4584b84f3c40079b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000002000000000000000")))).toEqual("76ca7485a665d0b76abbb2909b193d8f8572c8db77f969256480f63728aca867");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000001000000000000000")))).toEqual("8004b9b6a39295d73d00759682c72de9a49e7278189ca9a1d704fffde8f8aecb");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000800000000000000")))).toEqual("98177f21e631c18fd21733c5bccf33243970ac5ebdbb19a257dc96bf43d5151a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000400000000000000")))).toEqual("dce21d3195a4b65b3b2c3ef0a954a157785c8ca4fd195ae15bd7f420d9d5ce14");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000200000000000000")))).toEqual("edc0e40c3027d41914bf3144a08078742b337b96da8e503d4ff84bb6a8e97d55");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000100000000000000")))).toEqual("013f21dd7052786e2c338b57f23ec2c7feb0c12f7b3b28fbb5affaca27103f51");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000080000000000000")))).toEqual("bf8362ce587255d74a374de2775680c02a02b2106d05eb9b1eb83bc88a9c97ef");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000040000000000000")))).toEqual("ca72bc9bb4f0f6e2ddd3d641d94a62163a066af9d77ac3937cb00d134dfd46f2");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000020000000000000")))).toEqual("6b42a2d46eebc60c0238517a9f2b78ba27ce4b87ed35261fb0a0deddd39dc753");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000010000000000000")))).toEqual("d441092f524ae16d1339e78fb13892732a5975705f90f82e54ee09d80448e49d");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000008000000000000")))).toEqual("c7f6dfa7f3e4f92d6c20aeeae921fa209685d0c20714d69a95d1f94fa41d097c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000004000000000000")))).toEqual("300223df08c84b22c569fc15ecac264f9d1cfdad758962b406c757fca69d0a0a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000002000000000000")))).toEqual("fb81b52e00690b2f03f8d410a357e582f6f4367d4359fe7dd7cc6c6a3ad24ceb");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000001000000000000")))).toEqual("bd5ecece8b8cbc564a91294968c3be209b15730cf7594d2b79bee0d44391be7e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000800000000000")))).toEqual("80179fb24a6eec0173daf26891251c3054ea8d7280f88d4c57a3f52b5f1aa388");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000400000000000")))).toEqual("59c6f16a4878fc819f3a3cdfcf7c5a8ceafe9231ce259a7f9e377e3d8b41c16b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000200000000000")))).toEqual("b18656e3d9d293f342a9a4b88884bd9a650d72368c1703b74abd2d4add1b6a5a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000100000000000")))).toEqual("a7213daeeba47277122dfc9ffadbb36881c6fa9c89293d2291407522639e017b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000080000000000")))).toEqual("33d62d3a60af659d70978e12f6ae01d6d62686965288b584796b6aecc37167b7");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000040000000000")))).toEqual("3f2f1919206cfbebc68db1bd552d78aff61f5ad296af45f15145e176cd4e93bf");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000020000000000")))).toEqual("4aca600624783f035871a05365edfd0d01a67c9dd59d38a68117474d81f4a93e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000010000000000")))).toEqual("9b352cde8f0bdefcc8b1f37d34b3641ff6f55c05ff5193928402ed95c986d1cd");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000008000000000")))).toEqual("b14b9519fe51b738f81ba61ae48723835412b544f41e8ca4d3c2be8b8e7b7acb");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000004000000000")))).toEqual("aff464673edd86fed0c0cc97be3de9375e61503680b17ac4fd44aedc02ef086c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000002000000000")))).toEqual("b600ccfec9ddae068109c82b0b7ba3632501857eb23ca7860fd26f3bc1335697");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000001000000000")))).toEqual("884aa440d0320d6fb74a8b02bbe5f7df50cc4b83571523cdc4a2683776ad6218");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000800000000")))).toEqual("c20d94291275f858e53fdc834b0e02fd496145b8713f53555e863425a61d1e88");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000400000000")))).toEqual("b1087c12c70d6224460202da3fa5b985d3d2b130f2347d6bc7dc7668856ef5b8");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000200000000")))).toEqual("be7f81f61289afd0e08467938f054f69d2795e570d0f5c7577125bd37d72069c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000100000000")))).toEqual("d7e79aeeaef9cdc5889c68e98dcc7c1d85172d0f183a62815df0104ca67f3068");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000080000000")))).toEqual("abcab82bd056c3a975c8cc78b160b1a726ea2d58dc8775ec9cc1e97b1887263a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000040000000")))).toEqual("716a3871c88d6c0d6ab03c6c925ca5b0fec9816cb393be5226e387048dc379aa");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000020000000")))).toEqual("046284f44965ffe307372b5eaa47d0dcfc282b13b1d13fee3786a0a2173ca034");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000010000000")))).toEqual("0316cc9c233290d72c53938cf8d216e24447d95114c3f9bbf2fa508eea9e72cb");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000008000000")))).toEqual("388a34ba91711c31e14675bba6cc29a157237e2b1b6095b02a49373a8abf43b3");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000004000000")))).toEqual("ccfc11fc56d48daf0f233275e9e591b76758ce6099465fa3e8b925facc8c1d87");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000002000000")))).toEqual("f1c19314208ec565b4e50664b650fc0d256b4eb5a177acdccefc78bef7543a6c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000001000000")))).toEqual("954a6575b642bdddd05409cf5973ba837f25b2e391950be91fa23334093d88f5");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000800000")))).toEqual("d8c9ae155f36f1edd6a9a0fbce9d8a2d97efc4896eeab31fa4b2a267f10f83d7");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000400000")))).toEqual("e1291a0e2d900f2d61c7b915ec60cb2f26c58de63b0da7f1aa1f40fb609c7261");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000200000")))).toEqual("18da34910affcd9b1f0b80d57b2b545dbd3fcbb9327b0744553b0ae309d01f2e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000100000")))).toEqual("0b07727d83b28795bd6cbbccbebea5cdedf3430c407723fd2f5270bed6f574b7");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000080000")))).toEqual("6580335a2908a8845a95e26e793d522451579d91c90a4c92d8667361957c4fa1");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000040000")))).toEqual("34b59ecbd01296ea9fe6c2f1e22ad83ae34ad9917f762e5ae194700a95f5b08b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000020000")))).toEqual("8c7809b15f5525f59885e518a954871a34a4850a0c5ac531cb5564c91d10fa81");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000010000")))).toEqual("a1f386b9ae9b170e1f02e3fa611b991e4a383e1d998fc03f1026028b70c5fbb9");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000008000")))).toEqual("25e947aaa44b7574bce0d0ac4d91d63489a7837f6af73764eab3cc83eff2b01f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000004000")))).toEqual("1b85d67d1481c20bacb50aea0c506affa04b258c049a8cba641dd4d3a0ece1a1");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000002000")))).toEqual("cbc332ec5110feae214ff569feca4bef1b3ceb809f0e2362e3924a762153785c");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000001000")))).toEqual("0193d8ff39177fc604d8c0e60d5495222da10cd84d4ae6d12bf84ca923158b31");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000800")))).toEqual("b6a210aeb8d431276712b83dfb27a338166436c37b13e533e6a664bc0696e21e");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000400")))).toEqual("f1337369c5303a28da9132c4562c7d1d7381e3f30575f05c72dd3e969cfca5ef");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000200")))).toEqual("5bf54ec3ce05919efeddee2ae288118db06a3aed340d89cfe279d0c6927cd336");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000100")))).toEqual("084e640fa57cbf5f097fd08636fe5e98e23839d95c532099efe1a7a838dbafca");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000080")))).toEqual("63794a3bf8875ac2c32ba6238d27e7e15e56a3b794b8d2d6aec82faef2360e3a");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000040")))).toEqual("d9ece2cd2214f52c55dcd9bca56a900ec79c1343f12df8a60f0298d255896b61");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000020")))).toEqual("9633190bf775667487569d0f5e7adfebc899e55ab9d62aaabe9f8754a3fa9c20");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000010")))).toEqual("a3ecde0c1d9daa6b7a949c87a1af7963c69cb2c412fb3086c495f14630c17b7b");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000008")))).toEqual("38df1c1f64a24a77b23393bca50dff872e31edc4f3b5aa3b90ad0b82f4f089b6");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000004")))).toEqual("e38990d0c7fc009880a9c07c23842e886c6bbdc964ce6bdd5817ad357335ee6f");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000002")))).toEqual("9267d3dbed802941483f1afa2a6bc68de5f653128aca9bf1461c5d0a3ad36ed2");
        expect(toHex(await Sha256.digest(fromHex("0000000000000000000000000000000000000000000000000000000000000001")))).toEqual("ec4916dd28fc4c10d78e287ca5d9cc51ee1ae73cbfde08c6b37324cbfaac8bc5");
        expect(toHex(await Sha256.digest(fromHex("ff")))).toEqual("a8100ae6aa1940d0b663bb31cd466142ebbdbd5187131b92d93818987832eb89");
        expect(toHex(await Sha256.digest(fromHex("973a")))).toEqual("149b712a766c0a02b72c6c3a7affadd4085d7b05931b4516edc65a9eb6e22680");
        expect(toHex(await Sha256.digest(fromHex("3009b8")))).toEqual("96a75387879e8d57480df10dce407c6ed6797eb43256f5410ede8755ea05d4a8");
        expect(toHex(await Sha256.digest(fromHex("f88519bb")))).toEqual("9658e45d0ae5f088cd673e167919285968a2878cf9d1cc63a10f09fde37c997a");
        expect(toHex(await Sha256.digest(fromHex("8701e337bb")))).toEqual("3a309afcfd5ed8e1ce622a8d559961e428664a6f727df4c22136fc4eba08ed23");
        expect(toHex(await Sha256.digest(fromHex("0d90326391f9")))).toEqual("00037ad7367512d5aad2f2a804722d3155d2d0c98de3935f2174f922975ee15d");
        expect(toHex(await Sha256.digest(fromHex("5d10fa95bd08f9")))).toEqual("57511743dc186aaff0f93b4040ab48cb49139e7c3cdee653f61b5e5f61c71d36");
        expect(toHex(await Sha256.digest(fromHex("4984cb3608f9645d")))).toEqual("8b68120dc066c80f689de09bf75a661848657589d362fdc528a2ed63409b5dbc");
        expect(toHex(await Sha256.digest(fromHex("f64202a9b1da2e688a")))).toEqual("4e49c74f6deca3ff64cc1280e2be7c8568a02999afb9e5c0ed9ee78322b7a9ce");
        expect(toHex(await Sha256.digest(fromHex("86f8219d69cfde40a2d1")))).toEqual("5cf4657d7b134962d64f46dce6e09f94262123a0f693360f842345fd3f475665");
        expect(toHex(await Sha256.digest(fromHex("3d075a7686d6f2b0d933d5")))).toEqual("476eed19a66a112b7991a04062ff281b9595a4bc45c101629e92e3dd402f8ea5");
        expect(toHex(await Sha256.digest(fromHex("eb6bf5ba40801b27104a5fb3")))).toEqual("a1a726de33b6028f6d75beb140c0fec93abbcd0b985e6dda3bf818af8e2b7096");
        expect(toHex(await Sha256.digest(fromHex("23501486108f3de2e9524c2efe")))).toEqual("b3883f5c7978d40cfa25f60e26af8e26480586df3bfb5f238e53f3a5f241fb92");
        expect(toHex(await Sha256.digest(fromHex("6e33b6d645acd2c80cedb84500cd")))).toEqual("e208985459aa801305493a313178d45d74e73b26ab268ecc57762d1f219b1dbd");
        expect(toHex(await Sha256.digest(fromHex("eafff26976bd4f943a705e36e62a69")))).toEqual("48a1434c314bc67604fcae1eff83f17cf05ae693b6427cfae3b1f6692488d8fb");
        expect(toHex(await Sha256.digest(fromHex("522051983c571eff97886f19b08fbe69")))).toEqual("1f73010d11dbc5c283bd2ecf00b1e8d3745095260e1fcf00a3abe0f0cca4a2e5");
        expect(toHex(await Sha256.digest(fromHex("fb487ffdc5115f00ee6d5b7437e990b78a")))).toEqual("ffe14ff1bec3d445a8e6c6f8cf66d054d9b0fd00032dd1fe7fea7defe2cb88e3");
        expect(toHex(await Sha256.digest(fromHex("e5158768a77c5fb06ed06ed333aa54a6c185")))).toEqual("8bf02c8642733293011185538969d1799f5ce86df439930f995c4e3e530089fb");
        expect(toHex(await Sha256.digest(fromHex("87583947befaad4b43b4dd48fba48d659f679c")))).toEqual("12b778aa6a84e7ffa6449f394e4a2f90af4bea3dc85e55ab2476216a87689b82");
        expect(toHex(await Sha256.digest(fromHex("620418d700021fbe28e0173ce6102dfd3bc0a303")))).toEqual("186acebbf96463131aa08f68e1ecf96bd17a041bf4ff054585de252b85efcf6a");
        expect(toHex(await Sha256.digest(fromHex("68f055aeb433075ce3e29c4763a49a5919d90cdccd")))).toEqual("dbf521256dafd25f7e35e58e3be51664f950292073a18ebd9a13e06b5b82965a");
        expect(toHex(await Sha256.digest(fromHex("c1faebffad2bf41ef1b65c68632ca044ed9a572a4cb0")))).toEqual("b62c1a8fd2258e256b06315d1c2d98746ac18d7b170ead81999b6110ebf69601");
        expect(toHex(await Sha256.digest(fromHex("5c861f96020cc754b59066431ec96978fe0ab7fd9d1d0d")))).toEqual("5d3f355244c3b1e8904c7bed52bfc412b5cb8922634a20088d7ee7061bf2fb33");
        expect(toHex(await Sha256.digest(fromHex("9bbac4e256126423dfdea90be07315fb057f1523137c9c02")))).toEqual("f9508865f80493f20a01a0277bed6e111149dbd99b9808578abcc26cfe090a0a");
        expect(toHex(await Sha256.digest(fromHex("ec77f4ecc1f6edfc63dffbfe2edf3fc9d348d3544a70888c1e")))).toEqual("af0ca3504e8364ffceaeb3601e260f0fc43f9c565e76c3434cf16166ef62cbc1");
        expect(toHex(await Sha256.digest(fromHex("8758d30e8dd41c7f4449c4f719f4aafa900d836d3919f6bed77b")))).toEqual("ae4bb846e12b020a438565fc6001340b8c05c2f9da4ca416c60061d7f271a582");
        expect(toHex(await Sha256.digest(fromHex("d4f2a3729002173ab3f226c88fbc8c6b3cf7b73f9bad2bb8888569")))).toEqual("a0d93864b001794ca7e99e354ddb595929863f3338c5840598988d5782bd28db");
        expect(toHex(await Sha256.digest(fromHex("e4d8ebfce3d71014659ac8afff185e6c96a6d404accfa70d794ff56e")))).toEqual("c8a86ee18a1f5be4a513b647afde990acc08699a66862c21879de3d10e73a0fb");
        expect(toHex(await Sha256.digest(fromHex("0f212467411d16e92afbfe5b622de745b41d631b2eb5477153be84ff95")))).toEqual("d5987e1e058d24e929c4acdb342a8ad290de72bf95d534d84b49629c4a4e4200");
        expect(toHex(await Sha256.digest(fromHex("4eda3360c3e4bd5e40ed0b9efa421a43dc364752333fa9f317db86b6e5d8")))).toEqual("68c0c4f2390a0a5415d9acf86c659b148372ec1882687586251997c7ce519cb7");
        expect(toHex(await Sha256.digest(fromHex("95a4f9b80ad217fdf65ac46bf3be11d49cf03f013e72fdf6b3d9c6be560508")))).toEqual("a08a038debfe196f35d8f0087f9f2fab1c0a10e3b01e6b2b80376a3da25c0b1f");
        expect(toHex(await Sha256.digest(fromHex("a0fba76b5e023c7e0cda8b843b4105a7f0091092fdc254df303b3c26f4a1f8d3")))).toEqual("9f3d31e526c953d6d14acc8768d890f800d09ddfa361797571f30b854b53d9c0");
        expect(toHex(await Sha256.digest(fromHex("e58fd27c82c2f2605600d10cdce144c54dc24f90c2d6e7ce7e8fa02fc32f247565")))).toEqual("95d42ca4521f927bd726fabd165f37e0da75b93407bf207eb2ccc8bd8ea1a8a9");
        expect(toHex(await Sha256.digest(fromHex("7b92504499e1290321c0fc7203f6c7d9912cc4be9521aea911ab14fdbfba79bc112d")))).toEqual("eff00679e3b10e40e7f3f2b15070ebb8a5f0897efec7ac7ae55b39c569c2cb00");
        expect(toHex(await Sha256.digest(fromHex("d515195525f3d271ca8072e23b86a00c603b0949c5a23a3e13078319046519671169dc")))).toEqual("d2e644512d4b18f01dce2f8481ab99af5e7bfcd0e82c67fb36eb09dfb0399858");
        expect(toHex(await Sha256.digest(fromHex("c399a4765aa46378b1cb64b7bd9d84ed6e288052d1d1cf5dff6c0d0b12dad359578fff51")))).toEqual("f08f6b46673f1a596ee4e493cb5136dfd5020e2af13869b1c297e0341ae99de5");
        expect(toHex(await Sha256.digest(fromHex("d1e565edf6f4ee2b12a16b440712d9e52d890c96f3ee91495e53156a196fbbfa46a7474f64")))).toEqual("b8edc023612884c4d42b55161455c250e3f560962a835a2afbdfbb25a4b51c39");
        expect(toHex(await Sha256.digest(fromHex("31a55caa88925a63484e53d946b5fe86b34a221519fd341ae1e77c7c4196ddcd174f16c98263")))).toEqual("db84214c82f246ef781652f39e39d8594b5dee43a2d9ffa3f67b4bb11ccac40d");
        expect(toHex(await Sha256.digest(fromHex("3d888a1040affd114a719d42ef733314612618aca03ab040f35ec71543ee1f02edc37ce6a84c49")))).toEqual("2447efdba2dd415fa6454a944c43753f9191ae5c7b0dbb065ca5c468da0e4cc7");
        expect(toHex(await Sha256.digest(fromHex("0f801c7fc8ff2ee603c63cf1ae42d1dc9d73497245341986c2c39d08075e624998c47694e038806c")))).toEqual("4a5051fb9ad23815d88b9e003883169b25fd02bb1a06facb36aab35e252d62f0");
        expect(toHex(await Sha256.digest(fromHex("bede92ec1ab0bf966c7bc098db7807b86a735a2b89ca7712f1f93b3faba69f2a867a5f361ca235a088")))).toEqual("39a6b566a9d5a3ab3be43d022d06a77338821a891bb952431dc500220e3d62c8");
        expect(toHex(await Sha256.digest(fromHex("47b80bc42fad7773884849297b4ba941ddd42fc14fca3c39e2dfcc48c6afca7d8c9d55d5156473c3440a")))).toEqual("28ca6ab9e8b5aba81389ebb03273f09f54e398497632a5826b39b41920cec687");
        expect(toHex(await Sha256.digest(fromHex("9522c8a3990d3d4ccb4c3d41c9b4655ddd35c33307d4efeb74c583c29bfb84a98954cc5868c23c78127589")))).toEqual("e0a7c694a3700fec0a16335375641371a9c2b2c68b4da08ae67ca1feada33ae8");
        expect(toHex(await Sha256.digest(fromHex("169b7817ed75369341658cc854ebbc0ac11a531f94c1f4b9260732610803b0f2096a2e9a65b6c642c2546442")))).toEqual("12bd7465b0e681478552b94dcf6074ca70529d18492d857fc8e658c3398ae5b1");
        expect(toHex(await Sha256.digest(fromHex("4f52b6723e7165f12d76a70bb311c04fda7e68faf091bcaf77065ed3e77015d82314a252efbd7cc4a92473cf60")))).toEqual("c0ca351e2a50e8d1e2e0e994a7f91fc6cf338822fb0fcdc388342a5f99f0a62f");
        expect(toHex(await Sha256.digest(fromHex("f38b8c4fdc73f40e3253c1b3b14f196558380a3413d34924e0487f5aa77b3384e9f6e046309aa062f7c813b601e1")))).toEqual("6da821d8b24a88eaa765d0bfc4abc03e147e15bd62dddde622fede4532944d52");
        expect(toHex(await Sha256.digest(fromHex("41705ae5a1d12fbccb4426cc811262d21c0c46dfd2dcd8ad7b92cc939b5549e063ac399a1e5613b545364f18f7bf4e")))).toEqual("6eeac8187bc0564f68e63cd9231ff6f352c18461907a2fb1c2de93acd44940bb");
        expect(toHex(await Sha256.digest(fromHex("cc70e84af58d027f5ff15b6fde96ad30450d7f871c423a3531ae6ffadc8dc87acded57d0421ba15e237575c04abe8e12")))).toEqual("f0b28375878e437940d7ee4e7bc2db4c4c8b5d3b6be0c0755c10aeab00a29ca3");
        expect(toHex(await Sha256.digest(fromHex("2dadcc9fd75291b810439ad51b29502464f810f66e6998f348f4e2b5d5f128570ecb1fd671c9423e71da3eb5f6df1e2f33")))).toEqual("510f97486b03ff7af1feca9d0308239f63b4f8349f1fe2a577cf9da93e23ac3e");
        expect(toHex(await Sha256.digest(fromHex("0c086b9c06e92746e5325b86c9d8423abbee782e0cff47bfc618fcf49a1e09fb5c031089137553268d63aaee75a662d93c87")))).toEqual("ba5369c00659ac9c5337a38e51feae0f005b0123c9909fad5bd4605bdfe9c445");
        expect(toHex(await Sha256.digest(fromHex("ddbb8c24637ff24e073e9ee299ad5e73493c6a3ad0eebe0d5130a65f3336906378a02e84b2df4d925dddbd44e84234f80b025c")))).toEqual("a7f11830a67d3e2c7f4a37a4b5d274d4d0f3840b86148f1af85170e230333188");
        expect(toHex(await Sha256.digest(fromHex("6651a6054e16d4988752fe56b3e4088cf86ff6ca90eebc0e3e5c4a5f14bf9cf643bf8652827f439f6549351356d2761632bb14a0")))).toEqual("3f400ec10fb5ebd455ee9175661657ed36d44aa6ead84f3772fb7b164d40b29b");
        expect(toHex(await Sha256.digest(fromHex("18532af22d7f1e2a18abc479cf6e899561c4a9a92ab27967d2e079ae69b651f01a9c95aa6908623d2ded86aed3a14e361d7acc465b")))).toEqual("d523310b1faf11c3fa9ffdec513ef15b41defdb877b4e9525b2519c8b1e5c909");
        expect(toHex(await Sha256.digest(fromHex("c022f99c785a0f2f1210f27d94cfd60d9c99368c469882c18899f7fdf2bf12e6be231ba8f6858368678596d64328fba2870f526d4c0e")))).toEqual("7f9ecd5c9f908d5794a065d457dcd31dfe6469aa680f1b58c8cb666abd17c1a9");
        expect(toHex(await Sha256.digest(fromHex("966d0d84d3f2bdc957935613d946509145b3345c90ba2244810ea6095eabb9c4f785868e61115b23aadb8cdcde99fc83509d52cc67d582")))).toEqual("bcf40210b6a8caee5751984946eebf7fb411f8e5e0fd5162e5c640e6b2a85075");
        expect(toHex(await Sha256.digest(fromHex("7b5e2ff358964bce486dea8c9b85176ebe361ca9c8a81487187d72773232bf2ee9576e02568ae3cb740c05b8a2bcfd7fb9b03eafe41b9a93")))).toEqual("1cf74ec4b3315d56faac576d2dbaf1d62d53e0d59a256e6f5c83c496a71887a6");
        expect(toHex(await Sha256.digest(fromHex("dfc064e095b6e2cc8dcee66470fe361ef1dcea43b9513e7154d2c12c357c5a1c86f59ba0837c1ad55314a5d2d36bbde483ee7700cfb0abbfc7")))).toEqual("5b8e6ca7ebfbf16b9ab45d9beb2789990713d61ce01823569d7b5a34cdb4b9c0");
        expect(toHex(await Sha256.digest(fromHex("ea76a6e9f25f8b634f9997bdbdf34780d6d1e206c404d1adf7df45ea579d64e5eec7d847faa1423636cce2823333e0bf7b2789f9968f997b45e3")))).toEqual("ec7994335933794f14bfe62ed48841383b163af4d916b10c60614d1796f06d37");
        expect(toHex(await Sha256.digest(fromHex("d73f2d890a180ae81922e250e43f13484ef5679bd5cf8baac362dea4fe58f60cb9cb87802d72fab4132c505695fa4e5e499b6d8f8ca5a13e57c508")))).toEqual("139508399c2b7ac0a49ff2b316443046860e7d932f21e7517cbbf6172542fddf");
        expect(toHex(await Sha256.digest(fromHex("970dd3b6376c81f6fc633f10c32a14f5ce0dec000c4d47578c5e6ef7aee8f31fdb3767d46e1376097193e1c030d8e1ccdde953f8b0c1c78d5fa42fb8")))).toEqual("a5674de8d6bffaa12d400c8846e8748cb13273c649779baf62ed258a4792dc01");
        expect(toHex(await Sha256.digest(fromHex("5506b56c3090990e3d33cf5e7ab66ad5a55cfed9e960d43caca74437cbbef28cf748f80a53f730e4b124b21d6c4823bd4bef135cd33e8abe6279a343ea")))).toEqual("e76fab992242da701c8238ff19ff2681ed304bd846df5cdc843be66dca51a5da");
        expect(toHex(await Sha256.digest(fromHex("7c72ded849bbebaeb8e56854039df5b4f8713840a992d4b4643eff24f2a60573e7f89eaf10efe903116a033f63a62017196dc27d189c55841c227795958f")))).toEqual("98e5de57125a1dab829fc0de9cb014b60267f3a4af412beaa2417a7f9c5ccfef");
        expect(toHex(await Sha256.digest(fromHex("ae4798b1ab6e006be45acc330baa0fe66cb17164b18f169026fddefb16cad07283c382008a0d7deaf08266d07627b7fa34e1299280f07ad1142a988b2061f0")))).toEqual("75a55f359dbfda6de4750467c18ebc50bba0f86c15ae146f00d2a319c16f1928");
        expect(toHex(await Sha256.digest(fromHex("3b47876f88f7c4e7ce09f8bb35240915391cd5d335f12b40b3da5e30eb504a196b484f864929c89793f93691ad4c062ee4861e811ef2c0c047266752ba43524d")))).toEqual("14609c054e038a8cb4f0886de99b31307f2e707a072c674abfa646161b6bff63");
        expect(toHex(await Sha256.digest(fromHex("293ba657b574043afb815d8baeb83b03499d61ee9229a32db39a8deb5edea3509d62cf54a15efefa68396940381b780410a53a1d742149729083beb205bad17205")))).toEqual("1a4e8df414957fac9338ad0031f77176ccce4575f40d5eeb44c18bce5a7ad812");
        expect(toHex(await Sha256.digest(fromHex("087ecfd0dde2f63a7246aafe357d3168b810e47a07f8eeb24082b157cdee2b8d86723f4dcf08047e1bc238c3e649808263312fc766dd0ed9346f07b91c5e8aa2856e")))).toEqual("c446a79314dab7d4e93c1a06dc561c1edce3dbd41a9216e745db5cfb58b4bd10");
        expect(toHex(await Sha256.digest(fromHex("c06e7a4d50f1038d0cc42b915d6d500297da6baa9311a946b381df248d5f1c9c4ffe52ba6c15f174d5a0365b193a8854c74616c4e2178e77a5286d86ea5e5e5f1d00fd")))).toEqual("0ee3a6c829c9a0a47d567b4add3224521ad9e2f3b7d5c1110a974c725f625b05");
        expect(toHex(await Sha256.digest(fromHex("676c2841c4945535a4be0407946507018ffd9a56a05d3ccee17549038e5df00366c7aaffa9063547685f0a0d2d6bee151d923ded73d06a7a468bf79d48b93694a513d973")))).toEqual("65b35ba31cbb29ad6bf5c885b3fa81c8e432bf4fc35b38b1031006113cefd14e");
        expect(toHex(await Sha256.digest(fromHex("eca5c2a10879dea022d18594548871f3d55310a113fa9fbc303b7fcee224aab34628637e19dd4a0128d28418630e6bd5717efacc1a944aef9529d8b014fc8049a4fa5f6b28")))).toEqual("70d209943c26f74c32132f6c72b387ceb8c7375e67b214930a306b4ed71117c7");
        expect(toHex(await Sha256.digest(fromHex("5fca053e81d9d1165e2dcb05c61af6daee510620d12cd359f55b91cf4d26a1fb5275e787e649f79040dd2e61fe42ab9e17403120921c62ca0bba185de631e9f0629f67499ade")))).toEqual("abeb92ac392ac96787d04481026bec5210c96a9cc9db2735d7cca73a53eb5d5c");
        expect(toHex(await Sha256.digest(fromHex("897704d8aa9a96f684a999e6e04a4e00e13c363f0dbdc4866b4cebbd0a9a181af61fbc13b546135248bf78c4cc8de88d297191489bd6d6d6e54be31550eea0b2a6ffdc78be579d")))).toEqual("aecc884db001ca82acb3e8568fe1934abdcadf0ed4b76ed5f68600a0671a30bb");
        expect(toHex(await Sha256.digest(fromHex("069e2c17b8a2b2c69979863a53d7c5a83cae7f51cee7b496d8d6e5628239b4fbdc9692b2b2cb7663c68290117bf15efda791654f9517fe08cd96814b3202324f9bbcd7af76f408d4")))).toEqual("7b9f7e72e2dc21d382ef002eda3404bb4707fa085b0f8c68142a31748b78c338");
        expect(toHex(await Sha256.digest(fromHex("554b3377a960eda40efea9fb9f97c68da8d9b269036558d5c40cc1d386f57c2bef45d07907b0d086bca6cb13131e9c5439cac1fc839d5a6e3c4132c5950def0dd075d38c62926bff40")))).toEqual("f3cd66a5aec9e1896a988e2bf1fd24a7c394f987e70edf2bf58d4bc988cb2c6f");
        expect(toHex(await Sha256.digest(fromHex("5b63e62b236aaf438d7774f53b76ad569b670e6689537f51ca0ab7fe23e89283305718759ad4c588194e3b76366873aced496fb763f0d77c2e3a544aa07f470d7a4023ec39c200fa52d8")))).toEqual("389d006116a6b368ea275b0152e7535b6c0d0acc19fc9aa1f217bb76164a6747");
        expect(toHex(await Sha256.digest(fromHex("a827215df69240b9fa27a5f0d01c81824725bb3b89ac58eaef5658657ffa5157b3ee6aefee529f7a0ee4160f5baefeefcb542dd8e96a43170b6e3bf3fbc5f41d6a00cb2c229790f801c86f")))).toEqual("a622312f496564e08edd2526c31d1232523bbe051baf351cb08b829b4cfec272");
        expect(toHex(await Sha256.digest(fromHex("793f35fecf83366e0f252ff50b639f70988bd87441fe3f6a01f60de59e2e331fa68e9e12c20d3918f4895392051d3958fe3248cd43bf298b7f417d6448e29a7ea96d7731b7e885e014374410")))).toEqual("cdfdee23fad49434b697448122522cceee85abd664b30d216e923fda6bce24bb");
        expect(toHex(await Sha256.digest(fromHex("c41419d5eed53e00812bb5fe549963c1e1df6a6a9450767f37774fe604033bbc2dee6348e2b2ca7e43697ccc45957ec27aa030a7c136feb81df63914cb0d38fde7f1be96009a993d62cbf27791")))).toEqual("e65f755c8890d288e8b234d490b5063996da0d9c47301d965f6ea87c7b1936d4");
        expect(toHex(await Sha256.digest(fromHex("38a6136f07c7c11c99b2255a8e5ddf3e5c0825cfb4f9c5245e8cbe8ebffabd28cae44117f52cb704e6928b07d0eadeaa10684f8a3a9727d94d1232a4d448b65b793ed71ed666e6bb239e8a6ff8a4")))).toEqual("9b87fd77dacb93cf2fb316c78bdbc5e5cc7fc480718823cd16cc0cc527baac46");
        expect(toHex(await Sha256.digest(fromHex("3326d34ca091609af2c5174d0d08eb2ddf0b341de4411d72be44228cbedea4047cdc388800ee6a557f260da19c23c016951970699d95d67ccff825f7d5f9c140cf484bd6ddca7e66aa8e8f3d7e0835")))).toEqual("b0bb87b246aad67cccb9a306e4768bad5f95e06f0e08a784b5a86dab9ba52b02");
        expect(toHex(await Sha256.digest(fromHex("3bad194f1615792001aa4805f0328eca6227ad785d6217285b9dc1cb79ca71e01e95ba91597781df728f6dd4d115c1848fb8f3dcb367cda35f17cb8ee897492f8fe067130b3b40b542d7929afb4f08e3")))).toEqual("b1f0065c655cdd4bc3ca68bdae1194df719a6ed45f299bb597c9fed006c36b87");
        expect(toHex(await Sha256.digest(fromHex("23ebd4b1d86bbf9ed8e1648b7bdbc2ec8c2f82c64018335c5c76e2cf908b11eb9c6eb2758cd0cc73f215c5979334b810f51ae39bbdcae98f8de9753e65e1c80b7606f3fcde32772a1603a4fdcd6fe3d109")))).toEqual("34745040df3050620965df4baa159ad79f1be50d93fd02c804c7cab741b2ae8d");
        expect(toHex(await Sha256.digest(fromHex("e6e89ab035b35fd24d2efd0465854f886539b8218d1f4614c9929d72ebfb33d574ec4b97ae51238c542570729db8053bec8bf770b63f5b3332b2bb5d3f6e3fd4a942804ae06b2e9850454a28bd9c8fd9d1a8")))).toEqual("a93e25f37d70efd4fe4e37754083efc23ad924bb41e944cfc7befbb1d828b2d6");
        expect(toHex(await Sha256.digest(fromHex("760cf0a6724676cf48cf494a4dd4b90040bf0622a3e3a6a315f587af8856b7c5899cb5c91fe499a334134ad6578ddb71cc255e087756929a972d282661b93618dfdcc9335d8c91aeeb94c7ae1d778468cd25f0")))).toEqual("4e77a9ee0224b965103c9125d0684b5d98c6935acd5644cae9917e834f693f9a");
        expect(toHex(await Sha256.digest(fromHex("1a687b6941e5ccf1292fe0ee45aa19429a5852b4c0cd8ea6074797dbbbe796dd694c4371f6bf1d8c73b6871a8b2e7c57525a3125bc7361e77581a7e27e6d38d925ebeb3df8c46ad3f650f48c6cc7f80f2b368c17")))).toEqual("5b831cc26f5bbcc8b6d0a62df829e8017dfd1773a80b138b5ca4d6565ac28d4c");
        expect(toHex(await Sha256.digest(fromHex("18340bcb8baef6d990d90f5cfb9fead4e380897219ae35073bb1db33f2653e58a0394dac354ddcb8444c5deb25844393ead5ee25211e944b222e9aaf73d3a6275b1f7f31459f1e6fb55c64aab1e482dd8c91fcd1c1")))).toEqual("dd331c4e1982f2a115b8c516156363b1c58d453fc68593038f568a61375e40e2");
        expect(toHex(await Sha256.digest(fromHex("e8507672c6d566d62970ee499c67f5ac9c44fb3c5d577c78e8fbb12ab48458259765e8f2f6d0e7a343e2d20abea2b3dc094cd26379f73a79af40ebaeb0304c01da08f4ba2f682d48291c05c056617ad340b60581af70")))).toEqual("f211d53a0e2e172fc456f23396e3a631e1a153f179e28d06529aca5c39ceca74");
        expect(toHex(await Sha256.digest(fromHex("a5e5d8f4cf5371c4702543f89ff7c1b46918288b5f06282d3e26489248b7b3e8135d9c71e9b2fa4436f004c45322da8476454b9c350e1bc477ed575504997a768b30d8ffb16023241e9c6d200819d3d9558d0af6d74211")))).toEqual("4da2ab81c2245fcd196d7cbc7ac5bd262e11ac7b34abb3b2e09a6534fd2a52d7");
        expect(toHex(await Sha256.digest(fromHex("790168da4356e71a50575f5629fb1bce51ef4ce99e9ce9988aeceb1f1624662526a300a4ea3b68225c86bdd7ae48e2b09764e0e939a6120ec30b8563b20abbacf42849e190a3483ea681a1910fab84210dd9443331ae39d8")))).toEqual("727954b75ab7a1e4513b113e05055cf8a78940241e319d359b7a92a7c78eda3a");
        expect(toHex(await Sha256.digest(fromHex("cd713c0d54e47c64ad36cf54769d87fc653e45b75622bd71ab444b8ada3d247cf6de7cbd68136b65fd7dcc46b829120c7d6ef12b416aa027c064f830342bd5426b91c4f4c6531779003f0f4a4850091a299c7b2d284d3cb84a")))).toEqual("52d52244b334667f16f8c4367c32e07b4b61d3ce1841cd0ec1128253ba225924");
        expect(toHex(await Sha256.digest(fromHex("a3786164b8b87a3d4a32d1ce5151341ab96068ee556e339e519c7c83ca19aaaa0577bb6502973f8f40ce87d6279f3384201fb7817075b92423beb339043512c4fa94707ca823e3ff4eefec142eff91838651679f198f2563e67f")))).toEqual("f61822440c88ce3b83ce2372a2a4b201139a324e6e19ec8797667b13abe18010");
        expect(toHex(await Sha256.digest(fromHex("fa6d2d40e0653597f75e394f45dc0b362b528cf2cc21a289fd280506a710e7ca844298f430caf1e4e0f021742eefcd301180a1d0a7a7fbc0dfd0db8c660efe9c833c6f1c9ff9b26eb4ce1be198487fd5127d953f6003b431560aa2")))).toEqual("153419b335d6ab697ee165364803812d80617dda1e4f053baaeea1ffbc148ea4");
        expect(toHex(await Sha256.digest(fromHex("3050ee1dc8f4c9ae18e85bebcf8de0412b8905c1582c0864dba61bb4be0ec35792c7de9c9de93ddd2b36aa6919a5fd955871c3a47dc307bbd804dcee613d55db0953c0354fe2613072f0602e9633ff0920159a1e6364dc6f81dd07c5")))).toEqual("37f1d7184e1308664d81f076231e0eced20d8d1e1af28dcc26e38d24084821e1");
        expect(toHex(await Sha256.digest(fromHex("27c57b7af9e3d12bd0080589e341e17d3a6005aaf22374c94c851ccd54fc8d1c5214055491032d16123c3e13bd1eb14df38dc775d04436af6ec77ff523b893df1fba68f785e77ddeab75aeba9b246901975c213f8f8946f716c657c967")))).toEqual("7e5cde6276be0fdb98c230b2ea39a511fac1b0cfd811a68d0f312af05d3adfe2");
        expect(toHex(await Sha256.digest(fromHex("92ca69e867f9761d84cb348535ad0a256f51e3a883cb81f2cf0b98803c76c7f35f7c24f960653b133e151097cb7dcc7d2fe1c4b4b295c4b1ad09d22cfd6f46719c55c5d479ff883811ee80ab458f5a73d97b6b16a9052e02248bccd04f46")))).toEqual("ef177ebe105881bb17d3130a8f88883f1ee8c75b9843aa24955ccffcecf35b4b");
        expect(toHex(await Sha256.digest(fromHex("af577fe64cb9e83b8db1213eb42e695361b09027fe028dae2caad2053896884d10369eda5c4e221115c306e2295845b84d37d416c24f48901ce10ba9ad9cb935182dd8c7c63e60a0c7b82a65a0c759a806a4b6f99b912f4334153a6c14850c")))).toEqual("c43d14a7250b39e1e39e628ed7d5dbfb1c77818ad49f959b7a99266e55ca06ea");
        expect(toHex(await Sha256.digest(fromHex("d60684ad738ecea11c36540bbc74b3c098bf0ac9d930708d09777f8d0bdaead29280dd0a547dfb173a499f27ab63b47bac72a378ed7a08c7b8ce3241e559a49ce8fe8298baaac3d1df3b12cb1976c850856798c9b5424f0e93f0e2eb808e018f")))).toEqual("37607b2655b0c134658e9c80063f875156deda87bff4675200d3665cbec59f44");
        expect(toHex(await Sha256.digest(fromHex("57c98fcdc1c6c073f316cf07b4cefb38f088e6cc29fd7504557db22a711cd71776743e9f1174d205b7a28737515bdd8ad90a68f86663ad0cc32e7ea77b8bbab2cd4555b2ac07c5550a4b3a9f6bd1a6cd4c88d309fed9434723b90e5f51c098fc59")))).toEqual("77e8c3f2fb95d755c575b43a86dc0b5e8d49f6dd72a79a47b0317207e92581f4");
        expect(toHex(await Sha256.digest(fromHex("89d5d2f1c2906224e80d259aaf9ceb4e3eaf10b4ff871dff0fd18699773b9c200db8fa2af9a1361363d6b588b56651f3ff05990bcc57e6975ee83ff5964af4647f423a2d32bf65718a4291665b158613af16f1f048d8f5872b350bc54640da3bdf4c")))).toEqual("755cab9ed51681c7e71795bfdb66015123f70a8f1190d4b41f3130aace642ccc");
        expect(toHex(await Sha256.digest(fromHex("23de91fbd7311a58b821b5625c7d055194dc1e5000be5d94178ad3fd67967941b5eab62a6b0f17e9635fd5c818ee6a51206a9a98b4177bce0adbd3b9844f69c941d3941a9345cafd5efbbbe70c287a6cc3063f1f941abe0229f4ce72e2bccc4e59700c")))).toEqual("596fbff31ff4e7163c27d3cd23d4ce7fc2a5192a22f3706f8727943fd7944e14");
        expect(toHex(await Sha256.digest(fromHex("876dbcd4e797ba073549e370b4d5d8ebd74913e72006cd9763cad301765d79236d876b168144c0fe621f1e80471caeed2024758967fc653c859229824f73977e55f8cf0078e098191cd077e3ec744534965a9c8ac1a92e566cec1125e397125b193a3aa2")))).toEqual("72f557042ba095fb1d73eccbf2d2e70f1cebada211c513bc3ac52d2c0b356279");
        expect(toHex(await Sha256.digest(fromHex("d81c941c365cd3532572caa53faf31d7c1666fe0ae5aacad7f69523386c6bf215e2aea59297b82faccbe4cadc22545d6bd882c8310d9df274d1fdec6060ce65a55303840fc7545900213b2b03032e6b1d0d8a35fab6a47772f653d1af8776705a5b4106cd8")))).toEqual("1d4b5dc2c54cf61381519d0b879e063d582a129dc5cff9226c4f406e28a25047");
        expect(toHex(await Sha256.digest(fromHex("a841ffa8dc92fee6791f624cc8c24d4b5f43e488eb555ac4932f8fae7c9e66382968084c3c548c72164247ea3eeb3fbc6391de092a100203ffa94854e494efc102b1a8e2493f5dd501f25ce29096ac55ad85f44829e6636563ee6be0a3831295af5d09e0c37a")))).toEqual("4f8296d2e2e3efcf851db491b68595676fb52a022817f72a5092c7d7210fad6b");
        expect(toHex(await Sha256.digest(fromHex("c4f0218c4e732a65de55d513068aca367b59cc77ac172159d10335b3b6b3cdafc497b870e5c8124826f2e8dcd819fa9daf5353ce8bfa06d0a3a51be5926bc5b1c48a7f8df8be079df93a5e31a83cee77689a9bc6a182ded5b416ab132c80953f8686297d8f5e1a")))).toEqual("8961c85d32aeba936958ac84d937155007a8a6c57fec71e74d5150c28c08b511");
        expect(toHex(await Sha256.digest(fromHex("7268f226b77b788b1d9117158bc9afc8badd165cdfa25b0bca050be6a571c043965d3c56d876a79ebcd2c4acb35ff08c8ebed3ea56717aab0d3d14542c478878ca5eaebd216b35ee6d0acf6de10696ac58d54f073923fa94e431fadb572b840c6c713a90ef45a1e0")))).toEqual("d50cbd42f2c915c3f295a920e22a0304e9752b8fb2595d92472599bd67d31dff");
        expect(toHex(await Sha256.digest(fromHex("c73e0b4a4053aabdf1e29a65b09d022f1394277bb21e0cf1bd1f9459bc7fb3835fba1c0b812e2867ccef884231f2ea42d9f11a689a4aea58ffe2c9a991f3bef2e779cf10d7326a3177cf14be3a607b86b4d57264dd6ae4a1e0984e520f286d865cc589ab8d56a85875")))).toEqual("16f36a7376ae6f436fc9b406e396e2aca7b198c75278963f2356ba8250b8fa45");
        expect(toHex(await Sha256.digest(fromHex("1a3800e5f2e087bd943b82f4a8e058078e08688112b90844dbc6862cdbcb5f94ae25f751222583eddf91fac7e07873ce903bf60b1f87ede724fb000b532b556524b4f39bcc2f18050074f3e75a9eca9e18746adfc6606524969e78764bf6b00d9a6b151e51ee1c289d57")))).toEqual("9bf5c1147b6b51f1282f17dfcadf9a145183d59e7787d2b1b66880072354a545");
        expect(toHex(await Sha256.digest(fromHex("7be4ea6fc4b5657a402cf56600a531050c2f0399e24a7355a70d0dceb2f7e9ea4d7b23ec4cf717ecdca6128e823cfa294bf77ef1130496bd55c4218ffbb5c3a13f5697ac9f274e5c023d1681c5eaa49d4242ef1c09e24ba809657ac70f14b7be3cdaaa1f9c086629c8ed33")))).toEqual("8e5facb215d8cda215f92e89837436a599781e4a4cf8969e01f60855e7fd0636");
        expect(toHex(await Sha256.digest(fromHex("53d2469d8ab1baccbc356941d1e46b57b619256dfed64cfc57fc8c0741e402c83f7d8423f216c92d16653403373fc1badadd248e2fb09da4ed919eae75a87e4a2eebe143c12ccc1122aaab91cd1ba00cd2e767f1372b2201a163678dab11c688da47eb4e0cba81efedfd7978")))).toEqual("c22c82136aca63faa9e94057df45ac1f1e0a42b76aca0c09a1391a1109aae1f1");
        expect(toHex(await Sha256.digest(fromHex("9ac84800c6414ad40047f215b244ae0080dbe0ad6d7df75c0080ead0b02f2fa06649f7dbadda4acba223a097bfcbf2040e13886c1733d5827d6feae5de7a60498ab0de5bacf4db7bfee612440903b91b66d836d643780af9cb6a703eadd3d9b1c66e0db2832eecbd892d86901a")))).toEqual("bb99e1adacb814e5a6515001edcf2444851b2dab7ee9baad7c7a6d47ec8c3ab7");
        expect(toHex(await Sha256.digest(fromHex("56504f109a5e577010eb5e98c6558e231943e0cfa32c0b2b0f3c2cd6a0054a2b9e9d75fa68877767daced55851447271f3af2ccb686f129cbead4c293e20c00d52fd75d1f99b19c124c24d455526fe1df9f9d219fcfa92972cd38c83a8138874b7366662f94c0bbe5d9b8365b9fb")))).toEqual("ec6c767c53b9b5184d548507b866be140107590733d8e7056607d9199479731e");
        expect(toHex(await Sha256.digest(fromHex("56bd9ca50966c8dc38740bacac77464870c10129f70ae0e6555ba1d10118bd050260c51ae20204be89e89ae584b7b0bd1c21f31b009298b516284bcd34c792735ae5b16fbe392d85af6528b6f262087b122bf7da5be633415934afc4bd492a6b5603ab3fa58944c6b65d327799e879")))).toEqual("d80bf63cf3f88309d76bee0dcff42e09c6af9a750df7328df23cd93ed6cf40ed");
        expect(toHex(await Sha256.digest(fromHex("9e6683645a4134573220706f51bc6fdbb0f68ac43ca634992ece5af9c8c25686456945fdabd1796fd541576d4a7399b1048548e43354381f170038838edd5e65225f0f0d3d286b1be618b4f55f4a7b7e549ffb1025fd6d5c1591678f8ec70f45f1a7c4ee6611169ddb2d04b9532f207e")))).toEqual("d8cc725d6a64608d317d677560488645603c8393f46c4da329d7dae6b496adca");
        expect(toHex(await Sha256.digest(fromHex("5d96be06103ae7db1a3ffeb6fd3a36767a75abbc12a2054fce11f0fdafff02a860d2e70633e37cbc7a5a2245a44850928d23278a2c77623e5e600c3317b04c7534ac373b557fd23ba7482cd984283dd8122d21aad43b0297950677ce46aed23151c5434908aa4452354810376b4b7f7b08")))).toEqual("d31d217a9d2529f9ed1447d0ef3299c1779d31569d9d05fdf5b3513fea6ce77e");
        expect(toHex(await Sha256.digest(fromHex("d985f6c0066654a39b02e59f699fbbc50ff748c08f6850ec5bf14133e7a4620fe28fe422bd9889139c1c9ac2650680631b22b68bd034d93980b65ac4e5ebb07cf5100c9728ffcc0ff6eea69a676e4bdd0017a24771ea83661952abf4e1d0e3f7f24b7862dd9d1aaad3d24dc05914df864c89")))).toEqual("f1dba5717f9c7b691170f1e231fc99ffa4e104ac58b9bf0faec98dee31cbc939");
        expect(toHex(await Sha256.digest(fromHex("b548c6f1220f0fa73d3ed439c1432f60a4e46ab6f83d926dc946d4c252470391ec2b44d9f1436b2c9b55f20238576020d95352180a94d6040204a74378219346a849685b7bc28bd164595e2c97329dd59631119cbb9e1d323bb1a83f7acf06f802659d1393485a7341ad04799e06b7814d0a81")))).toEqual("18b70142489c3c3558b779e0d4cda50350ebb1b143568a2d4f9501b0f9dc8f12");
        expect(toHex(await Sha256.digest(fromHex("b60732dcfea1fdc4149f277d7025bd5884c47283b7fca241ac21e217d7deb491f94f53d629fdb6dc61302f3b7cd14aa7fd91b9e703447b42395d82322e2e4f176c6e83f0924886a2ef0ccd14cfadda53f2aba7918e8a4c8dbd3f8075648b508f2c241c15f5177dd5acbc4d12ee4002d236267482")))).toEqual("9ff5de03f07ca1f14f9dae20aeb83f1bc68c062f20bb71f3cbf710080ef1d1b8");
        expect(toHex(await Sha256.digest(fromHex("89e1b7a0b3bdedbdbec67e260681dbcf2afcf814565a955604efff8d00409537fbc4077399f7626c11b342269a0b4b70beff1c496d7268f51af61586f179fa59b6a31ff530f3c72a7e35ca78c626c196b4f49553b7c87dfd0d6aecc7a10dcf535dcec1a63440765429294ef344ee49b68440b1ba3b")))).toEqual("77724ab3ba98a411d4bdea831e74fa65455367fcf893511b46deb8b69528e010");
        expect(toHex(await Sha256.digest(fromHex("9919ed7c116a6b2295385cc53914134cec53a09ee205c52e5bc7aae85cdfb1e5b901b1fe3e5a4b260c826cddc7603f050cc717c4831af65e3d6df0b72d5d4dc19137e8c1ea1952b62ca0fd0924d5bd4c875be68eba59672d28f38667b612c035c60c963f989104356b237e2478667dc09eb85dc50cef")))).toEqual("9579cbb4cc270b4833d0d2d5a8ceed5b2a9ba197ed3925cbacec39b8ffe88eb2");
        expect(toHex(await Sha256.digest(fromHex("fde621e8f6c28a3116d051ddde0ce49d951fdb32c699c794d272e2544034530d16660797bd9a2dd041aa1a52c88667c56e1972973689505216149814f8097cce392831b4f00d104837b22751fcc1b492f0f946d30c329d77e985f1d8ad2523489e980cfa25abd4cee8404262ac0bfdae59495af51de394")))).toEqual("84bc7e5cc1cd2451c1f4006423de65348ff516ca234d3e1db5974f2caceea7f3");
        expect(toHex(await Sha256.digest(fromHex("0bd9b05363d85a8c29335b7a0fc8775a14e4b3d318a07020c1760405fed790da50429bcd4107c316f52707603af7e7283cfcca0f5d7e265b53cc1899af5c2386a8f3d30a476289255eb3a8504423e8f9afd46b71dad21bbffd6cdf0f7c37ff811805f9e9f727966ab279bec9124384ee12e91556135ac64b")))).toEqual("0f25eb2a310b897d9fe5296e86fb54ca90a24a33c2350f7214871a76d83acdb7");
        expect(toHex(await Sha256.digest(fromHex("e01b90e74c37529ae3630977bb67d135cd40bb856ef72b5acf2cb1779cb4466b7ee622faa605d184a599f8eaffa1a4b66fa82f0f1cf3b6e8d61be885b346e6fbd0a7d3ab9001d5d092b4769149987de7aa07783e33c0bca6e04f2d51b06cb8d10fa1c6f8189e9f168f8bd1d179e736e089330d999dd1de1804")))).toEqual("2b202a19499aeb7ec32887183974ba38d222f1dddc1957e891c7637866c6d02b");
        expect(toHex(await Sha256.digest(fromHex("69de25ed8b06c25730de7d4f0f0b721418f7da3ffd0fed184d89ec7cc68c2fff7bba7328d5646ba5e1de9a10c7d8c48738500684f1c37f3f5627085f9c532f3369c79bc20d8fc4eea6098eefe809ce2fabe6815a73ad5bc596bca47229f15915138af98ebe1fd7a9dbf47e9cfa4236b8158187c8c7d6b0aa413a")))).toEqual("8e1578c57746970bbcf5208fed44a07297407a3b88050c9c1b2aa4dfbc371bb3");
        expect(toHex(await Sha256.digest(fromHex("ef8e3ce9e94140f5f23bdf1571a99524abbc97559c04c758ac7d38b2461ceeb8b9526069866d4debc20451ca7babe6938b619a7231c1e27af42aa0deb7533e08e768029bcd14f8e26354d672ae6633d75bca0b96aefbe1e553e3d27a77bf97b0b5dfe7801fcc98552a97e2a7ca6bff07a7dcad0b8758e00be9c9b6")))).toEqual("191951344b69cbab81a8c5161683d523959547443c7d991370e602e89c657d65");
        expect(toHex(await Sha256.digest(fromHex("c6ba237ff92b7017164b862f6423f427a2f7fc6b9e08db177ae8a0f525b96a5f8e6d3cec815fd0bc67082bd87ee4be865d207344f75e14bab8370cbff15535fe08bf69addd46d483ca0bfe3407d067885722a644346d401811827f6ff66bf32b7bfe7ffcea9abc33d0edc38183fde134eefa3e7f35edcd8cd96ed598")))).toEqual("d49655944cf84e2c736caa721990d87ec4a206d97697a6e69317c60cfe2ff880");
        expect(toHex(await Sha256.digest(fromHex("94a5b0b0884ec2a5b6ef06867ff449a256a905ec5353c2dde56722c1020e4b7a6c2ae6fb81907a8ea4a48fb1b5cd5821446f561488afecde2de4980cf60de4c4e8bda2e3b09fec46592134131be45b4105ddf7857bb793b94f7d58ad27d1856048f0896846791e17dbb050aa0b623884666ee13d2a0bed0963e054738e")))).toEqual("7715f423cb25126e8f60a84860d8e38d5a6dd405cea7b87928a855fa0ccd413a");
        expect(toHex(await Sha256.digest(fromHex("04fac7ec9ee4765731c4373ba10ab30e61902fc70b6ebf653bd1396157c05ccafc821928706bbc0346e750fba1c37c4b5b930ef70967c621b786da91055ad6d8a90e374d27cc65a830bfbb7346d3f6bade676d690394af5d02588b48c9482f651f0a4c9154a93b166f4b75f867af9dd34a943bd268a69456f4753f24368c")))).toEqual("32f8c89ff99fc942bebc45eef397b2e6957cb87a20887c8576fb1574c509956f");
        expect(toHex(await Sha256.digest(fromHex("16488821759e6757a19cbbdad74e956c576e55b76d6c652c8ab1683591e53845bd8943e6c63ee98f3735624d51975240b86043b36e904267a79679f685e1924cdb8c49700722e8b360f83b2747d00b982c568488eab5ad9d2860f20750ee11baebbe116ebeab2ba4dc12b21875019d29e78673404e6c5b2cf0174f93c41255")))).toEqual("9131972a3cdeaadd1bf73f449f89dc1bc8b0dfffa75ff6d32824c52695a39efa");
        expect(toHex(await Sha256.digest(fromHex("075d68d52224ee85a0f029e116c1894b0c673ded797f803ea298163d316c6b59c9584a0203d08f5f79f36891fabf8430cf9212c02fb2a287dec3ddc772003167909d68e912de0192817c085a6fb729accadb2acab6d5e91abeb92f4ce68123dcd4fad9f6ed80515142ef1081981a6c2d62b1630eef02690dcc71f120e661dcd1")))).toEqual("c00f6356a020b716ef4bb1c89c82bf7ce6e5dd167bfbf2c81ac5df42217dc3fd");

        done();
      })();
    });
  });

  describe("Chacha20poly1305Ietf", () => {
    it("can encrypt and decypt simple data", done => {
      (async () => {
        const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d8");
        const nonce = fromHex("7dfcbef658b1fe6edaf258be");

        const originalMessage = new Uint8Array([0x11, 0x22, 0x33, 0x44]);
        const ciphertext = await Chacha20poly1305Ietf.encrypt(originalMessage, key, nonce);
        expect(ciphertext).toBeTruthy();
        expect(ciphertext.length).toBeTruthy(4 /* message length */ + 32 /* tag length*/);

        const decrypted = await Chacha20poly1305Ietf.decrypt(ciphertext, key, nonce);
        expect(decrypted).toBeTruthy();
        expect(decrypted).toEqual(originalMessage);

        done();
      })();
    });

    it("decryption fails with wrong ciphertext/key/nonce", done => {
      (async () => {
        const key = fromHex("1324cdddc4b94e625bbabcac862c9429ba011e2184a1ccad60e7c3f6ff4916d8");
        const nonce = fromHex("7dfcbef658b1fe6edaf258be");

        const originalMessage = new Uint8Array([0x11, 0x22, 0x33, 0x44]);
        const ciphertext = await Chacha20poly1305Ietf.encrypt(originalMessage, key, nonce);
        expect(ciphertext).toBeTruthy();
        expect(ciphertext.length).toBeTruthy(4 /* message length */ + 32 /* tag length*/);

        {
          // baseline
          const decryptedPromise = Chacha20poly1305Ietf.decrypt(ciphertext, key, nonce);
          expect(await decryptedPromise).toEqual(originalMessage);
        }

        {
          // corrupted ciphertext
          const corruptedCiphertext = ciphertext.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const decryptedPromise = Chacha20poly1305Ietf.decrypt(corruptedCiphertext, key, nonce);

          await decryptedPromise
            .then(() => {
              fail("promise must not resolve");
            })
            .catch(error => {
              expect(error.message).toContain("invalid usage");
            });
        }

        {
          // corrupted key
          const corruptedKey = key.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const decryptedPromise = Chacha20poly1305Ietf.decrypt(ciphertext, corruptedKey, nonce);

          await decryptedPromise
            .then(() => {
              fail("promise must not resolve");
            })
            .catch(error => {
              expect(error.message).toContain("invalid usage");
            });
        }

        {
          // corrupted nonce
          const corruptedNonce = nonce.map((x, i) => (i === 0 ? x ^ 0x01 : x));
          const decryptedPromise = Chacha20poly1305Ietf.decrypt(ciphertext, key, corruptedNonce);

          await decryptedPromise
            .then(() => {
              fail("promise must not resolve");
            })
            .catch(error => {
              expect(error.message).toContain("invalid usage");
            });
        }

        done();
      })();
    });

    it("encrypt conforms to Botan implementation ", done => {
      // Test data generated by
      // echo -n "<message>" | ./botan encryption --mode=chacha20poly1305 --iv=000000000000000000000000 --ad= --key=0000000000000000000000000000000000000000000000000000000000000000 | xxd -p

      (async () => {
        {
          // zero key, zero nonce
          const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");
          const nonce = fromHex("000000000000000000000000");

          expect(await Chacha20poly1305Ietf.encrypt(fromHex(""), key, nonce)).toEqual(fromHex("4eb972c9a8fb3a1b382bb4d36f5ffad1"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("31"), key, nonce)).toEqual(fromHex("ae6a27b6da4558d07cdcedbbfb492835ef"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("3132"), key, nonce)).toEqual(fromHex("ae350370fac13c7de718c12b32e14cd5ca49"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("96b05f7f10383d00e4f64b1d68ae93d7831d15baf265c688beaafabff546bb65752ab4b0fd35b110dfdeacb78cfb099cda043dbfaa308bc6fe2495b848713d7e3c7bb5f24c36e8da3916b35f828f6ed65660a3a39d4c3a2b2d55c2eef5f1a16772c287ee3894debed0e089127592330590f5959dc50d277fa3e9ff9369bea50a1cd892534743871463031eedd88df0ae4faf835db9f83dd57827cb5569f55d3f71c2dae4a6e582c85a2be1ac143e52340db9528d92d16b808c75a72e99564612e8800416a1f83d3fa758c9fd5ab926c21490797b6b583f825905000f8bbdbc56f6448c439dc2d566db6d4b6f9ca69697afc1fc7642123b399bae707e1ba551d8d8e9ace7a3ecc70b8026a62dc5c5e1932cb8077a093d673276e544bbf1708a5491b7a9550956b74688a69cdde31d29d1ff776a12d17c3a52912fa3ff1a8e80d6b93767352be2d044ce22b8c12920c6c6e4797eb3f421a71e11a409e3838aa0c77ea71cf067dbb22a1f2a83845b07a7c48c28639e111ecbcf15b521b0d72de20042d6c536b48e98ae21c61a3bc628469ca63972cbb0f932cf275ac4d8cc23f5823691ec91f7f83a7b13b5a5940cebd2a1ac3ca5769efd329d900ff524acec5b2725815385c2c578783791ab5838975c63a8b533cce9abb7cbdf52e684635707f90be900c02304929ef0530908a863249a6c6b01c75352147665c276c04cddb1bd753937f4c012853707a5643063f2dd11aeb6f689fbbbdbf094761fe97894681b2a212c4bced4bd18c90df7f7ab7acab36a53c97539a9c9d554da8cf042dc3256fee93c5638c9e1b3bcf14054afb88acf347f66f9c529ebbcc48b7b3ebc126236e478fed25f1aa9aa34fb98ca63185d8759c387a8b93ad0a1f3370466e5fe78fdf8119fc804160a7ff3059004a9d29e0fedebed79212dcf83c1ed176ea457b112d081a2b7048c84ffa43f58884f2c5aab96e89a0bfbeafd9c7f90cdf5fa12cff526ac84df20ee66a742d125b63b9f484e806f0e3df84fbb09895032e2fd71fc2ed8fc9c5d7b5a32028702204634adb351b874ee4664e8f1aab7f764e7e90c995ca153a08e99a5bad4a18572eaabc4fbd09f6d38c56a0af2965bffc82b2918e75f8d62693061d482d5b3f4ad32873d55d197ff66243eb5f6b33f304abd167309a2c4798d5a25a2a1e3c9974e1380776457d131da5dffd1ea2cbdc3973836670e1ebddfe694121261fca9fec5757939fee026da32f29a4850586c757c6de1081ac349b1487cdf59c9da7954dd24dfdd554c771473ea6be9b2c7cf03967f0233325274ed2a742cd78f0dfc1e16fb100735a03bc9e0416e521d131de3145c1767f22d429b6be35286b44feaa2d1e04817408396597703165b604dee6c8a4062ff4923599131eaf35043e0425250858c32c61f80e0405487c7e55bfb8637496096da924147eef4584af4b7b2d7f0b99a73246c"));
        }

        {
          // zero key, random nonce
          const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");
          const nonce = fromHex("c6a7bc35cf9464e827fd2b73");

          expect(await Chacha20poly1305Ietf.encrypt(fromHex(""), key, nonce)).toEqual(fromHex("2d7490b8739cd0ef887076a911f15cf6"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("31"), key, nonce)).toEqual(fromHex("3f56b75279314daed9e5b004c1bda2c05c"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("3132"), key, nonce)).toEqual(fromHex("3f1444b409520fccfbcae0e437792a6bc859"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("07916aadc8c2faba0f570b32b149b21586225de407e903f04e2f80707b49abcb739d72ed85101e06a089231d475fa13155043685b97dd955ba7d4bf32b5db388a8a2fa8e42afc9a86abe32b92752e48daf6fc357617fa38749761412e1d68484650596d23a4122e29caa0b750c2711fdd31da15d1ade620675ac5ef89f817c1fea28ec6a0672d69d6dedfb38c3466f994910273e2f3fdbb65e347fac6fc24f3d85458cfaa60cbd69613bc5de546c5e507204de3cb4a4680b90be3f1b019b55d50fc1dd15c41ef518d0e0a5d02046a7fd4af641ec252c96eb4e367b3d5619e4a9635c93804ab27150b8a13c49bf23c848bb2d3c9779cc59268ab1aa5fc67e242e332898141b77bd21814a2e788b93cf86b2e2e90e4e7dfe1fdc099638b43cd950d48ba9c50976dfecbbf1d786d488ca7d210cb572995b210caa60eb5b7d91e26c33fc0edc862b1e8fc1e999f883b16a139ecb59a91ab7f68d60a05dc21d065dcacd3b5471825e79fc0b29f3f984a4680173260ee813d3e67db6b1d8565cb06e74790a19da90354d1458515de4d657f8713ce51b92971eb2ca88f3ed5dafdda2564400ee21ed1b8ebf4813fac48389d669186be7f3f72325e16d07e9a555d5bc5b17098bb66cf4750c8e1ee295f08a8d4ed9df9969c65ff46097fc885861243e29b61abfa62447b650cb63fa6d4642eb1b20f253d2ae0348c2540d362fe065be569ba29d6423cbc20c632f29994589d6f4cf61fea3283c1da6f1b67c407dec780da2983375a61f534fc5aecc6181debdda538213e24722b5027e1cd829e54accae40d7749c2c06bc6a34a2a81afd102ce50a7d896443d8ea5a0072c0a445a4e086409b4449aaf5e6185d0b7edfdcdb29cc4bcfa84b6d683ed73c19387df3336e348bfab3131d7fc188e1683d4b387d4659a99fc51bac9e39548ceee288c5ac1c14de4dd0ba2238aaa5717d25914ed44b079fe87e4bdeab1653129ff8eb0ea7e7f1841d3c6eedb8dd39b7c98672e53735dd45d650de84dc668c6e6e4f451383cc1d59de7f0b1737be1b0b6d449986ea25a15ca890ad5a113bf2db3ec5360b66320e13e335781ecc2d9267a7a0a6cef11a0666343c384583911ae94706b7ca56a2146980323542cc8aa3f8b9f6bc7f6830e2ec12b357a27711227dbb70973887629b6363b33c23400015ac43805d00f002f421fcdadeb0064a26946bf64adb0d097a94961618974c76539f91ea987edb6f007e2292f332b5938c046c03bf3d6cc93e949552896bf17f5420c3821b3f23f9cdf7400cf9f4c22089e28537a30731b946c3ba99235f50afb04a014aa008f90a6f3a43313ae24581ff340c6755f8b498675d53c143863487ca54077977e9d0e18e7e61ff3eeeec8b09cd6f1fedd252285f9c0b5e4b2b5fe7c50f6f85255fbeb9a00f6812b791256a5d6eacf3a80b1da4c4a45e201025ca3854253cf0aadd53bf7d"));
        }

        {
          // random key, zero nonce
          const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2");
          const nonce = fromHex("000000000000000000000000");

          expect(await Chacha20poly1305Ietf.encrypt(fromHex(""), key, nonce)).toEqual(fromHex("3efebc6509ba053589e3cc5b8f5ba686"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("31"), key, nonce)).toEqual(fromHex("22ea30196acb7422f8fe1be0ae65fc7f60"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("3132"), key, nonce)).toEqual(fromHex("22a5f2078a30e18b38b32d200609e7ceee35"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("1a2026bbc63a1f0693acb0ed69f5594155fb8da9b8e009f069b81e517473fad3fff88192ec2cdabea9d78ef7d5c981483df312502664dda6890018ab9886fa2f25c9eee9828a4af40c2bc939c4435e864458b44746744a2aa1cdc722e5f5aa83d108dfedd9d96b1c5c2998dc42fbfe9c280e390f1b342e3b3132596631d8702d3ddf93b0f813536df45640261f8b68ee1f2c255712af45c21cfb84177c47e7cda748d86ca487c60111c26a3e3fb8f39aa0b1d5b81c9cddb8c61dc7afb31042ae87646822fb83fcb124366eb44562a0599fba4188af516aeed72be715e9b71aa6fb7a9c9c18380fc45aa9d50b2937f54e5f4a0f3a4d334e80a55dd3b6b5c0e003f744072f4f7e3f60c5f9cb11ea237b1d750ef9305401cbd8c511e9491374f78d2ece5ea24344dfec34cd5485c43caa282765c7d0b0185f979e5ae6b14ef362907f57fab6eae0849d7e9e08853e8137b157cdc12930373814438ae9623ab6a31d612f0aa8e94bceea9cf35d284de2f004381ee40e0b925d5606371fa17458328fa5b2485aeb022aa5acb02e4a81f23d0f62e5a68d759bd0c149915ff2fa5b387bea476d6e71143aa0a9453485c862ca2385ab48ce35776d834d42607dafb97d42e15b5537a7b86e861e78e78d16bc54bdcb2e63c3258a9835cbd0ec5b029ba421b04261d683c0235852454a5cf38cb8538265869c1b0a94f24bee1a04159acc9996f3241a3220674f5bf4d2485dcadb29a8297e1d17841fc45f920939550d58a843304cce1781da3d928b1404d8b2c44ef7453407e99faad7d6970639fd7c6312e71c1a07fcee3aafcd7f510b11d4182d71c139edc2585030dca11277f6e89f167a92af0ced07f5b1b045b8f4f6ff6260846e9dcb05a8c72980f79e0acfe0ab254ad685d62e78d4d3f1a3e1b6064cb8c0030b4d3f3a4a72cd151f26436ddcfd1ee73d9b7b66ef02269f5436abbcd741bebc7bc3270b61d4bb68c5f96c96ed6f9614b5a4a9792d156e1353a5ff268e0902ee09c512612f1f1631fc784500ae20795eedf37e64a3cebb8fbdf8728bc1a7b1c01fe52f1a846c6b8571ae36503d26e05a56280d006c8ca36d0310c411f3a5771a4779ff19a6b6197e7335a42a6b921036eafc1ea514aaf8524109eb56ba8bac6024226711ce5d57f22cafb6c506cf5d328c2a97f801145df37a1bb036f85fdd47523142153d4de8d446daeabf9958cac2d88f128e3436bdb07fa434c993742071b6b95d473e1968ba77a1d0cdf8181749f40202791df4b3a6c53894d1d0c6474119fc40295f96a43bbdab217e014c3bafe64a5a95e1934a63a2522dd124edf899549a922a1fced76b442600ca311f929beeeb232c963f6d33d9c55968d4b3108bfa64d5e78b076e88dfa12c87ef1323bf11f7ee6124a14be3b5158dac19a6ac7183a1f5d1e630bbe7a3a210715c5ec496b68fd1b076dfb37cbdb8c24acc3283"));
        }

        {
          // random key, random nonce
          const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2");
          const nonce = fromHex("c6a7bc35cf9464e827fd2b73");

          expect(await Chacha20poly1305Ietf.encrypt(fromHex(""), key, nonce)).toEqual(fromHex("fd4781da3c6ca2edcdaa1158b445882e"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("31"), key, nonce)).toEqual(fromHex("827690c1aba07471bb1fcb877cb68fc6fb"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("3132"), key, nonce)).toEqual(fromHex("829cb534287df9e6ca9dcc71b5dcaeedb4d0"));
          expect(await Chacha20poly1305Ietf.encrypt(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"), key, nonce)).toEqual(fromHex("ba1976d9d8b14c6a3121b27bac95ea7f008ec09391b370cfdfff31f09dff08bc266c402c51174f0414323cc21f7bf8b68de8518586eb328df0f75b5fdaae629dacbda60d948aafbcd6f6c8422e8cef4e7b4f90fe1ae6ae32884e691ef58c60d0fa342ab668e6d7e94426f21acf76fbe8890b6333dbd1e94d52f4dea8142ea36ff2945bef1b42b4a56677b74b63dae62c5ee682fd4b8476d773df25640ac8c4f98878334bab132c83c565757e5d83d257af5960780b7fe0b20ef3c9688572dd2a66ab24ddd224e6ffb0d585a9355a3c713f750fc4b8ab318ee1b3804df1a60ab42b4f8ca607f5e9337c259000cb248f1fb9155afc7d7979dc9c030000a98506a78e00623a898ad2380815244cf077cc750844cea78ed61bd8ef48d25caf89b27f48b3c2517ada34bf76beb335cdf84f4f86158b71e16a0092a7ae8c45dc541689f7a4c899152cc0010d81f707f3010f7b7e905b3520cb10bd2e14f852f4346e9ec36f36b87d9992abc1ffb7298a76c28b5a5a5d0a8afa4d79ef2baece548340a2da7fc271d4d7e2b68eab4e74a9322f470266d4263b68ecf6140f16308f8d71a007d0c3be7efa3b86e46c2c23b40d2ce34a6b0f1c1aebe8634b9550489498ed2f568f4c79e32fd6349eadaf0194d5c415171066210692c963f1e716d3bb7dd122f5de907024cabc3586749910ac3c845e1c790effcf228b49b890ea33db83e90c586636b5c7faf8268e66e15ca49be80e5b22dd664ce0099dbd82f86edffd56ba253650b43c2b9936afa9053acb61a79bd7640ccd03768e5825c547ad0a91a989e767fb903725e839218068f1a7dc72e07edad36b3064fd01bd1dd87c34a6271e1ed765a79199b4ac82b40fabe972d637733ff52c4cd1ea82c187ff480db0331de9498177610ca58d90c1adb936e677f4b6e6e35b641de34001f44c61b634ce0e5c84b6148dda76c33212776f653963ddaf0669dfed65438b8ab60bb64f37086f602946735a8bf9fc1d91fb0ce9afd77e994f00d7f55805c454f79895c9939aec680c841b019c3b2ffcf25dabee6e31447470381dcf4765ab6a28647501f897b3c19599edfd24a89ab5388956074a04a977883081f019973e31fc3a1abc9bdd1356a5f3a59363560dbfc614ded6b8b783d4f3c40dc5aaf2001770b61f237252f3e94230fb2b81188c93e8d6e40122ee9248636d5492c95712852eb421b2d4e7b56ea984e7db0bafe03aa2077a59f3c24607fdcd23b5109a435c870eccc986b8635bc5e0e9cd0032f3ca2bd5b8d62fa0098833fa9ebb23446e0a531331d8b67804bba2591bb830732da83ad625f27f30f4d6c62225fa416f29048b11794fb3d408ed972d5c8d9e0545122315167264cadbce11950ddb4cd3674ddb791d2033781b2955ae8175a5f05fcd4aa6042e96eea60427b2670222b73960e65401f90ea6bb1861ba60afef630570c6c8390540ff0a"));
        }

        done();
      })();
    });

    it("decrypt conforms to Botan implementation ", done => {
      // same data as in the encryption tests, but reversed

      (async () => {
        {
          // zero key, zero nonce
          const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");
          const nonce = fromHex("000000000000000000000000");

          expect(await Chacha20poly1305Ietf.decrypt(fromHex("4eb972c9a8fb3a1b382bb4d36f5ffad1"), key, nonce)).toEqual(fromHex(""));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("ae6a27b6da4558d07cdcedbbfb492835ef"), key, nonce)).toEqual(fromHex("31"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("ae350370fac13c7de718c12b32e14cd5ca49"), key, nonce)).toEqual(fromHex("3132"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("96b05f7f10383d00e4f64b1d68ae93d7831d15baf265c688beaafabff546bb65752ab4b0fd35b110dfdeacb78cfb099cda043dbfaa308bc6fe2495b848713d7e3c7bb5f24c36e8da3916b35f828f6ed65660a3a39d4c3a2b2d55c2eef5f1a16772c287ee3894debed0e089127592330590f5959dc50d277fa3e9ff9369bea50a1cd892534743871463031eedd88df0ae4faf835db9f83dd57827cb5569f55d3f71c2dae4a6e582c85a2be1ac143e52340db9528d92d16b808c75a72e99564612e8800416a1f83d3fa758c9fd5ab926c21490797b6b583f825905000f8bbdbc56f6448c439dc2d566db6d4b6f9ca69697afc1fc7642123b399bae707e1ba551d8d8e9ace7a3ecc70b8026a62dc5c5e1932cb8077a093d673276e544bbf1708a5491b7a9550956b74688a69cdde31d29d1ff776a12d17c3a52912fa3ff1a8e80d6b93767352be2d044ce22b8c12920c6c6e4797eb3f421a71e11a409e3838aa0c77ea71cf067dbb22a1f2a83845b07a7c48c28639e111ecbcf15b521b0d72de20042d6c536b48e98ae21c61a3bc628469ca63972cbb0f932cf275ac4d8cc23f5823691ec91f7f83a7b13b5a5940cebd2a1ac3ca5769efd329d900ff524acec5b2725815385c2c578783791ab5838975c63a8b533cce9abb7cbdf52e684635707f90be900c02304929ef0530908a863249a6c6b01c75352147665c276c04cddb1bd753937f4c012853707a5643063f2dd11aeb6f689fbbbdbf094761fe97894681b2a212c4bced4bd18c90df7f7ab7acab36a53c97539a9c9d554da8cf042dc3256fee93c5638c9e1b3bcf14054afb88acf347f66f9c529ebbcc48b7b3ebc126236e478fed25f1aa9aa34fb98ca63185d8759c387a8b93ad0a1f3370466e5fe78fdf8119fc804160a7ff3059004a9d29e0fedebed79212dcf83c1ed176ea457b112d081a2b7048c84ffa43f58884f2c5aab96e89a0bfbeafd9c7f90cdf5fa12cff526ac84df20ee66a742d125b63b9f484e806f0e3df84fbb09895032e2fd71fc2ed8fc9c5d7b5a32028702204634adb351b874ee4664e8f1aab7f764e7e90c995ca153a08e99a5bad4a18572eaabc4fbd09f6d38c56a0af2965bffc82b2918e75f8d62693061d482d5b3f4ad32873d55d197ff66243eb5f6b33f304abd167309a2c4798d5a25a2a1e3c9974e1380776457d131da5dffd1ea2cbdc3973836670e1ebddfe694121261fca9fec5757939fee026da32f29a4850586c757c6de1081ac349b1487cdf59c9da7954dd24dfdd554c771473ea6be9b2c7cf03967f0233325274ed2a742cd78f0dfc1e16fb100735a03bc9e0416e521d131de3145c1767f22d429b6be35286b44feaa2d1e04817408396597703165b604dee6c8a4062ff4923599131eaf35043e0425250858c32c61f80e0405487c7e55bfb8637496096da924147eef4584af4b7b2d7f0b99a73246c"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
        }

        {
          // zero key, random nonce
          const key = fromHex("0000000000000000000000000000000000000000000000000000000000000000");
          const nonce = fromHex("c6a7bc35cf9464e827fd2b73");

          expect(await Chacha20poly1305Ietf.decrypt(fromHex("2d7490b8739cd0ef887076a911f15cf6"), key, nonce)).toEqual(fromHex(""));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("3f56b75279314daed9e5b004c1bda2c05c"), key, nonce)).toEqual(fromHex("31"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("3f1444b409520fccfbcae0e437792a6bc859"), key, nonce)).toEqual(fromHex("3132"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("07916aadc8c2faba0f570b32b149b21586225de407e903f04e2f80707b49abcb739d72ed85101e06a089231d475fa13155043685b97dd955ba7d4bf32b5db388a8a2fa8e42afc9a86abe32b92752e48daf6fc357617fa38749761412e1d68484650596d23a4122e29caa0b750c2711fdd31da15d1ade620675ac5ef89f817c1fea28ec6a0672d69d6dedfb38c3466f994910273e2f3fdbb65e347fac6fc24f3d85458cfaa60cbd69613bc5de546c5e507204de3cb4a4680b90be3f1b019b55d50fc1dd15c41ef518d0e0a5d02046a7fd4af641ec252c96eb4e367b3d5619e4a9635c93804ab27150b8a13c49bf23c848bb2d3c9779cc59268ab1aa5fc67e242e332898141b77bd21814a2e788b93cf86b2e2e90e4e7dfe1fdc099638b43cd950d48ba9c50976dfecbbf1d786d488ca7d210cb572995b210caa60eb5b7d91e26c33fc0edc862b1e8fc1e999f883b16a139ecb59a91ab7f68d60a05dc21d065dcacd3b5471825e79fc0b29f3f984a4680173260ee813d3e67db6b1d8565cb06e74790a19da90354d1458515de4d657f8713ce51b92971eb2ca88f3ed5dafdda2564400ee21ed1b8ebf4813fac48389d669186be7f3f72325e16d07e9a555d5bc5b17098bb66cf4750c8e1ee295f08a8d4ed9df9969c65ff46097fc885861243e29b61abfa62447b650cb63fa6d4642eb1b20f253d2ae0348c2540d362fe065be569ba29d6423cbc20c632f29994589d6f4cf61fea3283c1da6f1b67c407dec780da2983375a61f534fc5aecc6181debdda538213e24722b5027e1cd829e54accae40d7749c2c06bc6a34a2a81afd102ce50a7d896443d8ea5a0072c0a445a4e086409b4449aaf5e6185d0b7edfdcdb29cc4bcfa84b6d683ed73c19387df3336e348bfab3131d7fc188e1683d4b387d4659a99fc51bac9e39548ceee288c5ac1c14de4dd0ba2238aaa5717d25914ed44b079fe87e4bdeab1653129ff8eb0ea7e7f1841d3c6eedb8dd39b7c98672e53735dd45d650de84dc668c6e6e4f451383cc1d59de7f0b1737be1b0b6d449986ea25a15ca890ad5a113bf2db3ec5360b66320e13e335781ecc2d9267a7a0a6cef11a0666343c384583911ae94706b7ca56a2146980323542cc8aa3f8b9f6bc7f6830e2ec12b357a27711227dbb70973887629b6363b33c23400015ac43805d00f002f421fcdadeb0064a26946bf64adb0d097a94961618974c76539f91ea987edb6f007e2292f332b5938c046c03bf3d6cc93e949552896bf17f5420c3821b3f23f9cdf7400cf9f4c22089e28537a30731b946c3ba99235f50afb04a014aa008f90a6f3a43313ae24581ff340c6755f8b498675d53c143863487ca54077977e9d0e18e7e61ff3eeeec8b09cd6f1fedd252285f9c0b5e4b2b5fe7c50f6f85255fbeb9a00f6812b791256a5d6eacf3a80b1da4c4a45e201025ca3854253cf0aadd53bf7d"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
        }

        {
          // random key, zero nonce
          const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2");
          const nonce = fromHex("000000000000000000000000");

          expect(await Chacha20poly1305Ietf.decrypt(fromHex("3efebc6509ba053589e3cc5b8f5ba686"), key, nonce)).toEqual(fromHex(""));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("22ea30196acb7422f8fe1be0ae65fc7f60"), key, nonce)).toEqual(fromHex("31"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("22a5f2078a30e18b38b32d200609e7ceee35"), key, nonce)).toEqual(fromHex("3132"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("1a2026bbc63a1f0693acb0ed69f5594155fb8da9b8e009f069b81e517473fad3fff88192ec2cdabea9d78ef7d5c981483df312502664dda6890018ab9886fa2f25c9eee9828a4af40c2bc939c4435e864458b44746744a2aa1cdc722e5f5aa83d108dfedd9d96b1c5c2998dc42fbfe9c280e390f1b342e3b3132596631d8702d3ddf93b0f813536df45640261f8b68ee1f2c255712af45c21cfb84177c47e7cda748d86ca487c60111c26a3e3fb8f39aa0b1d5b81c9cddb8c61dc7afb31042ae87646822fb83fcb124366eb44562a0599fba4188af516aeed72be715e9b71aa6fb7a9c9c18380fc45aa9d50b2937f54e5f4a0f3a4d334e80a55dd3b6b5c0e003f744072f4f7e3f60c5f9cb11ea237b1d750ef9305401cbd8c511e9491374f78d2ece5ea24344dfec34cd5485c43caa282765c7d0b0185f979e5ae6b14ef362907f57fab6eae0849d7e9e08853e8137b157cdc12930373814438ae9623ab6a31d612f0aa8e94bceea9cf35d284de2f004381ee40e0b925d5606371fa17458328fa5b2485aeb022aa5acb02e4a81f23d0f62e5a68d759bd0c149915ff2fa5b387bea476d6e71143aa0a9453485c862ca2385ab48ce35776d834d42607dafb97d42e15b5537a7b86e861e78e78d16bc54bdcb2e63c3258a9835cbd0ec5b029ba421b04261d683c0235852454a5cf38cb8538265869c1b0a94f24bee1a04159acc9996f3241a3220674f5bf4d2485dcadb29a8297e1d17841fc45f920939550d58a843304cce1781da3d928b1404d8b2c44ef7453407e99faad7d6970639fd7c6312e71c1a07fcee3aafcd7f510b11d4182d71c139edc2585030dca11277f6e89f167a92af0ced07f5b1b045b8f4f6ff6260846e9dcb05a8c72980f79e0acfe0ab254ad685d62e78d4d3f1a3e1b6064cb8c0030b4d3f3a4a72cd151f26436ddcfd1ee73d9b7b66ef02269f5436abbcd741bebc7bc3270b61d4bb68c5f96c96ed6f9614b5a4a9792d156e1353a5ff268e0902ee09c512612f1f1631fc784500ae20795eedf37e64a3cebb8fbdf8728bc1a7b1c01fe52f1a846c6b8571ae36503d26e05a56280d006c8ca36d0310c411f3a5771a4779ff19a6b6197e7335a42a6b921036eafc1ea514aaf8524109eb56ba8bac6024226711ce5d57f22cafb6c506cf5d328c2a97f801145df37a1bb036f85fdd47523142153d4de8d446daeabf9958cac2d88f128e3436bdb07fa434c993742071b6b95d473e1968ba77a1d0cdf8181749f40202791df4b3a6c53894d1d0c6474119fc40295f96a43bbdab217e014c3bafe64a5a95e1934a63a2522dd124edf899549a922a1fced76b442600ca311f929beeeb232c963f6d33d9c55968d4b3108bfa64d5e78b076e88dfa12c87ef1323bf11f7ee6124a14be3b5158dac19a6ac7183a1f5d1e630bbe7a3a210715c5ec496b68fd1b076dfb37cbdb8c24acc3283"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
        }

        {
          // random key, random nonce
          const key = fromHex("1e1d2cd50e63f38a81275236f5ccc04c06dbe7a9b050eb1e38cb196c4125bbe2");
          const nonce = fromHex("c6a7bc35cf9464e827fd2b73");

          expect(await Chacha20poly1305Ietf.decrypt(fromHex("fd4781da3c6ca2edcdaa1158b445882e"), key, nonce)).toEqual(fromHex(""));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("827690c1aba07471bb1fcb877cb68fc6fb"), key, nonce)).toEqual(fromHex("31"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("829cb534287df9e6ca9dcc71b5dcaeedb4d0"), key, nonce)).toEqual(fromHex("3132"));
          expect(await Chacha20poly1305Ietf.decrypt(fromHex("ba1976d9d8b14c6a3121b27bac95ea7f008ec09391b370cfdfff31f09dff08bc266c402c51174f0414323cc21f7bf8b68de8518586eb328df0f75b5fdaae629dacbda60d948aafbcd6f6c8422e8cef4e7b4f90fe1ae6ae32884e691ef58c60d0fa342ab668e6d7e94426f21acf76fbe8890b6333dbd1e94d52f4dea8142ea36ff2945bef1b42b4a56677b74b63dae62c5ee682fd4b8476d773df25640ac8c4f98878334bab132c83c565757e5d83d257af5960780b7fe0b20ef3c9688572dd2a66ab24ddd224e6ffb0d585a9355a3c713f750fc4b8ab318ee1b3804df1a60ab42b4f8ca607f5e9337c259000cb248f1fb9155afc7d7979dc9c030000a98506a78e00623a898ad2380815244cf077cc750844cea78ed61bd8ef48d25caf89b27f48b3c2517ada34bf76beb335cdf84f4f86158b71e16a0092a7ae8c45dc541689f7a4c899152cc0010d81f707f3010f7b7e905b3520cb10bd2e14f852f4346e9ec36f36b87d9992abc1ffb7298a76c28b5a5a5d0a8afa4d79ef2baece548340a2da7fc271d4d7e2b68eab4e74a9322f470266d4263b68ecf6140f16308f8d71a007d0c3be7efa3b86e46c2c23b40d2ce34a6b0f1c1aebe8634b9550489498ed2f568f4c79e32fd6349eadaf0194d5c415171066210692c963f1e716d3bb7dd122f5de907024cabc3586749910ac3c845e1c790effcf228b49b890ea33db83e90c586636b5c7faf8268e66e15ca49be80e5b22dd664ce0099dbd82f86edffd56ba253650b43c2b9936afa9053acb61a79bd7640ccd03768e5825c547ad0a91a989e767fb903725e839218068f1a7dc72e07edad36b3064fd01bd1dd87c34a6271e1ed765a79199b4ac82b40fabe972d637733ff52c4cd1ea82c187ff480db0331de9498177610ca58d90c1adb936e677f4b6e6e35b641de34001f44c61b634ce0e5c84b6148dda76c33212776f653963ddaf0669dfed65438b8ab60bb64f37086f602946735a8bf9fc1d91fb0ce9afd77e994f00d7f55805c454f79895c9939aec680c841b019c3b2ffcf25dabee6e31447470381dcf4765ab6a28647501f897b3c19599edfd24a89ab5388956074a04a977883081f019973e31fc3a1abc9bdd1356a5f3a59363560dbfc614ded6b8b783d4f3c40dc5aaf2001770b61f237252f3e94230fb2b81188c93e8d6e40122ee9248636d5492c95712852eb421b2d4e7b56ea984e7db0bafe03aa2077a59f3c24607fdcd23b5109a435c870eccc986b8635bc5e0e9cd0032f3ca2bd5b8d62fa0098833fa9ebb23446e0a531331d8b67804bba2591bb830732da83ad625f27f30f4d6c62225fa416f29048b11794fb3d408ed972d5c8d9e0545122315167264cadbce11950ddb4cd3674ddb791d2033781b2955ae8175a5f05fcd4aa6042e96eea60427b2670222b73960e65401f90ea6bb1861ba60afef630570c6c8390540ff0a"), key, nonce)).toEqual(fromHex("09b7b8c14569057a7c4cdc611b839bda48123c1aba86a3e1ac6ca981c7a8c1885c9d95c661d3ff530aaf9f07f8233049ebe92297fb3a708352c59fa703087011117215142f10843b976862579be7cea3d8112d3ae69f58ed9d9684da5c51123a73e5b08627ef83b1f8feb3ef91ca8f1be327468e0cc2b3bffc1a8ef1291cedf80ff8320b90f0d17fb623c447e65f4fa48a17327d427d1aa6bb445c61dda9cc9b5c1611675e618fe6b79ab9bf045cfe0b1295aa72ff1c73d6641fb942a831506c0d268c628abff8925c011d222c443b73f18e994077f1c7a893123ed400cf2f11b8fa144c0d8fc5afcd2960281f067f1329cd4abf15a1a701762121b1e103db9538f989443fbc824d39fab22b622ec98632e957adbb39dd956f31b42af3629d8fcd461c9d4519105c0f308c7c45888583832c3c659b17b0733bc7257a9c00899a4ba9933c211579480e5c30d6837241a59d044280df466d55d0b46dcfa2db4c809023d77c2503ed3afd82489c98b0949baac0a00403af770e65c45607b615912eaf7c727b15cf976e742c1cb75fc160966dda4504edc7322a9479cb2617286c85b1412b9ffc067be3f9d2fd49568a29fe40115cf76de6dd7cc3f7e833bafbdffc39097150fe14960582a39d10102aa86718f59b102c89441806c80acfe300ea415be03162e729bd92a75b4e18a33470409034bc7fc7e9fb6c4823d6bfc77d75046c0927922dae805c7ced7a4a6fb4f46a15ee6b145e0dae56e6480ac726f7ccd5296fb2c82b5ebc2239eac2d81cea4fa789e0187134a270b6e74fc7932983e6e993e391ecc0dc9cb5963a644c6ece2eba6564533a330861eaac6120f84959e5b41ccbbe2255db17106a9955a94964ba07c5b1d1a0159f3f1e8f76f65181c17e3d616398df19fe6d8625922f5a0fd384b3238761a2003e5b5101c0c795c48ceb3ec72d9f7f5cf42df449075153f642f0ffb01414a5f6c7985855d752fd7c5a71d8eead5cf51681bb67adf267d5fb290933dff2aa25eff736616cb6437738b0121e4d14bdaf5e7e8009631ecb1f30bf574c7e3c6a79cd571dd08a38054cec4dce6fb7805a0fc8c729d75f1233bc85149e0bd1d13895855f71f2f57eda6101ed274c9e41468c28b97f5f969cc849ef5027c5afd57c24ae85e16e9659cd3954c9535d3218b20f191982df2dfad4fd13d0e33b24d83274ed6066814d70d41f84874c6072b9515aa5d2f0716d851a84533fd43f21c902fb54320e04fd0b7d05d169137482f82d46b275672a7c8aa51e4546ab494f0aa2dee67d5ea2476c0a7463af609727d52ac54054ee7f454f9420d5e9f5e28357c2b0745a466087d505919ae4923586649b5b3e845929c78ff4c22c6d5f8a31eb8eedb3351e6d5f9ce68dbb318a5d62bc116bdea32a77c46492a3ca52f06a00a14420daee72b97673ef6d4a3bc35a"));
        }

        done();
      })();
    });
  });
});
