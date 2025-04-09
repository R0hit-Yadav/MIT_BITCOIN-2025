import { useState } from "react";
import axios from "axios";
import { ethers } from "ethers";
import "./Balance.css";

export default function Balance() {
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("sepolia"); // Default to Sepolia
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    if (!ethers.isAddress(address)) {
      setError("Invalid Ethereum address");
      return;
    }
    try {
      setError("");
      setLoading(true);
      const response = await axios.get(`http://localhost:3030/balance/${address}/${chain}`);
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance", error);
      setError(error.response?.data?.error || "Failed to fetch balance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>Ethereum Wallet Balance</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter ETH address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <select value={chain} onChange={(e) => setChain(e.target.value)}>
          <option value="sepolia">Sepolia Testnet</option>
          <option value="holesky">Holesky Testnet</option>
        </select>
        <button onClick={fetchBalance} disabled={loading}>
          {loading ? "Loading..." : "Check Balance"}
        </button>
      </div>
      {error && <div className="error">{error}</div>}
      {balance && (
        <div className="balance-display">
          <p>Balance: {balance} ETH</p>
        </div>
      )}
    </div>
  );
}
