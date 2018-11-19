import { Encoding, HdPaths } from '@iov/encoding';
import { Ed25519HdWallet } from '@iov/keycontrol';
import * as mnemonic from "./Mnemonic";
import { Profile } from "./Profile"
import {db} from "./Store";

const { fromHex, toHex } = Encoding;

export const CreateWallet = async (password:string,Mnemonic:number) => {

    const wallet1 = Ed25519HdWallet.fromMnemonic(mnemonic.Phrase12);
    const wallet2 = Ed25519HdWallet.fromMnemonic(mnemonic.Phrase24);

    // disbaled setting wallet label for user 
    Profile.setWalletLabel(wallet1.id, "12 words");
    Profile.setWalletLabel(wallet2.id, "24 words");

    Mnemonic === 12 ? Profile.addWallet(wallet1) : Profile.addWallet(wallet2);
    CreateIdentityInWallet112(0);
    CreateIdentityInWalle124(0);
    await Profile.storeIn(db, password);
    return Profile;
}
 export const CreateIdentityInWallet112 = async (i:number) => {
    const identity12 = await Profile.createIdentity(Profile.wallet1.id, HdPaths.simpleAddress(i)); 
 return identity12;
 }

 export const CreateIdentityInWalle124 = async (i:number) => {
    const identity24 = await Profile.createIdentity(Profile.wallet1.id, HdPaths.simpleAddress(i)); 
    return identity24;
 }