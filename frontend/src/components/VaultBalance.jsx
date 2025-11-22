import React, { useState } from 'react';

export default function VaultBalance({ backend }) {
  const [balance, setBalance] = useState(null);
  const [utxos, setUtxos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formatBTC = (satoshis) => {
    return (Number(satoshis) / 100000000).toFixed(8);
  };

  const bytesToHex = (bytes) => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const loadVaultData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bal, utxoData] = await Promise.all([
        backend.get_my_vault_balance(),
        backend.get_my_vault_utxos(),
      ]);
      setBalance(Number(bal));
      setUtxos(utxoData);
    } catch (err) {
      setError(err.message || 'Failed to load vault data');
      console.error('Error loading vault data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Vault Balance</h2>
      <p className="text-sm text-gray-600 mb-4">
        View your deposited Bitcoin balance and transaction history
      </p>

      <button
        onClick={loadVaultData}
        disabled={loading}
        className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold mb-4"
      >
        {loading ? 'Loading...' : 'Refresh Balance'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {balance !== null && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Balance</p>
            <p className="text-4xl font-bold text-green-700">{formatBTC(balance)} BTC</p>
            <p className="text-sm text-gray-500 mt-2">{balance.toLocaleString()} satoshis</p>
          </div>

          {utxos && utxos.utxos && utxos.utxos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Deposits ({utxos.utxos.length})
              </h3>
              {utxos.utxos.map((utxo, index) => (
                <div key={index} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-semibold text-green-600">
                        {formatBTC(utxo.value)} BTC
                      </p>
                      <p className="text-xs text-gray-400">{Number(utxo.value).toLocaleString()} sats</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Block Height</p>
                      <p className="font-semibold text-gray-700">{utxo.height.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Transaction ID</p>
                      <p className="text-xs font-mono break-all text-gray-600">
                        {bytesToHex(utxo.outpoint.txid)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Output: {utxo.outpoint.vout}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {utxos && utxos.utxos && utxos.utxos.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-6 text-center">
              <p className="text-blue-800">
                No deposits found. Send Bitcoin to your deposit address to get started.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
