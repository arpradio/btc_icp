import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat64 "mo:base/Nat64";
import Error "mo:base/Error";

import BitcoinApi "BitcoinApi";
import EcdsaApi "EcdsaApi";
import SchnorrApi "SchnorrApi";
import P2pkh "P2pkh";
import P2trKeyOnly "P2trKeyOnly";
import P2tr "P2tr";
import Types "Types";
import Utils "Utils";

persistent actor class BasicBitcoin(network : Types.Network) {
  type GetUtxosResponse = Types.GetUtxosResponse;
  type MillisatoshiPerVByte = Types.MillisatoshiPerVByte;
  type SendRequest = Types.SendRequest;
  type Network = Types.Network;
  type BitcoinAddress = Types.BitcoinAddress;
  type Satoshi = Types.Satoshi;
  type TransactionId = Text;
  type EcdsaCanisterActor = Types.EcdsaCanisterActor;
  type SchnorrCanisterActor = Types.SchnorrCanisterActor;
  type P2trDerivationPaths = Types.P2trDerivationPaths;

  /// The Bitcoin network to connect to.
  ///
  /// When developing locally this should be `regtest`.
  /// When deploying to the IC this should be `testnet`.
  /// `mainnet` is currently unsupported.
  let NETWORK : Network = network;

  /// The derivation path to use for ECDSA secp256k1 or Schnorr BIP340/BIP341 key
  /// derivation.
  transient let DERIVATION_PATH : [[Nat8]] = [];

  // The ECDSA key name.
  transient let KEY_NAME : Text = switch NETWORK {
    // For local development, we use a special test key with dfx.
    case (#regtest) "dfx_test_key";
    // On the IC we're using a test ECDSA key.
    case _ "test_key_1";
  };

  // Threshold signing APIs instantiated with the management canister ID. Can be
  // replaced for cheaper testing.
  transient var ecdsa_canister_actor : EcdsaCanisterActor = actor ("aaaaa-aa");
  transient var schnorr_canister_actor : SchnorrCanisterActor = actor ("aaaaa-aa");

  // Vault: Map user principals to their deposit addresses
  var userAddressesEntries : [(Principal, BitcoinAddress)] = [];
  transient var userAddresses = HashMap.HashMap<Principal, BitcoinAddress>(0, Principal.equal, Principal.hash);

  system func preupgrade() {
    userAddressesEntries := Iter.toArray(userAddresses.entries());
  };

  system func postupgrade() {
    for ((principal, address) in userAddressesEntries.vals()) {
      userAddresses.put(principal, address);
    };
    userAddressesEntries := [];
  };

  /// Get or create a unique deposit address for the caller.
  /// Each user gets a deterministic P2PKH address based on their principal.
  public shared(msg) func get_my_deposit_address() : async BitcoinAddress {
    let caller = msg.caller;

    switch (userAddresses.get(caller)) {
      case (?address) { address };
      case null {
        // Create derivation path from principal
        let principalBytes = Blob.toArray(Principal.toBlob(caller));
        let derivationPath = Array.flatten([DERIVATION_PATH, [principalBytes]]);

        // Generate P2PKH address for this user
        let address = await P2pkh.get_address(ecdsa_canister_actor, NETWORK, KEY_NAME, derivationPath);
        userAddresses.put(caller, address);
        address;
      };
    };
  };

  /// Get the caller's vault balance (funds deposited to their address).
  public shared(msg) func get_my_vault_balance() : async Satoshi {
    let caller = msg.caller;

    switch (userAddresses.get(caller)) {
      case (?address) {
        await BitcoinApi.get_balance(NETWORK, address);
      };
      case null { 0 };
    };
  };

  /// Get the caller's vault UTXOs.
  public shared(msg) func get_my_vault_utxos() : async GetUtxosResponse {
    let caller = msg.caller;

    switch (userAddresses.get(caller)) {
      case (?address) {
        await BitcoinApi.get_utxos(NETWORK, address);
      };
      case null {
        {
          utxos = [];
          tip_block_hash = [];
          tip_height = 0;
          next_page = null;
        };
      };
    };
  };

  /// Withdraw funds from the caller's vault to a destination address.
  /// Only the depositor can withdraw their own funds.
  public shared(msg) func withdraw(destination_address : BitcoinAddress, amount_in_satoshi : Satoshi) : async TransactionId {
    let caller = msg.caller;

    switch (userAddresses.get(caller)) {
      case (?sourceAddress) {
        // Create derivation path from principal
        let principalBytes = Blob.toArray(Principal.toBlob(caller));
        let derivationPath = Array.flatten([DERIVATION_PATH, [principalBytes]]);

        // Send from user's deposit address
        Utils.bytesToText(await P2pkh.send(
          ecdsa_canister_actor,
          NETWORK,
          derivationPath,
          KEY_NAME,
          destination_address,
          amount_in_satoshi
        ));
      };
      case null {
        throw Error.reject("No deposit address found. Please deposit first.");
      };
    };
  };

  /// Returns the balance of the given Bitcoin address.
  public func get_balance(address : BitcoinAddress) : async Satoshi {
    await BitcoinApi.get_balance(NETWORK, address);
  };

  /// Returns the UTXOs of the given Bitcoin address.
  public func get_utxos(address : BitcoinAddress) : async GetUtxosResponse {
    await BitcoinApi.get_utxos(NETWORK, address);
  };

  /// Returns the 100 fee percentiles measured in millisatoshi/vbyte.
  /// Percentiles are computed from the last 10,000 transactions (if available).
  public func get_current_fee_percentiles() : async [MillisatoshiPerVByte] {
    await BitcoinApi.get_current_fee_percentiles(NETWORK);
  };

  /// Sign a message hash with ECDSA secp256k1.
  /// Returns the signature as a Blob.
  public func sign_with_ecdsa(message_hash : Blob, derivation_path : [Blob]) : async Blob {
    await EcdsaApi.sign_with_ecdsa(ecdsa_canister_actor, KEY_NAME, derivation_path, message_hash);
  };

  /// Get ECDSA public key for a derivation path.
  /// Returns the public key as a Blob.
  public func get_ecdsa_public_key(derivation_path : [Blob]) : async Blob {
    await EcdsaApi.ecdsa_public_key(ecdsa_canister_actor, KEY_NAME, derivation_path);
  };

  /// Sign a message with Schnorr BIP340/BIP341.
  /// Returns the signature as a Blob.
  public func sign_with_schnorr(message : Blob, derivation_path : [Blob], aux : ?Types.SchnorrAux) : async Blob {
    await SchnorrApi.sign_with_schnorr(schnorr_canister_actor, KEY_NAME, derivation_path, message, aux);
  };

  /// Get Schnorr public key for a derivation path.
  /// Returns the public key as a Blob.
  public func get_schnorr_public_key(derivation_path : [Blob]) : async Blob {
    await SchnorrApi.schnorr_public_key(schnorr_canister_actor, KEY_NAME, derivation_path);
  };

  /// Get Bitcoin block headers for a range of blocks.
  /// Returns the tip height and an array of block headers.
  public type GetBlockHeadersResponse = {
    tip_height : Nat32;
    block_headers : [Blob];
  };

  public func get_block_headers(start_height : Nat32, end_height : ?Nat32) : async GetBlockHeadersResponse {
    await BitcoinApi.get_block_headers(NETWORK, start_height, end_height);
  };

  func p2pkhDerivationPath() : [[Nat8]] {
    derivationPathWithSuffix("p2pkh");
  };

  func p2trKeyOnlyDerivationPath() : [[Nat8]] {
    derivationPathWithSuffix("p2tr_key_only");
  };

  func p2trDerivationPaths() : P2trDerivationPaths {
    {
      key_path_derivation_path = derivationPathWithSuffix("p2tr_internal_key");
      script_path_derivation_path = derivationPathWithSuffix("p2tr_script_key");
    };
  };

  func derivationPathWithSuffix(suffix : Blob) : [[Nat8]] {
    Array.flatten([DERIVATION_PATH, [Blob.toArray(suffix)]]);
  };
};
