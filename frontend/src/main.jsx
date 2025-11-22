import React from 'react';
import ReactDOM from 'react-dom/client';
import nexLogo from '/logo.png';
import '../index.css';
import Wallet from "./wallet.jsx"


function App() {
  return (
  
    <div className="flex flex-col h-screen items-center justify-center  bg-purple-600">
      <img src={nexLogo} alt="NexBTC Logo" className="h-80 w-80" />
      <p className="text-center w-full">Your Portal to BTC Defi</p>

     <Wallet/>
    </div>
    
  
  );
}

export default App;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
