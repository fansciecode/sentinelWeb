
import { Encoding } from '@iov/encoding';

import { Ed25519HdWallet,HdPaths , UserProfile } from '@iov/keycontrol';

import { db } from "./Store";

import { Phrase12, Phrase24 } from "./Mnemonic";
const { fromHex, toHex } = Encoding;

// export const CreateProfile = () => {
//    const Profile = new UserProfile();
//    return {
//       Profile:Profile
//    }
// }

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

   const Profile = new UserProfile();
   Profile.addWallet(PhraseTweWallet());
   Profile.addWallet(PhraseTwnWallet());
   // const wallet1 = Ed25519HdWallet.fromMnemonic(Mnemonic.Phrase12);
   // const wallet2 = Ed25519HdWallet.fromMnemonic(Mnemonic.Phrase24);

   // Mnemonic === 12 ? Profile.addWallet(wallet1) : Profile.addWallet(wallet2);

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