import { bnsConnector, MultiChainSigner } from '@iov/core';
import * as Profile from "./Profile"
export const signer = new MultiChainSigner(Profile.profile);
export const AddChain = async ()  => { 
    await signer.addChain(bnsConnector('http://tm-testnet.sentinelgroup.io:26657/')); 
};

export const chainId = signer.chainIds()[0];
