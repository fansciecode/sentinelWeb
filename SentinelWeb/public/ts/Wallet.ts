
import { Encoding } from '@iov/encoding';

import { Ed25519HdWallet, HdPaths, UserProfile } from '@iov/keycontrol';
import { Profile } from "./Login";
import { db } from "./Store";

import { Phrase12, Phrase24 } from "./Mnemonic";

const { fromHex, toHex } = Encoding;

export const CreateIdentityInWallet112 = async (profile: any, i: number) => {
   const identity12 = await profile.createIdentity(profile.wallet1.id, HdPaths.simpleAddress(i));
   return identity12;
};

export const CreateIdentityInWalle124 = async (profile: any, i: number) => {
   const identity24 = await profile.createIdentity(profile.wallet1.id, HdPaths.simpleAddress(i));
   return identity24;
};
export const PhraseTweWallet = async () => {
   const Phrase = await Phrase12();
   const wallet1 = Ed25519HdWallet.fromMnemonic(Phrase);
   return wallet1;
}
export const PhraseTwnWallet = async () => {
   const Phrase = await Phrase24();
   const wallet2 = Ed25519HdWallet.fromMnemonic(Phrase);
   return wallet2;
}
export const CreateWallet = async (password: string) => {

   const Cprofile = new UserProfile();
   Cprofile.addWallet(await PhraseTweWallet());
   Cprofile.addWallet(await PhraseTwnWallet());
   // const wallet1 = Ed25519HdWallet.fromMnemonic(Mnemonic.Phrase12);
   // const wallet2 = Ed25519HdWallet.fromMnemonic(Mnemonic.Phrase24);
   const wallet = await PhraseTweWallet() || await PhraseTwnWallet();
   // Mnemonic === 12 ? Profile.addWallet(wallet1) : Profile.addWallet(wallet2);

   Cprofile.setWalletLabel(wallet.id, "12 words");
   Cprofile.setWalletLabel(wallet.id, "24 words");
   const identity12 = CreateIdentityInWallet112(Cprofile, 0);
   const identity24 = CreateIdentityInWalle124(Cprofile, 0);
   await Cprofile.storeIn(db, password);
   return {
      Profile: Cprofile,
      id1: identity12,
      id2: identity24
   };
};
export const Walletprofile =  (password?: string) => {
   if (password) {
      return {
        Profile: CreateWallet(password)
      };
   } else {
      return {
         Profile:Profile
   }
}
}