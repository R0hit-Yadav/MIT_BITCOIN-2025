import { useState } from "react";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import "./Navbar.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const { account, isConnected, connectWallet, disconnectWallet } = useWallet();
  
  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000); // Hide after 2 seconds
      } catch (err) {
        console.error('Failed to copy address:', err);
      }
    }
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
          {/* <li><Link to="/balance" onClick={() => setIsOpen(false)}>Balance</Link></li> */}
          <li><Link to="/crypto" onClick={() => setIsOpen(false)}>Crypto</Link></li>
          <li><Link to="/nft-marketplace" onClick={() => setIsOpen(false)}>NFT</Link></li>
          <li><Link to="/news" onClick={() => setIsOpen(false)}>News</Link></li>
        </ul>

        <div className="wallet-section">
          {isConnected ? (
            <div className="wallet-info">
              <div className="wallet-address-container">
                <span className="wallet-address" onClick={copyToClipboard} title="Click to copy address">
                  {formatAddress(account)}
                  {showCopied && <span className="copied-tooltip">Copied!</span>}
                </span>
              </div>
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