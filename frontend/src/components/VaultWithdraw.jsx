import React, { useState } from 'react';

export default function VaultWithdraw({ backend }) {
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');
    setTxId('');

    if (!destinationAddress.trim()) {
      setError('Please enter a destination address');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    try {
      const amountInSatoshi = BigInt(Math.floor(parseFloat(amount) * 100000000));
      const result = await backend.withdraw(destinationAddress, amountInSatoshi);
      setTxId(result);
      setDestinationAddress('');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to withdraw. Make sure you have sufficient balance.');
      console.error('Error withdrawing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Withdraw Bitcoin</h2>
      <p className="text-sm text-gray-600 mb-4">
        Send your Bitcoin from the vault to any address
      </p>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination Address
          </label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Enter Bitcoin address"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (BTC)
          </label>
          <input
            type="number"
            step="0.00000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum: 0.00000546 BTC (546 satoshis - dust limit)
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold"
        >
          {loading ? 'Processing Withdrawal...' : 'Withdraw'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {txId && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
          <p className="text-sm font-semibold text-green-900 mb-2">✓ Withdrawal Successful!</p>
          <p className="text-xs text-gray-600 mb-2">Transaction ID:</p>
          <p className="text-xs font-mono bg-white p-3 rounded break-all text-gray-700 border">
            {txId}
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Your withdrawal has been broadcast to the Bitcoin network. It will be confirmed in the next block (typically ~10 minutes).
          </p>
        </div>
      )}

      <div className="mt-6 space-y-3">
        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm font-semibold text-blue-900 mb-2">Withdrawal Notes:</p>
          <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
            <li>Network fees will be automatically deducted</li>
            <li>Withdrawals are processed immediately</li>
            <li>You can only withdraw funds you deposited</li>
          </ul>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important:</p>
          <p className="text-sm text-yellow-800">
            Double-check the destination address before withdrawing. Bitcoin transactions cannot be reversed!
          </p>
        </div>
      </div>
    </div>
  );
}
