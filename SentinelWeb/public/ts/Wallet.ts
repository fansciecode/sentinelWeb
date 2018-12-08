import { Encoding, HdPaths } from '@iov/encoding';
import { Ed25519HdWallet, UserProfile } from '@iov/keycontrol';
import * as mnemonic from "./Mnemonic";
import { db } from "./Store";
const { fromHex, toHex } = Encoding;

export const Profile =  new UserProfile();

export const CreateIdentityInWallet112 = async (profile:any,i: number) => {
   const identity12 = await profile.createIdentity(profile.wallet1.id, HdPaths.simpleAddress(i));
   return identity12;
};

export const CreateIdentityInWalle124 = async (profile:any,i: number) => {
   const identity24 = await profile.createIdentity(profile.wallet1.id, HdPaths.simpleAddress(i));
   return identity24;
};

export const WALLET = async (password: string, Mnemonic: number) => {

   const wallet1 = Ed25519HdWallet.fromMnemonic(mnemonic.Phrase12);
   const wallet2 = Ed25519HdWallet.fromMnemonic(mnemonic.Phrase24);

   Mnemonic === 12 ? Profile.addWallet(wallet1) : Profile.addWallet(wallet2);

   Profile.setWalletLabel(wallet1.id, "12 words");
   Profile.setWalletLabel(wallet2.id, "24 words");
   const identity12 = CreateIdentityInWallet112(Profile,0);
   const identity24 = CreateIdentityInWalle124(Profile,0);
   await Profile.storeIn(db, password);
   return {
      Profile: Profile,
      id1: identity12,
      id2: identity24
   };
};