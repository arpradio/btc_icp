import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from './declarations/backend';
import BalanceChecker from './components/BalanceChecker';
import UtxoViewer from './components/UtxoViewer';
import FeePercentiles from './components/FeePercentiles';
import EcdsaSigning from './components/EcdsaSigning';
import SchnorrSigning from './components/SchnorrSigning';
import BlockHeaders from './components/BlockHeaders';
import nexLogo from '/logo.png';
import '../index.css';

function App() {
  const [activeTab, setActiveTab] = useState('ecdsa');
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (backend) {
      setBackendReady(true);
    }
  }, []);

  const tabs = [
    { id: 'ecdsa', label: 'ECDSA', icon: '🔐' },
    { id: 'schnorr', label: 'Schnorr', icon: '✍️' },
    { id: 'headers', label: 'Block Headers', icon: '📦' },
    { id: 'balance', label: 'Balance', icon: '💰' },
    { id: 'utxos', label: 'UTXOs', icon: '🔍' },
    { id: 'fees', label: 'Fees', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={nexLogo} alt="NexBTC Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">NexBTC</h1>
                <p className="text-sm text-gray-500">Bitcoin Signing & Query Service</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${backendReady ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${backendReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {backendReady ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!backendReady ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 mb-2">⚠️ Backend canister not connected</p>
            <p className="text-sm text-yellow-700">
              Make sure your local replica is running with <code className="bg-yellow-100 px-2 py-1 rounded">dfx start</code>
              {' '}and deploy the canisters with <code className="bg-yellow-100 px-2 py-1 rounded">dfx deploy</code>
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-sm mb-6 p-2">
              <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeTab === 'ecdsa' && (
                <>
                  <EcdsaSigning backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">About ECDSA Signing</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Threshold ECDSA signing service using the secp256k1 curve. This is the same
                        signature algorithm used in Bitcoin and Ethereum.
                      </p>
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <p className="font-semibold text-purple-900 mb-2">Use Cases:</p>
                        <ul className="list-disc list-inside text-purple-800 space-y-1">
                          <li>Bitcoin transaction signing</li>
                          <li>Ethereum transaction signing</li>
                          <li>General cryptographic signatures</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-900 mb-1">Note:</p>
                        <p className="text-blue-800 text-xs">
                          The message hash must be exactly 32 bytes. For Bitcoin, this is typically
                          the double SHA-256 hash of the transaction data.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'schnorr' && (
                <>
                  <SchnorrSigning backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">About Schnorr Signing</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Threshold Schnorr signing service using BIP340/BIP341. This is used for
                        Taproot transactions in Bitcoin.
                      </p>
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <p className="font-semibold text-purple-900 mb-2">Features:</p>
                        <ul className="list-disc list-inside text-purple-800 space-y-1">
                          <li>BIP340 (standard Schnorr)</li>
                          <li>BIP341 (Taproot with Merkle root)</li>
                          <li>Smaller signatures than ECDSA</li>
                        </ul>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-900 mb-1">Taproot Mode:</p>
                        <p className="text-blue-800 text-xs">
                          Enable BIP-341 mode for Taproot script-path spending. Requires a 32-byte
                          Merkle root hash of the script tree.
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'headers' && (
                <>
                  <div className="lg:col-span-2"><BlockHeaders backend={backend} /></div>
                </>
              )}
              {activeTab === 'balance' && (
                <>
                  <BalanceChecker backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">About Balance Checking</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Query the balance of any Bitcoin address on the network. This uses the
                        Internet Computer's native Bitcoin integration.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-900 mb-1">Supported Networks:</p>
                        <p className="text-blue-800 text-xs">
                          Mainnet, Testnet, and Regtest (local development)
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'utxos' && <div className="lg:col-span-2"><UtxoViewer backend={backend} /></div>}
              {activeTab === 'fees' && (
                <>
                  <FeePercentiles backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Understanding Fees</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Bitcoin fees are measured in sat/vByte. Higher fees mean faster confirmation.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Bitcoin Signing & Query Service on the Internet Computer</p>
            <p className="mt-1 text-xs text-gray-500">
              Threshold ECDSA • Schnorr BIP340/BIP341 • Native Bitcoin Integration
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
