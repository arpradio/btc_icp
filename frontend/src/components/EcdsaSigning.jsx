import React, { useState } from 'react';

export default function EcdsaSigning({ backend }) {
  const [messageHash, setMessageHash] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [signature, setSignature] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const hexToBytes = (hex) => {
    const bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
  };

  const bytesToHex = (bytes) => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const parseDerivationPath = (path) => {
    if (!path.trim()) return [];
    return path.split(',').map(segment => {
      const hex = segment.trim();
      return Array.from(hexToBytes(hex));
    });
  };

  const signMessage = async (e) => {
    e.preventDefault();
    setError('');
    setSignature('');

    try {
      if (!messageHash.trim()) {
        setError('Please enter a message hash (32 bytes as hex)');
        return;
      }

      const hashBytes = hexToBytes(messageHash.replace(/^0x/, ''));
      if (hashBytes.length !== 32) {
        setError('Message hash must be exactly 32 bytes (64 hex characters)');
        return;
      }

      setLoading(true);
      const path = parseDerivationPath(derivationPath);
      const sig = await backend.sign_with_ecdsa(hashBytes, path);
      setSignature(bytesToHex(new Uint8Array(sig)));
    } catch (err) {
      setError(err.message || 'Failed to sign message');
      console.error('Error signing:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPublicKey = async () => {
    setError('');
    setPublicKey('');

    try {
      setLoading(true);
      const path = parseDerivationPath(derivationPath);
      const pubKey = await backend.get_ecdsa_public_key(path);
      setPublicKey(bytesToHex(new Uint8Array(pubKey)));
    } catch (err) {
      setError(err.message || 'Failed to get public key');
      console.error('Error getting public key:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">ECDSA Signing Service</h2>
      <p className="text-sm text-gray-600 mb-4">
        Sign messages using threshold ECDSA secp256k1 signatures
      </p>

      <form onSubmit={signMessage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message Hash (32 bytes, hex)
          </label>
          <input
            type="text"
            value={messageHash}
            onChange={(e) => setMessageHash(e.target.value)}
            placeholder="0x1234567890abcdef..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the SHA-256 hash of your message (64 hex characters)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Derivation Path (optional)
          </label>
          <input
            type="text"
            value={derivationPath}
            onChange={(e) => setDerivationPath(e.target.value)}
            placeholder="Leave empty or comma-separated hex values"
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Example: 01,02 (each segment as hex, comma-separated)
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold"
          >
            {loading ? 'Signing...' : 'Sign Message'}
          </button>
          <button
            type="button"
            onClick={getPublicKey}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition font-semibold"
          >
            {loading ? 'Loading...' : 'Get Public Key'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {signature && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Signature:</p>
          <p className="text-xs font-mono bg-white p-3 rounded break-all text-gray-700 border">
            {signature}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Length: {signature.length / 2} bytes
          </p>
        </div>
      )}

      {publicKey && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Public Key:</p>
          <p className="text-xs font-mono bg-white p-3 rounded break-all text-gray-700 border">
            {publicKey}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Length: {publicKey.length / 2} bytes
          </p>
        </div>
      )}
    </div>
  );
}
