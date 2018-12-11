import { bnsConnector, IovWriter } from '@iov/core';
import { Walletprofile } from "./Wallet";


export const signer = () => {
    const Signer = new IovWriter(Walletprofile);
    AddChain(Signer);
    return {
        Signer :Signer,
        ChainiD :Signer.chainIds()[0]
    };
};
export const AddChain = async (data: any) => {
    await data.addChain(bnsConnector('http://tm-testnet.sentinelgroup.io:26657/'));
};
export const chainId = signer().ChainiD;
