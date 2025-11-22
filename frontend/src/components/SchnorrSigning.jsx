import React, { useState } from 'react';

export default function SchnorrSigning({ backend }) {
  const [message, setMessage] = useState('');
  const [derivationPath, setDerivationPath] = useState('');
  const [merkleRootHash, setMerkleRootHash] = useState('');
  const [useBip341, setUseBip341] = useState(false);
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
      if (!message.trim()) {
        setError('Please enter a message (32 bytes as hex)');
        return;
      }

      const msgBytes = hexToBytes(message.replace(/^0x/, ''));
      if (msgBytes.length !== 32) {
        setError('Message must be exactly 32 bytes (64 hex characters)');
        return;
      }

      let aux = null;
      if (useBip341) {
        if (!merkleRootHash.trim()) {
          setError('BIP-341 mode requires a Merkle root hash');
          return;
        }
        const merkleBytes = hexToBytes(merkleRootHash.replace(/^0x/, ''));
        if (merkleBytes.length !== 32) {
          setError('Merkle root hash must be 32 bytes');
          return;
        }
        aux = { bip341: { merkle_root_hash: merkleBytes } };
      }

      setLoading(true);
      const path = parseDerivationPath(derivationPath);
      const sig = await backend.sign_with_schnorr(msgBytes, path, aux ? [aux] : []);
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
      const pubKey = await backend.get_schnorr_public_key(path);
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
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Schnorr Signing Service</h2>
      <p className="text-sm text-gray-600 mb-4">
        Sign messages using threshold Schnorr BIP340/BIP341 signatures
      </p>

      <form onSubmit={signMessage} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message (32 bytes, hex)
          </label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="0x1234567890abcdef..."
            className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter your message as 32 bytes (64 hex characters)
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
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="bip341"
            checked={useBip341}
            onChange={(e) => setUseBip341(e.target.checked)}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="bip341" className="text-sm font-medium text-gray-700">
            Use BIP-341 (Taproot)
          </label>
        </div>

        {useBip341 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merkle Root Hash (32 bytes, hex)
            </label>
            <input
              type="text"
              value={merkleRootHash}
              onChange={(e) => setMerkleRootHash(e.target.value)}
              placeholder="0x..."
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
            />
          </div>
        )}

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
