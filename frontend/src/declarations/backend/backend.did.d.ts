import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export type bitcoin_address = string;
export type block_hash = Uint8Array | number[];
export interface get_block_headers_response {
  'tip_height' : number,
  'block_headers' : Array<Uint8Array | number[]>,
}
export interface get_utxos_response {
  'next_page' : [] | [Uint8Array | number[]],
  'tip_height' : number,
  'tip_block_hash' : block_hash,
  'utxos' : Array<utxo>,
}
export type millisatoshi_per_vbyte = bigint;
export type network = { 'regtest' : null } |
  { 'testnet' : null } |
  { 'mainnet' : null };
export interface outpoint { 'txid' : Uint8Array | number[], 'vout' : number }
export type satoshi = bigint;
export type transaction_id = string;
export interface utxo {
  'height' : number,
  'value' : satoshi,
  'outpoint' : outpoint,
}
export interface _SERVICE {
  'get_balance' : ActorMethod<[bitcoin_address], satoshi>,
  'get_block_headers' : ActorMethod<
    [number, [] | [number]],
    get_block_headers_response
  >,
  'get_current_fee_percentiles' : ActorMethod<[], Array<millisatoshi_per_vbyte>>,
  'get_my_deposit_address' : ActorMethod<[], bitcoin_address>,
  'get_my_vault_balance' : ActorMethod<[], satoshi>,
  'get_my_vault_utxos' : ActorMethod<[], get_utxos_response>,
  'get_utxos' : ActorMethod<[bitcoin_address], get_utxos_response>,
  'withdraw' : ActorMethod<[bitcoin_address, satoshi], transaction_id>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
