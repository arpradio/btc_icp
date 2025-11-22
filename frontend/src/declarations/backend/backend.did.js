export const idlFactory = ({ IDL }) => {
  const network = IDL.Variant({
    'regtest' : IDL.Null,
    'testnet' : IDL.Null,
    'mainnet' : IDL.Null,
  });
  const satoshi = IDL.Nat64;
  const bitcoin_address = IDL.Text;
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
  const transaction_id = IDL.Text;
  return IDL.Service({
    'get_balance' : IDL.Func([bitcoin_address], [satoshi], []),
    'get_current_fee_percentiles' : IDL.Func(
        [],
        [IDL.Vec(millisatoshi_per_vbyte)],
        [],
      ),
    'get_p2pkh_address' : IDL.Func([], [bitcoin_address], []),
    'get_p2tr_address' : IDL.Func([], [bitcoin_address], []),
    'get_p2tr_key_only_address' : IDL.Func([], [bitcoin_address], []),
    'get_utxos' : IDL.Func([bitcoin_address], [get_utxos_response], []),
    'send_from_p2pkh_address' : IDL.Func(
        [
          IDL.Record({
            'destination_address' : bitcoin_address,
            'amount_in_satoshi' : satoshi,
          }),
        ],
        [transaction_id],
        [],
      ),
    'send_from_p2tr_address_key_path' : IDL.Func(
        [
          IDL.Record({
            'destination_address' : bitcoin_address,
            'amount_in_satoshi' : satoshi,
          }),
        ],
        [transaction_id],
        [],
      ),
    'send_from_p2tr_address_script_path' : IDL.Func(
        [
          IDL.Record({
            'destination_address' : bitcoin_address,
            'amount_in_satoshi' : satoshi,
          }),
        ],
        [transaction_id],
        [],
      ),
    'send_from_p2tr_key_only_address' : IDL.Func(
        [
          IDL.Record({
            'destination_address' : bitcoin_address,
            'amount_in_satoshi' : satoshi,
          }),
        ],
        [transaction_id],
        [],
      ),
  });
};
