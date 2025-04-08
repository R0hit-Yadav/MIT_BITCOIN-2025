import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "../context/WalletContext";
import "./Send.css";

export default function Send() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [chain, setChain] = useState("holesky");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState(""); // "pending", "success", "error"
  const [transactionDetails, setTransactionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { account, isConnected, connectWallet } = useWallet();

  const switchNetwork = async (chainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          const chainConfig = {
            'holesky': {
              chainId: '0x4268',
              chainName: 'Holesky',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://holesky.infura.io/v3/'],
              blockExplorerUrls: ['https://holesky.etherscan.io']
            },
            'sepolia': {
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }
          };

          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig[chain]]
          });
          return true;
        } catch (addError) {
          console.error('Error adding network:', addError);
          return false;
        }
      }
      console.error('Error switching network:', switchError);
      return false;
    }
  };

  const sendTransaction = async () => {
    if (!isConnected) {
      setStatus("Please connect your wallet first");
      setStatusType("error");
      return;
    }

    if (!ethers.isAddress(recipient)) {
      setStatus("Invalid recipient address");
      setStatusType("error");
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setStatus("Please enter a valid amount");
      setStatusType("error");
      return;
    }
    
    setIsLoading(true);
    setStatus("Preparing transaction...");
    setStatusType("pending");
    setTransactionDetails(null);
    
    try {
      // Switch network based on selected chain
      const chainId = chain === 'holesky' ? 17000 : 11155111;
      const networkSwitched = await switchNetwork(chainId);
      
      if (!networkSwitched) {
        throw new Error(`Failed to switch to ${chain} network`);
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      // Get current gas price
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount),
        gasLimit: 21000,
        gasPrice: gasPrice,
      });
      
      setStatus(`Transaction sent! Waiting for confirmation...`);
      
      const receipt = await tx.wait();

      const details = {
        tx_hash: receipt.hash,
        from: receipt.from,
        to: receipt.to,
        value: amount + " ETH",
        gas_used: receipt.gasUsed?.toString() || "N/A",
        gas_price: receipt.effectiveGasPrice ? ethers.formatUnits(receipt.effectiveGasPrice, "gwei") + " Gwei" : "N/A",
        block_number: receipt.blockNumber || "N/A",
        status: receipt.status === 1 ? "Success" : "Failed",
        timestamp: new Date().toLocaleString(),
        chain: chain,
        explorer_url: `https://${chain}.etherscan.io/tx/${receipt.hash}`
      };

      setTransactionDetails(details);
      setStatus(`Transaction confirmed!`);
      setStatusType("success");

    } catch (error) {
      console.error("Transaction error:", error);
      setStatus(`Transaction Failed: ${error.message || "Unknown error"}`);
      setStatusType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="send-page">
      <div className="send-container">
        <div className="background-pattern"></div>
        
        <h1>
          <span className="eth-icon"></span>
          Send ETH
        </h1>
        
        {!isConnected ? (
          <div className="connect-prompt">
            <p>Please connect your wallet to send transactions</p>
            <button onClick={connectWallet} className="connect-btn">
              Connect Wallet
            </button>
          </div>
        ) : (
          <>
            <div className="sender-info">
              <p>From: <span className="mono-text">{account}</span></p>
            </div>

            <select 
              value={chain} 
              onChange={(e) => setChain(e.target.value)}
              className="chain-selector"
            >
              <option value="holesky">Holesky</option>
              <option value="sepolia">Sepolia</option>
            </select>

            <input
              type="text"
              placeholder="Recipient Address (0x...)"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="address-input"
            />
            
            <div className="amount-input-wrapper">
              <input
                type="text"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="amount-input"
              />
            </div>
            
            <button 
              onClick={sendTransaction}
              disabled={isLoading}
              className={isLoading ? "loading-btn" : ""}
            >
              {isLoading ? (
                <>
                  <span className="loading"></span>
                  Processing...
                </>
              ) : (
                "Send Transaction"
              )}
            </button>
            
            {status && (
              <p className={statusType}>
                {statusType === "pending" && <span className="status-icon pending"></span>}
                {statusType === "success" && <span className="status-icon success"></span>}
                {statusType === "error" && <span className="status-icon error"></span>}
                {status}
              </p>
            )}
          </>
        )}
      </div>

      {transactionDetails && (
        <div className="send-container tx-details-container">
          <h3>Transaction Details</h3>
          <p><strong>Transaction Hash:</strong> <span className="mono-text">{transactionDetails.tx_hash}</span></p>
          <p><strong>From:</strong> <span className="mono-text">{transactionDetails.from}</span></p>
          <p><strong>To:</strong> <span className="mono-text">{transactionDetails.to}</span></p>
          <p>
            <strong>Value:</strong> 
            <span><span className="eth-symbol"></span>{transactionDetails.value}</span>
          </p>
          <p><strong>Gas Used:</strong> <span>{transactionDetails.gas_used}</span></p>
          <p><strong>Gas Price:</strong> <span>{transactionDetails.gas_price}</span></p>
          <p><strong>Block Number:</strong> <span>{transactionDetails.block_number}</span></p>
          <p><strong>Status:</strong> <span className={`status ${transactionDetails.status.toLowerCase()}`}>{transactionDetails.status}</span></p>
          <p><strong>Chain:</strong> <span>{transactionDetails.chain}</span></p>
          <p><strong>Time:</strong> <span>{transactionDetails.timestamp}</span></p>
          <p><strong>Explorer:</strong> <a href={transactionDetails.explorer_url} target="_blank" rel="noopener noreferrer">View on Explorer</a></p>
        </div>
      )}
    </div>
  );
}