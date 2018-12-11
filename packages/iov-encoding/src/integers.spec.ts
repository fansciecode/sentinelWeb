import { Int53, Uint32, Uint53, Uint64 } from "./integers";

describe("Integers", () => {
  describe("Uint32", () => {
    it("can be constructed", () => {
      expect(new Uint32(0)).toBeTruthy();
      expect(new Uint32(1)).toBeTruthy();
      expect(new Uint32(1.0)).toBeTruthy();
      expect(new Uint32(42)).toBeTruthy();
      expect(new Uint32(1000000000)).toBeTruthy();
      expect(new Uint32(2147483647)).toBeTruthy();
      expect(new Uint32(2147483648)).toBeTruthy();
      expect(new Uint32(4294967295)).toBeTruthy();
    });

    it("throws for invald numbers", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Uint32(NaN)).toThrowError(/not a number/);

      expect(() => new Uint32(1.1)).toThrowError(/not an integer/i);
      expect(() => new Uint32(Number.NEGATIVE_INFINITY)).toThrowError(/not an integer/i);
      expect(() => new Uint32(Number.POSITIVE_INFINITY)).toThrowError(/not an integer/i);

      // tslint:enable:no-unused-expression
    });

    it("throws for values out of range", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Uint32(-1)).toThrowError(/not in uint32 range/);
      expect(() => new Uint32(4294967296)).toThrowError(/not in uint32 range/);
      expect(() => new Uint32(Number.MIN_SAFE_INTEGER)).toThrowError(/not in uint32 range/);
      expect(() => new Uint32(Number.MAX_SAFE_INTEGER)).toThrowError(/not in uint32 range/);

      // tslint:enable:no-unused-expression
    });

    it("can convert to number", () => {
      expect(new Uint32(0).toNumber()).toEqual(0);
      expect(new Uint32(1).toNumber()).toEqual(1);
      expect(new Uint32(42).toNumber()).toEqual(42);
      expect(new Uint32(1000000000).toNumber()).toEqual(1000000000);
      expect(new Uint32(2147483647).toNumber()).toEqual(2147483647);
      expect(new Uint32(2147483648).toNumber()).toEqual(2147483648);
      expect(new Uint32(4294967295).toNumber()).toEqual(4294967295);
    });

    it("can convert to string", () => {
      expect(new Uint32(0).toString()).toEqual("0");
      expect(new Uint32(1).toString()).toEqual("1");
      expect(new Uint32(42).toString()).toEqual("42");
      expect(new Uint32(1000000000).toString()).toEqual("1000000000");
      expect(new Uint32(2147483647).toString()).toEqual("2147483647");
      expect(new Uint32(2147483648).toString()).toEqual("2147483648");
      expect(new Uint32(4294967295).toString()).toEqual("4294967295");
    });

    it("can convert to byte array", () => {
      expect(new Uint32(0).toBytesBigEndian()).toEqual([0, 0, 0, 0]);
      expect(new Uint32(1).toBytesBigEndian()).toEqual([0, 0, 0, 1]);
      expect(new Uint32(42).toBytesBigEndian()).toEqual([0, 0, 0, 42]);
      expect(new Uint32(1000000000).toBytesBigEndian()).toEqual([0x3b, 0x9a, 0xca, 0x00]);
      expect(new Uint32(2147483647).toBytesBigEndian()).toEqual([0x7f, 0xff, 0xff, 0xff]);
      expect(new Uint32(2147483648).toBytesBigEndian()).toEqual([0x80, 0x00, 0x00, 0x00]);
      expect(new Uint32(4294967295).toBytesBigEndian()).toEqual([0xff, 0xff, 0xff, 0xff]);
    });

    describe("fromBigEndianBytes", () => {
      it("can be constructed from to byte array", () => {
        expect(Uint32.fromBigEndianBytes([0, 0, 0, 0]).toNumber()).toEqual(0);
        expect(Uint32.fromBigEndianBytes([0, 0, 0, 1]).toNumber()).toEqual(1);
        expect(Uint32.fromBigEndianBytes([0, 0, 0, 42]).toNumber()).toEqual(42);
        expect(Uint32.fromBigEndianBytes([0x3b, 0x9a, 0xca, 0x00]).toNumber()).toEqual(1000000000);
        expect(Uint32.fromBigEndianBytes([0x7f, 0xff, 0xff, 0xff]).toNumber()).toEqual(2147483647);
        expect(Uint32.fromBigEndianBytes([0x80, 0x00, 0x00, 0x00]).toNumber()).toEqual(2147483648);
        expect(Uint32.fromBigEndianBytes([0xff, 0xff, 0xff, 0xff]).toNumber()).toEqual(4294967295);
      });

      it("can be constructed from Buffer", () => {
        expect(Uint32.fromBigEndianBytes(Buffer.from([0, 0, 0, 0])).toNumber()).toEqual(0);
        expect(Uint32.fromBigEndianBytes(Buffer.from([0, 0, 0, 1])).toNumber()).toEqual(1);
        expect(Uint32.fromBigEndianBytes(Buffer.from([0, 0, 0, 42])).toNumber()).toEqual(42);
        expect(Uint32.fromBigEndianBytes(Buffer.from([0x3b, 0x9a, 0xca, 0x00])).toNumber()).toEqual(1000000000);
        expect(Uint32.fromBigEndianBytes(Buffer.from([0x7f, 0xff, 0xff, 0xff])).toNumber()).toEqual(2147483647);
        expect(Uint32.fromBigEndianBytes(Buffer.from([0x80, 0x00, 0x00, 0x00])).toNumber()).toEqual(2147483648);
        expect(Uint32.fromBigEndianBytes(Buffer.from([0xff, 0xff, 0xff, 0xff])).toNumber()).toEqual(4294967295);
      });

      it("throws for invalid input length", () => {
        expect(() => Uint32.fromBigEndianBytes([])).toThrowError(/Invalid input length/);
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0])).toThrowError(/Invalid input length/);
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);
      });

      it("throws for invalid values", () => {
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0, -1])).toThrowError(/Invalid value in byte/);
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0, 256])).toThrowError(/Invalid value in byte/);
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0, NaN])).toThrowError(/Invalid value in byte/);
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0, Number.NEGATIVE_INFINITY])).toThrowError(/Invalid value in byte/);
        expect(() => Uint32.fromBigEndianBytes([0, 0, 0, Number.POSITIVE_INFINITY])).toThrowError(/Invalid value in byte/);
      });
    });
  });

  describe("Int53", () => {
    it("can be constructed", () => {
      expect(new Int53(0)).toBeTruthy();
      expect(new Int53(1)).toBeTruthy();
      expect(new Int53(1.0)).toBeTruthy();
      expect(new Int53(42)).toBeTruthy();
      expect(new Int53(1000000000)).toBeTruthy();
      expect(new Int53(2147483647)).toBeTruthy();
      expect(new Int53(2147483648)).toBeTruthy();
      expect(new Int53(4294967295)).toBeTruthy();
      expect(new Int53(9007199254740991)).toBeTruthy();

      expect(new Int53(-1)).toBeTruthy();
      expect(new Int53(-42)).toBeTruthy();
      expect(new Int53(-2147483648)).toBeTruthy();
      expect(new Int53(-2147483649)).toBeTruthy();
      expect(new Int53(-9007199254740991)).toBeTruthy();
    });

    it("throws for invald numbers", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Int53(NaN)).toThrowError(/not a number/);

      expect(() => new Int53(1.1)).toThrowError(/not an integer/i);
      expect(() => new Int53(Number.NEGATIVE_INFINITY)).toThrowError(/not an integer/i);
      expect(() => new Int53(Number.POSITIVE_INFINITY)).toThrowError(/not an integer/i);

      // tslint:enable:no-unused-expression
    });

    it("throws for values out of range", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Int53(Number.MIN_SAFE_INTEGER - 1)).toThrowError(/not in int53 range/);
      expect(() => new Int53(Number.MAX_SAFE_INTEGER + 1)).toThrowError(/not in int53 range/);

      // tslint:enable:no-unused-expression
    });

    it("can convert to number", () => {
      expect(new Int53(0).toNumber()).toEqual(0);
      expect(new Int53(1).toNumber()).toEqual(1);
      expect(new Int53(42).toNumber()).toEqual(42);
      expect(new Int53(1000000000).toNumber()).toEqual(1000000000);
      expect(new Int53(2147483647).toNumber()).toEqual(2147483647);
      expect(new Int53(2147483648).toNumber()).toEqual(2147483648);
      expect(new Int53(4294967295).toNumber()).toEqual(4294967295);
      expect(new Int53(9007199254740991).toNumber()).toEqual(9007199254740991);

      expect(new Int53(-1).toNumber()).toEqual(-1);
      expect(new Int53(-9007199254740991).toNumber()).toEqual(-9007199254740991);
    });

    it("can convert to string", () => {
      expect(new Int53(0).toString()).toEqual("0");
      expect(new Int53(1).toString()).toEqual("1");
      expect(new Int53(42).toString()).toEqual("42");
      expect(new Int53(1000000000).toString()).toEqual("1000000000");
      expect(new Int53(2147483647).toString()).toEqual("2147483647");
      expect(new Int53(2147483648).toString()).toEqual("2147483648");
      expect(new Int53(4294967295).toString()).toEqual("4294967295");
      expect(new Int53(9007199254740991).toString()).toEqual("9007199254740991");

      expect(new Int53(-1).toString()).toEqual("-1");
      expect(new Int53(-9007199254740991).toString()).toEqual("-9007199254740991");
    });

    it("can be constructed from string", () => {
      expect(Int53.fromString("0").toString()).toEqual("0");
      expect(Int53.fromString("1").toString()).toEqual("1");
      expect(Int53.fromString("9007199254740991").toString()).toEqual("9007199254740991");

      expect(Int53.fromString("-1").toString()).toEqual("-1");
      expect(Int53.fromString("-9007199254740991").toString()).toEqual("-9007199254740991");
    });

    it("throws for invalid string format", () => {
      // tslint:disable:no-unused-expression

      expect(() => Int53.fromString(" 0")).toThrowError(/invalid string format/i);
      expect(() => Int53.fromString("+0")).toThrowError(/invalid string format/i);
      expect(() => Int53.fromString("1e6")).toThrowError(/invalid string format/i);

      expect(() => Int53.fromString("9007199254740992")).toThrowError(/input not in int53 range/i);
      expect(() => Int53.fromString("-9007199254740992")).toThrowError(/input not in int53 range/i);

      // tslint:enable:no-unused-expression
    });
  });

  describe("Uint53", () => {
    it("can be constructed", () => {
      expect(new Uint53(0)).toBeTruthy();
      expect(new Uint53(1)).toBeTruthy();
      expect(new Uint53(1.0)).toBeTruthy();
      expect(new Uint53(42)).toBeTruthy();
      expect(new Uint53(1000000000)).toBeTruthy();
      expect(new Uint53(2147483647)).toBeTruthy();
      expect(new Uint53(2147483648)).toBeTruthy();
      expect(new Uint53(4294967295)).toBeTruthy();
      expect(new Uint53(9007199254740991)).toBeTruthy();
    });

    it("throws for invald numbers", () => {
      expect(() => new Uint53(NaN)).toThrowError(/not a number/);

      expect(() => new Uint53(1.1)).toThrowError(/not an integer/i);
      expect(() => new Uint53(Number.NEGATIVE_INFINITY)).toThrowError(/not an integer/i);
      expect(() => new Uint53(Number.POSITIVE_INFINITY)).toThrowError(/not an integer/i);
    });

    it("throws for values out of range", () => {
      expect(() => new Uint53(Number.MIN_SAFE_INTEGER - 1)).toThrowError(/not in int53 range/);
      expect(() => new Uint53(Number.MAX_SAFE_INTEGER + 1)).toThrowError(/not in int53 range/);
    });

    it("throws for negative inputs", () => {
      expect(() => new Uint53(-1)).toThrowError(/is negative/);
      expect(() => new Uint53(-42)).toThrowError(/is negative/);
      expect(() => new Uint53(-2147483648)).toThrowError(/is negative/);
      expect(() => new Uint53(-2147483649)).toThrowError(/is negative/);
      expect(() => new Uint53(-9007199254740991)).toThrowError(/is negative/);
    });

    it("can convert to number", () => {
      expect(new Uint53(0).toNumber()).toEqual(0);
      expect(new Uint53(1).toNumber()).toEqual(1);
      expect(new Uint53(42).toNumber()).toEqual(42);
      expect(new Uint53(1000000000).toNumber()).toEqual(1000000000);
      expect(new Uint53(2147483647).toNumber()).toEqual(2147483647);
      expect(new Uint53(2147483648).toNumber()).toEqual(2147483648);
      expect(new Uint53(4294967295).toNumber()).toEqual(4294967295);
      expect(new Uint53(9007199254740991).toNumber()).toEqual(9007199254740991);
    });

    it("can convert to string", () => {
      expect(new Uint53(0).toString()).toEqual("0");
      expect(new Uint53(1).toString()).toEqual("1");
      expect(new Uint53(42).toString()).toEqual("42");
      expect(new Uint53(1000000000).toString()).toEqual("1000000000");
      expect(new Uint53(2147483647).toString()).toEqual("2147483647");
      expect(new Uint53(2147483648).toString()).toEqual("2147483648");
      expect(new Uint53(4294967295).toString()).toEqual("4294967295");
      expect(new Uint53(9007199254740991).toString()).toEqual("9007199254740991");
    });

    it("can be constructed from string", () => {
      expect(Uint53.fromString("0").toString()).toEqual("0");
      expect(Uint53.fromString("1").toString()).toEqual("1");
      expect(Uint53.fromString("9007199254740991").toString()).toEqual("9007199254740991");
    });

    it("throws for invalid string format", () => {
      expect(() => Uint53.fromString(" 0")).toThrowError(/invalid string format/i);
      expect(() => Uint53.fromString("+0")).toThrowError(/invalid string format/i);
      expect(() => Uint53.fromString("1e6")).toThrowError(/invalid string format/i);

      expect(() => Uint53.fromString("-9007199254740992")).toThrowError(/input not in int53 range/i);
      expect(() => Uint53.fromString("9007199254740992")).toThrowError(/input not in int53 range/i);

      expect(() => Uint53.fromString("-1")).toThrowError(/input is negative/i);
    });
  });

  describe("Uint64", () => {
    it("can be constructed from bytes", () => {
      Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);
      Uint64.fromBytesBigEndian([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    });

    it("can be constructed from Uint8Array", () => {
      Uint64.fromBytesBigEndian(new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]));
    });

    it("throws for wrong number of bytes", () => {
      expect(() => Uint64.fromBytesBigEndian([])).toThrowError(/invalid input length/i);
      expect(() => Uint64.fromBytesBigEndian([0x00])).toThrowError(/invalid input length/i);
      expect(() => Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])).toThrowError(/invalid input length/i);
      expect(() => Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])).toThrowError(/invalid input length/i);
    });

    it("throws for wrong byte value", () => {
      expect(() => Uint64.fromBytesBigEndian([0, 0, 0, 0, 0, 0, 0, 256])).toThrowError(/invalid value in byte/i);
      expect(() => Uint64.fromBytesBigEndian([0, 0, 0, 0, 0, 0, 0, -1])).toThrowError(/invalid value in byte/i);
      expect(() => Uint64.fromBytesBigEndian([0, 0, 0, 0, 0, 0, 0, Number.NEGATIVE_INFINITY])).toThrowError(/invalid value in byte/i);
      expect(() => Uint64.fromBytesBigEndian([0, 0, 0, 0, 0, 0, 0, Number.POSITIVE_INFINITY])).toThrowError(/invalid value in byte/i);
      expect(() => Uint64.fromBytesBigEndian([0, 0, 0, 0, 0, 0, 0, Number.NaN])).toThrowError(/invalid value in byte/i);
    });

    it("can be constructed from string", () => {
      {
        const a = Uint64.fromString("0");
        expect(a).toBeTruthy();
      }
      {
        const a = Uint64.fromString("1");
        expect(a).toBeTruthy();
      }
      {
        const a = Uint64.fromString("01");
        expect(a).toBeTruthy();
      }
      {
        const a = Uint64.fromString("9999999999999999999");
        expect(a).toBeTruthy();
      }
      {
        const a = Uint64.fromString("18446744073709551615");
        expect(a).toBeTruthy();
      }
    });

    it("throws for invalid string values", () => {
      expect(() => Uint64.fromString(" 1")).toThrowError(/invalid string format/i);
      expect(() => Uint64.fromString("-1")).toThrowError(/invalid string format/i);
      expect(() => Uint64.fromString("+1")).toThrowError(/invalid string format/i);
      expect(() => Uint64.fromString("1e6")).toThrowError(/invalid string format/i);
    });

    it("throws for string values exceeding uint64", () => {
      expect(() => Uint64.fromString("18446744073709551616")).toThrowError(/input exceeds uint64 range/i);
      expect(() => Uint64.fromString("99999999999999999999")).toThrowError(/input exceeds uint64 range/i);
    });

    it("can be constructed from number", () => {
      const a = Uint64.fromNumber(0);
      expect(a.toNumber()).toEqual(0);
      const b = Uint64.fromNumber(1);
      expect(b.toNumber()).toEqual(1);
      const c = Uint64.fromNumber(Number.MAX_SAFE_INTEGER);
      expect(c.toNumber()).toEqual(Number.MAX_SAFE_INTEGER);
    });

    it("throws when constructed from wrong numbers", () => {
      // not a number
      expect(() => Uint64.fromNumber(Number.NaN)).toThrowError(/input is not a number/i);

      // not an integer
      expect(() => Uint64.fromNumber(Number.NEGATIVE_INFINITY)).toThrowError(/input is not a safe integer/i);
      expect(() => Uint64.fromNumber(Number.POSITIVE_INFINITY)).toThrowError(/input is not a safe integer/i);
      expect(() => Uint64.fromNumber(Number.MAX_SAFE_INTEGER + 1)).toThrowError(/input is not a safe integer/i);

      // negative integer
      expect(() => Uint64.fromNumber(-1)).toThrowError(/input is negative/i);
      expect(() => Uint64.fromNumber(Number.MIN_SAFE_INTEGER)).toThrowError(/input is negative/i);
    });

    it("can export bytes (big endian)", () => {
      expect(Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).toBytesBigEndian()).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]).toBytesBigEndian()).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);
      expect(Uint64.fromBytesBigEndian([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).toBytesBigEndian()).toEqual([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(Uint64.fromBytesBigEndian([0xab, 0x22, 0xbc, 0x5f, 0xa9, 0x20, 0x4e, 0x0d]).toBytesBigEndian()).toEqual([0xab, 0x22, 0xbc, 0x5f, 0xa9, 0x20, 0x4e, 0x0d]);
      expect(Uint64.fromBytesBigEndian([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]).toBytesBigEndian()).toEqual([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    });

    it("can export bytes (little endian)", () => {
      expect(Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).toBytesLittleEndian()).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]).toBytesLittleEndian()).toEqual([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
      expect(Uint64.fromBytesBigEndian([0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]).toBytesLittleEndian()).toEqual([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);
      expect(Uint64.fromBytesBigEndian([0xab, 0x22, 0xbc, 0x5f, 0xa9, 0x20, 0x4e, 0x0d]).toBytesLittleEndian()).toEqual([0x0d, 0x4e, 0x20, 0xa9, 0x5f, 0xbc, 0x22, 0xab]);
      expect(Uint64.fromBytesBigEndian([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]).toBytesLittleEndian()).toEqual([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    });

    it("can export strings", () => {
      {
        const a = Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        expect(a.toString()).toEqual("0");
      }
      {
        const a = Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);
        expect(a.toString()).toEqual("1");
      }
      {
        const a = Uint64.fromBytesBigEndian([0x8a, 0xc7, 0x23, 0x04, 0x89, 0xe7, 0xff, 0xff]);
        expect(a.toString()).toEqual("9999999999999999999");
      }
      {
        const a = Uint64.fromBytesBigEndian([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        expect(a.toString()).toEqual("18446744073709551615");
      }
    });

    it("can export numbers", () => {
      {
        const a = Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        expect(a.toNumber()).toEqual(0);
      }
      {
        const a = Uint64.fromBytesBigEndian([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01]);
        expect(a.toNumber()).toEqual(1);
      }
      {
        // value too large for 53 bit integer
        const a = Uint64.fromBytesBigEndian([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
        expect(() => a.toNumber()).toThrowError(/number can only safely store up to 53 bits/i);
      }
      {
        // Number.MAX_SAFE_INTEGER + 1
        const a = Uint64.fromBytesBigEndian([0x00, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
        expect(() => a.toNumber()).toThrowError(/number can only safely store up to 53 bits/i);
      }
    });
  });
});
