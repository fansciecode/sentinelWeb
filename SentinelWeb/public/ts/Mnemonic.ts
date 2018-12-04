import { Bip39, Random } from '@iov/crypto';



export const Phrase12 = async () => {
    const entropy16 = await Random.getBytes(16);
    const mnemonic12 = Bip39.encode(entropy16).asString();
    console.log(mnemonic12);
    return mnemonic12;
};

export const Phrase24 = async () => {
    const entropy32 = await Random.getBytes(32);
    const mnemonic24 = Bip39.encode(entropy32).asString();
    console.log(mnemonic24);
    return mnemonic24;
};