import { useState } from "react";
import "./History.css"; // ✅ Add CSS styles

export default function History() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("holesky");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      console.log(data);

      if (data.error) {
        setError("No transactions found.");
      } else {
        setTransactions(data.transactions);
      }
    } catch (err) {
      setError("Error fetching transaction history.");
    }

    setLoading(false);
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
          <option value="holesky">Holesky</option>
          <option value="sepolia">Sepolia</option>
        </select>
        <button onClick={fetchHistory} disabled={loading}>
          {loading ? "Fetching..." : "Get History"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {transactions.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Tx Hash</th>
              <th>From</th>
              <th>To</th>
              <th>Value (ETH)</th>
              <th>Timestamp</th>
              <th>Chain</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={index}>
                <td>
                  <a
                    href={`https://${tx.chain}.etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tx.hash.substring(0, 8)}...
                  </a>
                </td>
                <td>{tx.from.substring(0,8)}...</td>
                <td>{tx.to.substring(0, 8)}...</td>
                <td>{parseFloat(tx.value).toFixed(4)}</td>
                <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
                <td>{tx.chain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
