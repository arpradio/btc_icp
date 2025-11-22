import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor } from '@dfinity/agent';
import { canisterId, createActor } from './declarations/backend';
import { idlFactory } from './declarations/backend/backend.did.js';
import VaultDeposit from './components/VaultDeposit';
import VaultBalance from './components/VaultBalance';
import VaultWithdraw from './components/VaultWithdraw';
import BalanceChecker from './components/BalanceChecker';
import UtxoViewer from './components/UtxoViewer';
import FeePercentiles from './components/FeePercentiles';
import nexLogo from '/logo.png';
import '../index.css';

function App() {
  const [activeTab, setActiveTab] = useState('deposit');
  const [authClient, setAuthClient] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [principal, setPrincipal] = useState(null);
  const [backend, setBackend] = useState(null);
  const [publicBackend, setPublicBackend] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuth();
    initPublicBackend();
  }, []);

  async function initPublicBackend() {
    // Create a public (anonymous) backend actor for public queries
    const agent = new HttpAgent({
      host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943"
    });

    if (process.env.DFX_NETWORK !== "ic") {
      await agent.fetchRootKey();
    }

    const publicActor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });

    setPublicBackend(publicActor);
  }

  async function initAuth() {
    const client = await AuthClient.create();
    setAuthClient(client);

    if (await client.isAuthenticated()) {
      handleAuthenticated(client);
    } else {
      setLoading(false);
    }
  }

  async function handleAuthenticated(client) {
    const identity = client.getIdentity();
    const principal = identity.getPrincipal();

    setPrincipal(principal);
    setIsAuthenticated(true);

    // Create authenticated actor
    const agent = new HttpAgent({
      identity,
      host: process.env.DFX_NETWORK === "ic" ? "https://ic0.app" : "http://127.0.0.1:4943"
    });

    if (process.env.DFX_NETWORK !== "ic") {
      await agent.fetchRootKey();
    }

    const authenticatedBackend = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });

    setBackend(authenticatedBackend);
    setLoading(false);
  }

  async function login() {
    setLoading(true);
    const identityProvider = process.env.DFX_NETWORK === "ic"
      ? "https://identity.ic0.app"
      : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`;

    await authClient.login({
      identityProvider,
      onSuccess: () => handleAuthenticated(authClient),
      onError: (err) => {
        console.error('Login failed:', err);
        setLoading(false);
      },
    });
  }

  async function logout() {
    await authClient.logout();
    setIsAuthenticated(false);
    setPrincipal(null);
    setBackend(null);
  }

  const tabs = [
    { id: 'deposit', label: 'Deposit', icon: '💳' },
    { id: 'vault', label: 'My Vault', icon: '🏦' },
    { id: 'withdraw', label: 'Withdraw', icon: '📤' },
    { id: 'explorer', label: 'Explorer', icon: '🔍' },
    { id: 'fees', label: 'Network Fees', icon: '⚡' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={nexLogo} alt="NexBTC Logo" className="h-12 w-12" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">NexBTC Vault</h1>
                <p className="text-sm text-gray-500">Secure Bitcoin Deposit & Withdrawal</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated && principal && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Authenticated as</p>
                  <p className="text-xs font-mono text-gray-700" title={principal.toText()}>
                    {principal.toText().slice(0, 8)}...{principal.toText().slice(-5)}
                  </p>
                </div>
              )}
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition text-sm"
                >
                  Logout
                </button>
              ) : (
                <button
                  onClick={login}
                  disabled={loading || !authClient}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:bg-gray-400 transition text-sm"
                >
                  {loading ? 'Loading...' : 'Login with Internet Identity'}
                </button>
              )}
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                <span className={`w-2 h-2 rounded-full mr-2 ${isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-blue-800 mb-2">🔄 Initializing...</p>
            <p className="text-sm text-blue-700">Setting up authentication</p>
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
              {activeTab === 'deposit' && (
                <>
                  {!isAuthenticated ? (
                    <div className="lg:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <p className="text-yellow-800 mb-3 text-lg">🔐 Authentication Required</p>
                      <p className="text-sm text-yellow-700 mb-4">
                        Please login with Internet Identity to access your vault deposit address.
                        Your deposit address is uniquely tied to your Internet Computer identity.
                      </p>
                      <button
                        onClick={login}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
                      >
                        Login with Internet Identity
                      </button>
                    </div>
                  ) : (
                    <>
                      <VaultDeposit backend={backend} />
                      <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">How the Vault Works</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        The NexBTC Vault uses the Internet Computer's threshold ECDSA signatures to
                        securely hold your Bitcoin. Each user gets a unique deposit address tied to
                        their Internet Computer identity.
                      </p>
                      <div className="bg-purple-50 border border-purple-200 rounded p-3">
                        <p className="font-semibold text-purple-900 mb-2">Security Features:</p>
                        <ul className="list-disc list-inside text-purple-800 space-y-1">
                          <li>Your identity controls your funds</li>
                          <li>Threshold signatures (no single point of failure)</li>
                          <li>Non-custodial (only you can withdraw)</li>
                          <li>Verifiable on-chain</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="font-semibold text-green-900 mb-2">Getting Started:</p>
                        <ol className="list-decimal list-inside text-green-800 space-y-1">
                          <li>Click "Get My Deposit Address"</li>
                          <li>Send Bitcoin from any wallet</li>
                          <li>Wait for confirmations</li>
                          <li>View balance in "My Vault" tab</li>
                          <li>Withdraw anytime to any address</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                      </>
                    )}
                </>
              )}
              {activeTab === 'vault' && (
                <>
                  {!isAuthenticated ? (
                    <div className="lg:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <p className="text-yellow-800 mb-3 text-lg">🔐 Authentication Required</p>
                      <p className="text-sm text-yellow-700 mb-4">
                        Please login with Internet Identity to view your vault balance and transaction history.
                      </p>
                      <button
                        onClick={login}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
                      >
                        Login with Internet Identity
                      </button>
                    </div>
                  ) : (
                    <div className="lg:col-span-2"><VaultBalance backend={backend} /></div>
                  )}
                </>
              )}
              {activeTab === 'withdraw' && (
                <>
                  {!isAuthenticated ? (
                    <div className="lg:col-span-2 bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                      <p className="text-yellow-800 mb-3 text-lg">🔐 Authentication Required</p>
                      <p className="text-sm text-yellow-700 mb-4">
                        Please login with Internet Identity to withdraw funds from your vault.
                        Only you can withdraw the Bitcoin you deposited.
                      </p>
                      <button
                        onClick={login}
                        className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700 transition"
                      >
                        Login with Internet Identity
                      </button>
                    </div>
                  ) : (
                    <>
                      <VaultWithdraw backend={backend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Withdrawal Security</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Withdrawals are authenticated using your Internet Computer identity. Only you
                        can withdraw the Bitcoin you deposited.
                      </p>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="font-semibold text-blue-900 mb-2">How It Works:</p>
                        <ul className="list-disc list-inside text-blue-800 space-y-1">
                          <li>Your identity is verified by the canister</li>
                          <li>Transaction is signed with threshold ECDSA</li>
                          <li>Funds are sent directly to your specified address</li>
                          <li>Transaction is broadcast to Bitcoin network</li>
                        </ul>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="font-semibold text-yellow-900 mb-1">Fees:</p>
                        <p className="text-yellow-800 text-xs">
                          Network fees are automatically calculated and deducted. Check the "Network Fees"
                          tab to see current rates.
                        </p>
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </>
              )}
              {activeTab === 'explorer' && (
                <>
                  <BalanceChecker backend={publicBackend} />
                  <UtxoViewer backend={publicBackend} />
                </>
              )}
              {activeTab === 'fees' && (
                <>
                  <FeePercentiles backend={publicBackend} />
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-xl font-semibold mb-4 text-gray-800">Understanding Network Fees</h3>
                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Bitcoin transaction fees are measured in satoshis per virtual byte (sat/vByte).
                        Higher fees result in faster confirmation times.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600">•</span>
                          <p><strong>Low (10-25th percentile):</strong> Slower confirmation, lower cost</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-600">•</span>
                          <p><strong>Medium (50th percentile):</strong> Balanced speed and cost</p>
                        </div>
                        <div className="flex items-start space-x-2">
                          <span className="text-orange-600">•</span>
                          <p><strong>High (75th+ percentile):</strong> Fast confirmation, higher cost</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                        <p className="text-blue-900 text-xs">
                          Vault withdrawals automatically use the 50th percentile (medium priority) for
                          reliable confirmation times at reasonable cost.
                        </p>
                      </div>
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
            <p>Secure Bitcoin Vault on the Internet Computer</p>
            <p className="mt-1 text-xs text-gray-500">
              Threshold ECDSA • Non-Custodial • Identity-Based Withdrawals
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
