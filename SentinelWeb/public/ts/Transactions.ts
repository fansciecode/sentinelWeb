
import {
  Address,
  Amount,
  DeleteMasterNode,
  DeleteVpnUser,
  // FungibleToken,
  GetVpnPayment,
  PayVpnService,
  RegisterMasterNode,
  RegisterVpn,
  SendTx,
  SentinelMsgType,
  SentSession,
  // SessionID,
  TokenTicker,
  TransactionKind,

} from "@iov/bcp-types";
import {address}from "./Codec";
// import{Profile} from "./Wallet";

import { chainId, signer } from "./Network";




export const DeleteMasternode = (data:DeleteMasterNode ):DeleteMasterNode => {
  return {
    address: data.address,
    name: data.name,
    password: data.password,
    gas: data.gas
  };
};
export const DeleteVpnuser  = (data: DeleteVpnUser):DeleteVpnUser=> {
  return {
    address: data.address,
    name: data.name,
    password: data.password,
    gas: data.gas
  };
};
export const SessionObj  = (data: SentSession):SentSession => {
  return {
    LockedCoins: data.LockedCoins,
    ReleasedCoins: data.ReleasedCoins,
    Counter: data.Counter,
    Timestamp: new Date().toDateString(),
    VpnPubKey: data.VpnPubKey,
    CPubKey: data.CPubKey,
    CAddress: data.CAddress,
    status: data.status
  };
};
export const Sessionid  = (data: SentSession) => {
  const counter = SessionObj(data).Counter .toString();
  const pubkey = SessionObj(data).CAddress.toString();
  return {
    SessionID: counter+pubkey 
  }
};
export const GetVpnpayment  = (data: GetVpnPayment) :GetVpnPayment=> {
  return {
    coins: data.coins,
    SessionId: data.SessionId,
    Counter: data.Counter,
    Localaccount: data.Localaccount,
    Gas: data.Gas,
    IsFinal: data.IsFinal,
    Password: data.Password,
    Signature: data.Signature
  };
};
export const PayVpnservice = (data: PayVpnService):PayVpnService => {
  return {
    coins: data.coins,
    Vpnaddr: data.Vpnaddr,
    Localaccount: data.Localaccount,
    password:data.password,
    gas: data.gas,
    SigName: data.SigName,
    SigPassword: data.SigPassword
  };
};
export const RegistermasterNode = (data: RegisterMasterNode):RegisterMasterNode => {
  return {
    name: data.name,
    gas: data.gas,
    password: data.password
  };
};

export const Registervpn  = (data:RegisterVpn ):RegisterVpn => {
  return {
    Ip: data.Ip,
    UploadSpeed: data.UploadSpeed,
    PricePerGb: data.PricePerGb,
    EncryptionMethod: data.EncryptionMethod,
    Latitude: data.Latitude,
    Longitude: data.Longitude,
    City: data.City,
    Country: data.Country,
    NodeType: data.NodeType,
    Version: data.Version,
    Localaccount: data.Localaccount,
    Password: data.Password,
    Gas: data.Gas
  };
};
export const BuildTransaction = (TrType: SentinelMsgType, params:any):any => {
// switch(TrType) {
//   case TrType.DeleteMasterNode :

// }
  if( TrType === SentinelMsgType.DeleteMasterNode ) {
     DeleteMasternode(params);
  }else if (TrType === SentinelMsgType.DeleteVpnUser ) {
     GetVpnpayment(params);
  }else if (TrType === SentinelMsgType.GetVpnPayment ) {
     GetVpnpayment(params);
  }else if (TrType === SentinelMsgType.PayVpnService ) {
     GetVpnpayment(params);
  }else if (TrType === SentinelMsgType.RegisterMasterNode ) {
   GetVpnpayment(params);
  }else if (TrType === SentinelMsgType.RegisterVpn ) {
    GetVpnpayment(params);
   }
};


export const SendTransaction = async  (Recipient: Address, memo: string, Token: Amount,msgtype:SentinelMsgType, msg?: any) => {
  const sendTx: SendTx = {
    kind: TransactionKind.Send,
    chainId: chainId,
    signer: signer,
    recipient: Recipient,
    memo: memo,
    msgType: BuildTransaction(msgtype,msg) || null,
    amount: {
      quantity: Token.quantity,
      fractionalDigits: Token.fractionalDigits,
      tokenTicker: Token.tokenTicker as TokenTicker,
    } || null

  };
  console.log(await signer().Signer.getNonce(chainId, address));
  await signer().Signer.signAndCommit(sendTx, Profile.wallet1.id);
  console.log(await signer().Signer.getNonce(chainId, address));

};