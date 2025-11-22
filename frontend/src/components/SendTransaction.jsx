import React, { useState } from 'react';

export default function SendTransaction({ backend }) {
  const [addressType, setAddressType] = useState('p2pkh');
  const [destinationAddress, setDestinationAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sendTransaction = async (e) => {
    e.preventDefault();
    if (!destinationAddress.trim()) {
      setError('Please enter a destination address');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading(true);
    setError('');
    setTxId('');

    try {
      const amountInSatoshi = BigInt(Math.floor(parseFloat(amount) * 100000000));
      const request = {
        destination_address: destinationAddress,
        amount_in_satoshi: amountInSatoshi,
      };

      let result;
      switch (addressType) {
        case 'p2pkh':
          result = await backend.send_from_p2pkh_address(request);
          break;
        case 'p2tr_key_only':
          result = await backend.send_from_p2tr_key_only_address(request);
          break;
        case 'p2tr_key_path':
          result = await backend.send_from_p2tr_address_key_path(request);
          break;
        case 'p2tr_script_path':
          result = await backend.send_from_p2tr_address_script_path(request);
          break;
        default:
          throw new Error('Invalid address type');
      }

      setTxId(result);
      setDestinationAddress('');
      setAmount('');
    } catch (err) {
      setError(err.message || 'Failed to send transaction');
      console.error('Error sending transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Send Bitcoin</h2>

      <form onSubmit={sendTransaction} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Send From
          </label>
          <select
            value={addressType}
            onChange={(e) => setAddressType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="p2pkh">P2PKH Address</option>
            <option value="p2tr_key_only">P2TR Key-Only Address</option>
            <option value="p2tr_key_path">P2TR Address (Key Path)</option>
            <option value="p2tr_script_path">P2TR Address (Script Path)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination Address
          </label>
          <input
            type="text"
            value={destinationAddress}
            onChange={(e) => setDestinationAddress(e.target.value)}
            placeholder="Enter destination Bitcoin address"
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
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold"
        >
          {loading ? 'Sending...' : 'Send Transaction'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {txId && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
          <p className="text-sm text-gray-600 mb-2">Transaction sent successfully!</p>
          <p className="text-xs font-mono bg-white p-2 rounded break-all text-gray-700">
            TX ID: {txId}
          </p>
        </div>
      )}
    </div>
  );
}
