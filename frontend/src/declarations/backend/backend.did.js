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
  const get_block_headers_response = IDL.Record({
    'tip_height' : IDL.Nat32,
    'block_headers' : IDL.Vec(IDL.Vec(IDL.Nat8)),
  });
  const schnorr_aux = IDL.Variant({
    'bip341' : IDL.Record({ 'merkle_root_hash' : IDL.Vec(IDL.Nat8) }),
  });

  return IDL.Service({
    'get_balance' : IDL.Func([bitcoin_address], [satoshi], []),
    'get_utxos' : IDL.Func([bitcoin_address], [get_utxos_response], []),
    'get_current_fee_percentiles' : IDL.Func(
        [],
        [IDL.Vec(millisatoshi_per_vbyte)],
        [],
      ),
    'get_block_headers' : IDL.Func(
        [IDL.Nat32, IDL.Opt(IDL.Nat32)],
        [get_block_headers_response],
        [],
      ),
    'sign_with_ecdsa' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Vec(IDL.Nat8))],
        [IDL.Vec(IDL.Nat8)],
        [],
      ),
    'get_ecdsa_public_key' : IDL.Func(
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        [IDL.Vec(IDL.Nat8)],
        [],
      ),
    'sign_with_schnorr' : IDL.Func(
        [IDL.Vec(IDL.Nat8), IDL.Vec(IDL.Vec(IDL.Nat8)), IDL.Opt(schnorr_aux)],
        [IDL.Vec(IDL.Nat8)],
        [],
      ),
    'get_schnorr_public_key' : IDL.Func(
        [IDL.Vec(IDL.Vec(IDL.Nat8))],
        [IDL.Vec(IDL.Nat8)],
        [],
      ),
  });
};
