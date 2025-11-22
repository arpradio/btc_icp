import React, { useState } from 'react';

export default function BlockHeaders({ backend }) {
  const [startHeight, setStartHeight] = useState('');
  const [endHeight, setEndHeight] = useState('');
  const [headers, setHeaders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const bytesToHex = (bytes) => {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const reverseHex = (hex) => {
    return hex.match(/../g).reverse().join('');
  };

  const getHeaders = async (e) => {
    e.preventDefault();
    setError('');
    setHeaders(null);

    try {
      if (!startHeight.trim()) {
        setError('Please enter a start height');
        return;
      }

      const start = parseInt(startHeight);
      if (isNaN(start) || start < 0) {
        setError('Start height must be a positive number');
        return;
      }

      let end = null;
      if (endHeight.trim()) {
        end = parseInt(endHeight);
        if (isNaN(end) || end < start) {
          setError('End height must be greater than or equal to start height');
          return;
        }
      }

      setLoading(true);
      const response = await backend.get_block_headers(start, end ? [end] : []);
      setHeaders(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch block headers');
      console.error('Error fetching headers:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Bitcoin Block Headers</h2>
      <p className="text-sm text-gray-600 mb-4">
        Retrieve Bitcoin block headers for a specific range of blocks
      </p>

      <form onSubmit={getHeaders} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Height
            </label>
            <input
              type="number"
              value={startHeight}
              onChange={(e) => setStartHeight(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Height (optional)
            </label>
            <input
              type="number"
              value={endHeight}
              onChange={(e) => setEndHeight(e.target.value)}
              placeholder="Leave empty for single block"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition font-semibold"
        >
          {loading ? 'Fetching Headers...' : 'Get Block Headers'}
        </button>
      </form>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {headers && (
        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Tip Height:</span> {headers.tip_height.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-semibold">Headers Retrieved:</span> {headers.block_headers.length}
            </p>
          </div>

          {headers.block_headers.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No headers found for this range</p>
          ) : (
            <div className="space-y-3">
              {headers.block_headers.map((header, index) => {
                const headerHex = bytesToHex(new Uint8Array(header));
                const blockHeight = parseInt(startHeight) + index;

                // Parse header fields (Bitcoin block header is 80 bytes)
                const version = headerHex.substr(0, 8);
                const prevBlock = reverseHex(headerHex.substr(8, 64));
                const merkleRoot = reverseHex(headerHex.substr(72, 64));
                const timestamp = parseInt(reverseHex(headerHex.substr(136, 8)), 16);
                const bits = headerHex.substr(144, 8);
                const nonce = parseInt(reverseHex(headerHex.substr(152, 8)), 16);

                return (
                  <div key={index} className="border border-gray-200 rounded p-4 hover:bg-gray-50 transition">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">Block #{blockHeight.toLocaleString()}</h3>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        {headerHex.length / 2} bytes
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="grid grid-cols-4 gap-2">
                        <div className="col-span-1">
                          <p className="text-gray-500">Version</p>
                          <p className="font-mono text-gray-700">0x{version}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-500">Timestamp</p>
                          <p className="font-mono text-gray-700">{new Date(timestamp * 1000).toLocaleString()}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-500">Bits</p>
                          <p className="font-mono text-gray-700">0x{bits}</p>
                        </div>
                        <div className="col-span-1">
                          <p className="text-gray-500">Nonce</p>
                          <p className="font-mono text-gray-700">{nonce}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-500">Previous Block Hash</p>
                        <p className="font-mono text-gray-700 break-all">{prevBlock}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Merkle Root</p>
                        <p className="font-mono text-gray-700 break-all">{merkleRoot}</p>
                      </div>
                      <details className="mt-2">
                        <summary className="cursor-pointer text-purple-600 hover:text-purple-800">
                          Show Raw Header
                        </summary>
                        <p className="font-mono text-gray-600 break-all mt-2 p-2 bg-gray-100 rounded">
                          {headerHex}
                        </p>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
