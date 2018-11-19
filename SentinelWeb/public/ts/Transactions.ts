import { PayVpnService, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types"

// sentinel transactions  


const sendTx: SendTx = {
    kind: TransactionKind.Send,
    chainId: chainId,
    signer: id1a.pubkey,  // this account must have money
    recipient: addr2,
    memo: "My first transaction",
    msgType:PayVpnService,
    amount: { // 10.11 IOV (9 sig figs in tx codec)
      whole: 10,
      fractional: 110000000,
      tokenTicker: "IOV" as TokenTicker,
      
    },
  };