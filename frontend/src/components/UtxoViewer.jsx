import React, { useState } from 'react';

export default function UtxoViewer({ backend }) {
  const [address, setAddress] = useState('');
  const [utxos, setUtxos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadUtxos = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a Bitcoin address');
      return;
    }

    setLoading(true);
    setError('');
    setUtxos(null);
    try {
      const response = await backend.get_utxos(address);
      setUtxos(response);
    } catch (err) {
      setError(err.message || 'Failed to load UTXOs');
      console.error('Error loading UTXOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBTC = (satoshis) => {
    return (Number(satoshis) / 100000000).toFixed(8);
  };

  const bytesToHex = (bytes) => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">UTXO Explorer</h2>

      <form onSubmit={loadUtxos} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Bitcoin Address
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Bitcoin address"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Loading...' : 'Load UTXOs'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {utxos && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tip Height:</span> {utxos.tip_height.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Tip Block Hash:</span>{' '}
              <span className="font-mono text-xs">{bytesToHex(utxos.tip_block_hash).slice(0, 16)}...</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Total UTXOs:</span> {utxos.utxos.length}
            </p>
          </div>

          {utxos.utxos.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No UTXOs found for this address</p>
          ) : (
            <div className="space-y-3">
              {utxos.utxos.map((utxo, index) => (
                <div key={index} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Value</p>
                      <p className="font-semibold text-green-600">
                        {formatBTC(utxo.value)} BTC
                      </p>
                      <p className="text-xs text-gray-400">{Number(utxo.value).toLocaleString()} sats</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Height</p>
                      <p className="font-semibold">{utxo.height.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">TXID</p>
                      <p className="font-mono text-xs break-all text-gray-700">
                        {bytesToHex(utxo.outpoint.txid)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Vout</p>
                      <p className="font-semibold">{utxo.outpoint.vout}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
