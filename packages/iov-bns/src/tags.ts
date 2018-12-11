import {
  Address,
  BcpQueryTag,
  BcpSwapQuery,
  isQueryBySwapId,
  isQueryBySwapRecipient,
  isQueryBySwapSender,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { bucketKey, decodeBnsAddress, hashIdentifier, indexKey } from "./util";

export function bnsFromOrToTag(addr: Address): BcpQueryTag {
  const id = Uint8Array.from([...Encoding.toAscii("wllt:"), ...decodeBnsAddress(addr).data]);
  const key = Encoding.toHex(id).toUpperCase();
  const value = "s"; // "s" for "set"
  return { key, value };
}

export function bnsNonceTag(addr: Address): BcpQueryTag {
  const id = Uint8Array.from([...Encoding.toAscii("sigs:"), ...decodeBnsAddress(addr).data]);
  const key = Encoding.toHex(id).toUpperCase();
  const value = "s"; // "s" for "set"
  return { key, value };
}

export function bnsSwapQueryTags(query: BcpSwapQuery, set = true): BcpQueryTag {
  let binKey: Uint8Array;
  const bucket = "esc";
  if (isQueryBySwapId(query)) {
    binKey = Uint8Array.from([...bucketKey(bucket), ...query.swapid]);
  } else if (isQueryBySwapSender(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "sender"), ...decodeBnsAddress(query.sender).data]);
  } else if (isQueryBySwapRecipient(query)) {
    binKey = Uint8Array.from([...indexKey(bucket, "recipient"), ...decodeBnsAddress(query.recipient).data]);
  } else {
    // if (isQueryBySwapHash(query))
    binKey = Uint8Array.from([...indexKey(bucket, "arbiter"), ...hashIdentifier(query.hashlock)]);
  }

  const key = Encoding.toHex(binKey).toUpperCase();
  // "s" for set, "d" for delete.... we need to watch both changes to be clear
  // But if we return two tags here, that would AND not OR
  const value = set ? "s" : "d";
  return { key, value };
}
