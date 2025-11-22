import React, { useState } from 'react';

export default function VaultDeposit({ backend }) {
  const [depositAddress, setDepositAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const loadDepositAddress = async () => {
    setLoading(true);
    setError('');
    try {
      const address = await backend.get_my_deposit_address();
      setDepositAddress(address);
    } catch (err) {
      setError(err.message || 'Failed to load deposit address');
      console.error('Error loading deposit address:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Deposit Bitcoin</h2>
      <p className="text-sm text-gray-600 mb-4">
        Get your unique deposit address to send Bitcoin to the vault
      </p>

      {!depositAddress ? (
        <button
          onClick={loadDepositAddress}
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold"
        >
          {loading ? 'Loading...' : 'Get My Deposit Address'}
        </button>
      ) : (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-6">
            <p className="text-sm font-semibold text-purple-900 mb-3">Your Deposit Address:</p>
            <div className="bg-white rounded p-4 mb-4">
              <p className="text-sm font-mono break-all text-gray-800">{depositAddress}</p>
            </div>
            <button
              onClick={copyAddress}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition flex items-center justify-center space-x-2"
            >
              <span>{copied ? '✓ Copied!' : '📋 Copy Address'}</span>
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">How to Deposit:</p>
            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
              <li>Copy your deposit address above</li>
              <li>Send Bitcoin from any wallet to this address</li>
              <li>Wait for network confirmations (typically ~10 minutes)</li>
              <li>Your balance will appear in the "My Vault" tab</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-1">⚠️ Important:</p>
            <p className="text-sm text-yellow-800">
              This address is unique to you. Only you can withdraw funds sent to this address.
              The vault uses your Internet Computer identity to verify withdrawals.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="text-sm font-semibold text-green-900 mb-1">🔒 Security:</p>
            <p className="text-sm text-green-800">
              Your funds are secured by the Internet Computer's threshold ECDSA signatures.
              The canister holds the keys, but only you can authorize withdrawals.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
