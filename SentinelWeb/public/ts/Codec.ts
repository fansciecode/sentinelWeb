import { bnsCodec } from '@iov/bns';
import {Walletprofile } from "./Wallet"

// import * as wallet from  "./Wallet"

export const address = bnsCodec.keyToAddress(Walletprofile().Profile);