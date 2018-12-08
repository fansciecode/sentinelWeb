import { bnsCodec } from '@iov/bns';
import {Profile}from "./Wallet"

// import * as wallet from  "./Wallet"

export const address = bnsCodec.keyToAddress(Profile.wallet.id1.pubkey);