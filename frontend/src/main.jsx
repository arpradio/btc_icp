import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { backend } from './declarations/backend';
import AddressDisplay from './components/AddressDisplay';
import BalanceChecker from './components/BalanceChecker';
import SendTransaction from './components/SendTransaction';
import UtxoViewer from './components/UtxoViewer';
import FeePercentiles from './components/FeePercentiles';
import nexLogo from '/logo.png';
import '../index.css';

function App() {
  const [activeTab, setActiveTab] = useState('addresses');
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    if (backend) {
      setBackendReady(true);
    }
  }, []);

  const tabs = [
    { id: 'addresses', label: 'Addresses', icon: '🏠' },
    { id: 'balance', label: 'Balance', icon: '💰' },
    { id: 'send', label: 'Send', icon: '📤' },
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
                <p className="text-sm text-gray-500">Your Portal to Bitcoin DeFi</p>
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
              {activeTab === 'addresses' && <div className="lg:col-span-2"><AddressDisplay backend={backend} /></div>}
              {activeTab === 'balance' && (
                <>
                  <BalanceChecker backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">About Balance Checking</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Check the balance of any Bitcoin address on the network through the Internet Computer's Bitcoin integration.</p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-900 mb-1">Tip:</p>
                        <p className="text-blue-800">You can check your canister addresses or any Bitcoin address.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'send' && (
                <>
                  <SendTransaction backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">About Sending Bitcoin</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>Send Bitcoin from your canister's addresses to any Bitcoin address.</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="font-semibold text-yellow-900 mb-1">⚠️ Important:</p>
                        <p className="text-yellow-800 text-xs">Ensure sufficient balance. Transactions are irreversible.</p>
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
            <p>Built on the Internet Computer • Bitcoin Integration via IC Bitcoin API</p>
            <p className="mt-1 text-xs text-gray-500">Powered by threshold ECDSA and Schnorr signatures</p>
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
