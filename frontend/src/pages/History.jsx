import { useState } from "react";
import "./History.css";

export default function History() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("holesky");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const networks = [
    { id: "holesky", name: "Holesky Testnet" },
    { id: "sepolia", name: "Sepolia Testnet" },
    { id: "mainnet", name: "Ethereum Mainnet" }
  ];

  const fetchHistory = async () => {
    if (!address) {
      setError("Please enter a valid Ethereum address.");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`http://localhost:3030/history/${address}/${chain}`);
      const data = await response.json();

      if (data.error) {
        setError("No transactions found for this address.");
      } else {
        setTransactions(data.transactions);
      }
    } catch (err) {
      setError("Error fetching transaction history. Please try again.");
    }

    setLoading(false);
  };

  const formatAddress = (addr) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="history-container">
      <h1>Transaction History</h1>
      
      <div className="history-input">
        <input
          type="text"
          placeholder="Enter Ethereum address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <select 
          value={chain} 
          onChange={(e) => setChain(e.target.value)}
          className="chain-selector"
        >
          {networks.map(net => (
            <option key={net.id} value={net.id}>
              {net.name}
            </option>
          ))}
        </select>
        <button 
          onClick={fetchHistory} 
          disabled={loading}
          className={loading ? 'loading' : ''}
        >
          {loading ? (
            <span className="loading-spinner"></span>
          ) : (
            "Get History"
          )}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {transactions.length > 0 && (
        <div className="table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Transaction Hash</th>
                <th>From</th>
                <th>To</th>
                <th>Value (ETH)</th>
                <th>Date</th>
                <th>Network</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => (
                <tr key={index}>
                  <td>
                    <a
                      href={`https://${chain === 'mainnet' ? '' : chain + '.'}etherscan.io/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tx.hash}
                    >
                      {formatAddress(tx.hash)}
                    </a>
                  </td>
                  <td title={tx.from}>{formatAddress(tx.from)}</td>
                  <td title={tx.to}>{formatAddress(tx.to)}</td>
                  <td>{parseFloat(tx.value).toFixed(4)}</td>
                  <td>{formatTimestamp(tx.timestamp)}</td>
                  <td>
                    <span className="network-badge">
                      {chain}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="empty-state">
          <p>Enter an address to view transaction history</p>
        </div>
      )}
    </div>
  );
}
