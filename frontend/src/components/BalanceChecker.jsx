import React, { useState } from 'react';

export default function BalanceChecker({ backend }) {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBalance = async (e) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please enter a Bitcoin address');
      return;
    }

    setLoading(true);
    setError('');
    setBalance(null);
    try {
      const balanceSatoshis = await backend.get_balance(address);
      setBalance(Number(balanceSatoshis));
    } catch (err) {
      setError(err.message || 'Failed to check balance');
      console.error('Error checking balance:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBTC = (satoshis) => {
    return (satoshis / 100000000).toFixed(8);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Check Balance</h2>

      <form onSubmit={checkBalance} className="space-y-4">
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
          {loading ? 'Checking...' : 'Check Balance'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {balance !== null && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Balance</p>
            <p className="text-3xl font-bold text-green-700">{formatBTC(balance)} BTC</p>
            <p className="text-sm text-gray-500 mt-1">{balance.toLocaleString()} satoshis</p>
          </div>
        </div>
      )}
    </div>
  );
}
