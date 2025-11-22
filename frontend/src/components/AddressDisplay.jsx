import React, { useState, useEffect } from 'react';

export default function AddressDisplay({ backend }) {
  const [addresses, setAddresses] = useState({
    p2pkh: '',
    p2trKeyOnly: '',
    p2tr: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAddresses = async () => {
    setLoading(true);
    setError('');
    try {
      const [p2pkh, p2trKeyOnly, p2tr] = await Promise.all([
        backend.get_p2pkh_address(),
        backend.get_p2tr_key_only_address(),
        backend.get_p2tr_address(),
      ]);
      setAddresses({ p2pkh, p2trKeyOnly, p2tr });
    } catch (err) {
      setError(err.message || 'Failed to load addresses');
      console.error('Error loading addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Bitcoin Addresses</h2>

      <button
        onClick={loadAddresses}
        disabled={loading}
        className="mb-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Loading...' : 'Load Addresses'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <AddressCard
          title="P2PKH Address"
          subtitle="Legacy Pay-to-Public-Key-Hash"
          address={addresses.p2pkh}
          onCopy={copyToClipboard}
        />
        <AddressCard
          title="P2TR Key-Only Address"
          subtitle="Taproot Key Path Only"
          address={addresses.p2trKeyOnly}
          onCopy={copyToClipboard}
        />
        <AddressCard
          title="P2TR Address"
          subtitle="Full Taproot (Key + Script Paths)"
          address={addresses.p2tr}
          onCopy={copyToClipboard}
        />
      </div>
    </div>
  );
}

function AddressCard({ title, subtitle, address, onCopy }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-gray-200 rounded p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {address && (
          <button
            onClick={handleCopy}
            className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        )}
      </div>
      {address ? (
        <p className="text-sm font-mono bg-gray-50 p-2 rounded break-all text-gray-700">
          {address}
        </p>
      ) : (
        <p className="text-sm text-gray-400 italic">Click "Load Addresses" to generate</p>
      )}
    </div>
  );
}
