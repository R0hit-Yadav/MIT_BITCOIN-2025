import { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet();
  
  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <h1>VaultX</h1>
        </div>
        
        <div className="navbar-toggle" onClick={toggleNavbar}>
          <div className={`toggle-icon ${isOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
        
        <ul className={isOpen ? "active" : ""}>
          <li><Link to="/" onClick={() => setIsOpen(false)}>Home</Link></li>
          <li><Link to="/send" onClick={() => setIsOpen(false)}>Transaction</Link></li>
          <li><Link to="/history" onClick={() => setIsOpen(false)}>History</Link></li>
          <li><Link to="/balance" onClick={() => setIsOpen(false)}>Balance</Link></li>
          <li><Link to="/crypto" onClick={() => setIsOpen(false)}>Crypto</Link></li>
          <li><Link to="/nft-marketplace" onClick={() => setIsOpen(false)}>NFT</Link></li>
        </ul>

        <div className="wallet-section">
          {isConnected ? (
            <div className="wallet-info">
              <span className="wallet-address">{formatAddress(account)}</span>
              <button onClick={disconnectWallet} className="disconnect-btn">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connectWallet} className="connect-btn">
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}