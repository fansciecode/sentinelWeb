
import {
  Address,
  DeleteMasterNode,
  DeleteVpnUser,
  FungibleToken,
  GetVpnPayment,
  PayVpnService,
  RegisterMasterNode,
  RegisterVpn,
  SendTx,
  SentinelMsgType,
  SentSession,
  SessionID,
  TokenTicker,
  TransactionKind
} from "@iov/bcp-types";

import { chainId, signer } from "./Network";


export const DeleteMasternode: DeleteMasterNode = (...data: any) => {
  return {
    address: data.Address,
    name: data.name,
    password: data.password,
    gas: data.gasfee
  };
};
export const DeleteVpnuser: DeleteVpnUser = (...data: any) => {
  return {
    address: data.Address,
    name: data.name,
    password: data.password,
    gas: data.gasfee
  };
};
export const SessionObj: SentSession = (...data: any) => {
  return {
    LockedCoins: data.lockcoins,
    ReleasedCoins: data.releasedcoins,
    Counter: data.counter,
    Timestamp: new Date(),
    VpnPubKey: data.vpnPubkey,
    CPubKey: data.clientPubkey,
    CAddress: data.ClientAddress,
    status: data.status
  };
};
export const Sessionid: SessionID = (...data: any) => {

  return {
    sessionid: SessionObj(data).Counter + SessionObj(data).CAddress,
  };
};
export const GetVpnpayment: GetVpnPayment = (...data: any) => {
  return {
    coins: data.coins,
    SessionId: data.Sessionid,
    Counter: data.counter,
    Localaccount: data.accountname,
    Gas: data.gasFee,
    IsFinal: data.final,
    Password: data.password,
    Signature: data.signatures
  };
};
export const PayVpnservice: PayVpnService = (...data: any) => {
  return {
    coins: data.coins,
    Vpnaddr: data.vpnaddress,
    Localaccount: data.accountname,
    gas: data.gasFee,
    SigName: data.signame,
    SigPassword: data.sigpassword
  };
};
export const RegistermasterNode: RegisterMasterNode = (...data: any) => {
  return {
    name: data.name,
    gas: data.gasfee,
    password: data.password
  };
};

export const Registervpn: RegisterVpn = (...data: any) => {
  return {
    Ip: data.ip,
    UploadSpeed: data.uploadspeed,
    PricePerGb: data.pricepergb,
    EncryptionMethod: data.encryptionmethod,
    Latitude: data.longitude,
    Longitude: data.latitude,
    City: data.city,
    Country: data.country,
    NodeType: data.nodetype,
    Version: data.version,
    Localaccount: data.accountname,
    Password: data.password,
    Gas: data.gasfee
  };
};
export const BuildTransaction: SentinelMsgType = (TrType: SentinelMsgType, ...params: any) => {

  switch (TrType) {
    case TrType.DeleteMasterNode:
      return DeleteMasternode(...params);
    case TrType.DeleteVpnUser:
      return DeleteVpnuser(...params);
    case TrType.GetVpnPayment:
      return GetVpnpayment(...params);
    case TrType.PayVpnService:
      return PayVpnservice(...params);
    case TrType.RegisterMasterNode:
      return RegistermasterNode(...params);
    case TrType.RegisterVpn:
      return Registervpn(...params);

  };

};


export const SendTransaction = (Recipient: Address, memo: string, Amount?: FungibleToken, msg?: SentinelMsgType,msgtype?:SentinelMsgType) => {
  const sendTx: SendTx = {
    kind: TransactionKind.Send,
    chainId: chainId,
    signer: signer,
    recipient: Recipient,
    memo: memo,
    msgType: BuildTransaction(msgtype,msg) || null,
    amount: {
      whole: Amount.whole,
      fractional: Amount.fraction,
      tokenTicker: Amount.ticker as TokenTicker,
    } || null
  };
};