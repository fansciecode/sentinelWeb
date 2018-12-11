interface Integer {
    readonly toNumber: () => number;
    readonly toString: () => string;
}
export declare class Uint32 implements Integer {
    static fromBigEndianBytes(bytes: ArrayLike<number>): Uint32;
    protected readonly data: number;
    constructor(input: number);
    toBytesBigEndian(): ReadonlyArray<number>;
    toNumber(): number;
    toString(): string;
    /** @deprecated use toNumber() */
    asNumber(): number;
}
export declare class Int53 implements Integer {
    static fromString(str: string): Int53;
    protected readonly data: number;
    constructor(input: number);
    toNumber(): number;
    toString(): string;
}
export declare class Uint53 implements Integer {
    static fromString(str: string): Uint53;
    protected readonly data: Int53;
    constructor(input: number);
    toNumber(): number;
    toString(): string;
}
export declare class Uint64 implements Integer {
    static fromBytesBigEndian(bytes: ArrayLike<number>): Uint64;
    static fromString(str: string): Uint64;
    static fromNumber(input: number): Uint64;
    private readonly data;
    private constructor();
    toBytesBigEndian(): ReadonlyArray<number>;
    toBytesLittleEndian(): ReadonlyArray<number>;
    toString(): string;
    toNumber(): number;
}
export {};
