import React, { useState } from 'react';

export default function FeePercentiles({ backend }) {
  const [percentiles, setPercentiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadFeePercentiles = async () => {
    setLoading(true);
    setError('');
    setPercentiles(null);
    try {
      const fees = await backend.get_current_fee_percentiles();
      console.log('Raw fees response:', fees);
      console.log('Fees type:', typeof fees);
      console.log('Fees is array:', Array.isArray(fees));

      if (!Array.isArray(fees)) {
        throw new Error('Expected array response from get_current_fee_percentiles');
      }

      // Convert BigInt to Number - fees are nat64 (millisatoshi/vbyte)
      const converted = fees.map((f, idx) => {
        console.log(`Fee[${idx}]:`, f, 'type:', typeof f);

        // Handle BigInt values
        if (typeof f === 'bigint') {
          return Number(f);
        }

        // Handle regular numbers
        if (typeof f === 'number') {
          return f;
        }

        // Try to convert to number
        try {
          return Number(f);
        } catch (e) {
          console.error(`Failed to convert fee[${idx}]:`, f, e);
          return 0;
        }
      });

      console.log('Converted fees:', converted);
      setPercentiles(converted);
    } catch (err) {
      setError(err.message || 'Failed to load fee percentiles');
      console.error('Error loading fee percentiles:', err);
      console.error('Error stack:', err.stack);
    } finally {
      setLoading(false);
    }
  };

  const formatFee = (millisatoshiPerVbyte) => {
    return (millisatoshiPerVbyte / 1000).toFixed(2);
  };

  const getRecommendation = (percentile) => {
    if (percentile <= 25) return { label: 'Low Priority', color: 'text-blue-600' };
    if (percentile <= 50) return { label: 'Medium Priority', color: 'text-yellow-600' };
    if (percentile <= 75) return { label: 'High Priority', color: 'text-orange-600' };
    return { label: 'Very High Priority', color: 'text-red-600' };
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Network Fees</h2>

      <button
        onClick={loadFeePercentiles}
        disabled={loading}
        className="mb-4 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition"
      >
        {loading ? 'Loading...' : 'Load Current Fees'}
      </button>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {percentiles && percentiles.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Current network fee estimates (sat/vByte) based on recent transactions
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[10, 25, 50, 75, 90].map((p) => {
              const fee = percentiles[p];
              const rec = getRecommendation(p);
              return (
                <div key={p} className="border border-gray-200 rounded p-4">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-gray-500">{p}th Percentile</span>
                    <span className={`text-xs font-semibold ${rec.color}`}>{rec.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-800">{formatFee(fee)}</p>
                  <p className="text-xs text-gray-500">sat/vByte</p>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded p-4 mt-4">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> These are estimates based on the last 10,000 transactions.
              Lower percentiles mean slower confirmation but lower fees. Higher percentiles
              mean faster confirmation but higher fees.
            </p>
          </div>
        </div>
      )}

      {percentiles && percentiles.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-sm text-yellow-800">
            No fee data available. This may happen on regtest networks with few transactions.
          </p>
        </div>
      )}
    </div>
  );
}
