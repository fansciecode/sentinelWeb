export const enum PublicActionType {
  REQUEST_API_ACCESS = "REQUEST_API_ACCESS",
  GET_CURRENT_ACCOUNT = "GET_CURRENT_ACCOUNT",
  CHANGE_EVENT = "CHANGE_EVENT",
  REQUEST_SIGN_TX = "REQUEST_SIGN_TX",
  REQUEST_SIGN_MESSAGE = "REQUEST_SIGN_MESSAGE"
}

export interface RequestAPIAccess {
  readonly type: PublicActionType.REQUEST_API_ACCESS;
}

export interface GetCurrentAccount {
  readonly type: PublicActionType.GET_CURRENT_ACCOUNT;
}

export interface ChangeEvent {
  readonly type: PublicActionType.CHANGE_EVENT;
}

export interface RequestSignTx {
  readonly type: PublicActionType.REQUEST_SIGN_TX;
}

export interface RequestSignMessage {
  readonly type: PublicActionType.REQUEST_SIGN_MESSAGE;
}

export type PublicAction =
  | RequestAPIAccess
  | GetCurrentAccount
  | ChangeEvent
  | RequestSignTx
  | RequestSignMessage;

export const enum PrivateActionType {
  LIST_USERS = "LIST_USERS",
  SUBMIT_PASSWORD = "SUBMIT_PASSWORD",
  CREATE_USER = "CREATE_USER",
  RESTORE_USER = "RESTORE_USER",
  IMPORT_PRIVATE_KEY = "IMPORT_PRIVATE_KEY",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  EXPORT_USER = "EXPORT_USER",
  SIGN_MESSAGE = "SIGN_MESSAGE",
  SIGN_TRANSACTION = "SIGN_TRANSACTION",
  DECRYPT_MESSAGE = "DECRYPT_MESSAGE",
  SET_ACTIVE_KEY = "SET_ACTIVE_KEY",
  GRANT_STORE_ACCESS = "GRANT_STORE_ACCESS"
}

export interface ListUsers {
  readonly type: PrivateActionType.LIST_USERS;
}

export interface SubmitPassword {
  readonly type: PrivateActionType.SUBMIT_PASSWORD;
}

export interface CreateUser {
  readonly type: PrivateActionType.CREATE_USER;
}

export interface RestoreUser {
  readonly type: PrivateActionType.RESTORE_USER;
}

export interface ImportPrivateKey {
  readonly type: PrivateActionType.IMPORT_PRIVATE_KEY;
}

export interface AddAccount {
  readonly type: PrivateActionType.ADD_ACCOUNT;
}

export interface ExportUser {
  readonly type: PrivateActionType.EXPORT_USER;
}

export interface SignMessage {
  readonly type: PrivateActionType.SIGN_MESSAGE;
}

export interface SignTransaction {
  readonly type: PrivateActionType.SIGN_TRANSACTION;
}

export interface DecryptMessage {
  readonly type: PrivateActionType.DECRYPT_MESSAGE;
}

export interface SetActiveKey {
  readonly type: PrivateActionType.SET_ACTIVE_KEY;
}

export interface GrantStoreAccess {
  readonly type: PrivateActionType.GRANT_STORE_ACCESS;
}

export type PrivateAction =
  | ListUsers
  | SubmitPassword
  | CreateUser
  | RestoreUser
  | ImportPrivateKey
  | AddAccount
  | ExportUser
  | SignMessage
  | SignTransaction
  | DecryptMessage
  | SetActiveKey
  | GrantStoreAccess;
