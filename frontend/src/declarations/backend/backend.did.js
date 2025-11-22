export const idlFactory = ({ IDL }) => {
  const network = IDL.Variant({
    'regtest' : IDL.Null,
    'testnet' : IDL.Null,
    'mainnet' : IDL.Null,
  });
  const satoshi = IDL.Nat64;
  const bitcoin_address = IDL.Text;
  const transaction_id = IDL.Text;
  const outpoint = IDL.Record({ 'txid' : IDL.Vec(IDL.Nat8), 'vout' : IDL.Nat32 });
  const utxo = IDL.Record({
    'height' : IDL.Nat32,
    'value' : satoshi,
    'outpoint' : outpoint,
  });
  const block_hash = IDL.Vec(IDL.Nat8);
  const get_utxos_response = IDL.Record({
    'next_page' : IDL.Opt(IDL.Vec(IDL.Nat8)),
    'tip_height' : IDL.Nat32,
    'tip_block_hash' : block_hash,
    'utxos' : IDL.Vec(utxo),
  });
  const millisatoshi_per_vbyte = IDL.Nat64;
  const get_block_headers_response = IDL.Record({
    'tip_height' : IDL.Nat32,
    'block_headers' : IDL.Vec(IDL.Vec(IDL.Nat8)),
  });

  return IDL.Service({
    // Vault functions
    'get_my_deposit_address' : IDL.Func([], [bitcoin_address], []),
    'get_my_vault_balance' : IDL.Func([], [satoshi], []),
    'get_my_vault_utxos' : IDL.Func([], [get_utxos_response], []),
    'withdraw' : IDL.Func([bitcoin_address, satoshi], [transaction_id], []),

    // Public query functions
    'get_balance' : IDL.Func([bitcoin_address], [satoshi], []),
    'get_utxos' : IDL.Func([bitcoin_address], [get_utxos_response], []),
    'get_current_fee_percentiles' : IDL.Func([], [IDL.Vec(millisatoshi_per_vbyte)], []),
    'get_block_headers' : IDL.Func([IDL.Nat32, IDL.Opt(IDL.Nat32)], [get_block_headers_response], []),
  });
};

export const init = ({ IDL }) => {
  const network = IDL.Variant({
    'regtest' : IDL.Null,
    'testnet' : IDL.Null,
    'mainnet' : IDL.Null,
  });
  return [network];
};
