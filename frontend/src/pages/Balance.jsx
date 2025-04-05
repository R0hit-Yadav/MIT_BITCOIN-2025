import { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import "./Balance.css";

export default function Balance() {
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [network, setNetwork] = useState("mainnet");
  const [error, setError] = useState("");
  const [recentTransactions, setRecentTransactions] = useState([]);
  const { account, isConnected } = useWallet();

  const networks = [
    { id: "mainnet", name: "Ethereum Mainnet" },
    { id: "sepolia", name: "Sepolia Testnet" },
    { id: "holesky", name: "Holesky Testnet" }
  ];

  useEffect(() => {
    if (isConnected && account) {
      setAddress(account);
      fetchBalance(account);
    }
  }, [isConnected, account]);

  useEffect(() => {
    fetchEthPrice();
  }, []);

  const fetchEthPrice = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
      setEthPrice(response.data.ethereum.usd);
    } catch (error) {
      console.error("Error fetching ETH price:", error);
    }
  };

  const fetchBalance = async (addr = address) => {
    setError("");
    if (!ethers.isAddress(addr)) {
      setError("Invalid Ethereum address");
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3030/balance/${addr}`);
      setBalance(response.data.balance);
      fetchRecentTransactions(addr);
    } catch (error) {
      setError("Error fetching balance. Please try again.");
      console.error("Error fetching balance", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentTransactions = async (addr) => {
    try {
      const response = await axios.get(`http://localhost:3030/transactions/${addr}/${network}`);
      setRecentTransactions(response.data.transactions.slice(0, 5));
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="home-container">
      <h1>Ethereum Wallet Balance</h1>
      
      <div className="network-selector">
        <select 
          value={network} 
          onChange={(e) => setNetwork(e.target.value)}
          className="network-select"
        >
          {networks.map(net => (
            <option key={net.id} value={net.id}>
              {net.name}
            </option>
          ))}
        </select>
      </div>

      <div className="address-input-container">
        <input
          type="text"
          placeholder="Enter ETH address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button 
          onClick={() => fetchBalance()} 
          disabled={loading}
          className="check-balance-btn"
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            "Check Balance"
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {balance && (
        <div className="balance-card">
          <div className="balance-header">
            <h2>Current Balance</h2>
            <span className="network-badge">{network}</span>
          </div>
          
          <div className="balance-amounts">
            <div className="eth-balance">
              <span className="balance-value">{balance}</span>
              <span className="currency">ETH</span>
            </div>
            {ethPrice && (
              <div className="usd-balance">
                <span className="balance-value">
                  ${(parseFloat(balance) * ethPrice).toFixed(2)}
                </span>
                <span className="currency">USD</span>
              </div>
            )}
          </div>
        </div>
      )}

      {recentTransactions.length > 0 && (
        <div className="transactions-section">
          <h3>Recent Transactions</h3>
          <div className="transactions-list">
            {recentTransactions.map((tx, index) => (
              <div key={index} className="transaction-item">
                <div className="tx-type">
                  {tx.from.toLowerCase() === address.toLowerCase() ? (
                    <span className="sent">Sent</span>
                  ) : (
                    <span className="received">Received</span>
                  )}
                </div>
                <div className="tx-details">
                  <div className="tx-addresses">
                    <span>From: {formatAddress(tx.from)}</span>
                    <span>To: {formatAddress(tx.to)}</span>
                  </div>
                  <div className="tx-info">
                    <span className="tx-amount">{ethers.formatEther(tx.value)} ETH</span>
                    <span className="tx-date">{formatTimestamp(tx.timeStamp)}</span>
                  </div>
                </div>
                <a 
                  href={`https://${network === 'mainnet' ? '' : network + '.'}etherscan.io/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-tx"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {balance && (
        <div className="additional-actions">
          <button 
            onClick={() => window.open(`https://${network === 'mainnet' ? '' : network + '.'}etherscan.io/address/${address}`, '_blank')}
            className="view-on-etherscan"
          >
            View on Etherscan
          </button>
          <button 
            onClick={() => {navigator.clipboard.writeText(address)}}
            className="copy-address"
          >
            Copy Address
          </button>
        </div>
      )}
    </div>
  );
}
