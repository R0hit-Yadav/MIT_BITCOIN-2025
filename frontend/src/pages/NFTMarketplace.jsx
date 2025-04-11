import { useState, useEffect } from 'react';
import './NFTMarketplace.css';
import { connectWallet, createNFT, buyNFT, getListedNFTs, getOwnedNFTs } from '../services/blockchain';
import { ethers } from 'ethers';
import { uploadImageToIPFS, storeNFTMetadata } from '../services/ipfs';

const NFTMarketplace = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [connectedAccount, setConnectedAccount] = useState('');
  const [nfts, setNfts] = useState([]);
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showOwnedNFTs, setShowOwnedNFTs] = useState(false);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNFT, setNewNFT] = useState({
    name: '',
    description: '',
    price: '',
    image: null
  });

  const categories = [
    { id: 'all', name: 'All NFTs', icon: '🌟' },
    { id: 'art', name: 'Art', icon: '🎨' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'virtual-world', name: 'Virtual World', icon: '🌍' }
  ];

  const loadOwnedNFTs = async () => {
    if (!connectedAccount) return;
    
    try {
      const ownedNFTs = await getOwnedNFTs(connectedAccount);
      const formattedOwnedNFTs = await Promise.all(ownedNFTs.map(async (nft) => {
        try {
          const response = await fetch(nft.tokenURI);
          const metadata = await response.json();
          
          return {
            id: nft.tokenId,
            creator: nft.seller,
            price: ethers.formatEther(nft.price),
            image: metadata.image,
            name: metadata.name,
            description: metadata.description,
            imageHash: metadata.image.split('/ipfs/')[1]
          };
        } catch (error) {
          console.error('Error fetching owned NFT metadata:', error);
          return {
            id: nft.tokenId,
            creator: nft.seller,
            price: ethers.formatEther(nft.price),
            image: 'https://via.placeholder.com/400x400?text=No+Image',
            name: `NFT #${nft.tokenId}`,
            description: 'No description available',
            imageHash: 'No hash available'
          };
        }
      }));
      
      setOwnedNFTs(formattedOwnedNFTs);
    } catch (error) {
      console.error('Error loading owned NFTs:', error);
    }
  };

  useEffect(() => {
    loadNFTs();
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    if (connectedAccount) {
      loadOwnedNFTs();
    }
  }, [connectedAccount]);

  const checkIfWalletIsConnected = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setConnectedAccount(accounts[0]);
      }
    }
  };

  const loadNFTs = async () => {
    setIsLoading(true);
    try {
      const listedNFTs = await getListedNFTs();
      const formattedNFTs = await Promise.all(listedNFTs.map(async (nft) => {
        try {
          // Fetch metadata from IPFS
          const response = await fetch(nft.tokenURI);
          const metadata = await response.json();
          
          return {
            id: nft.tokenId,
            creator: nft.seller,
            price: ethers.formatEther(nft.price),
            image: metadata.image,
            name: metadata.name,
            description: metadata.description,
            imageHash: metadata.image.split('/ipfs/')[1]
          };
        } catch (error) {
          console.error('Error fetching NFT metadata:', error);
          return {
            id: nft.tokenId,
            creator: nft.seller,
            price: ethers.formatEther(nft.price),
            image: 'https://via.placeholder.com/400x400?text=No+Image',
            name: `NFT #${nft.tokenId}`,
            description: 'No description available',
            imageHash: 'No hash available'
          };
        }
      }));
      
      setNfts(formattedNFTs);
    } catch (error) {
      console.error('Error loading NFTs:', error);
    }
    setIsLoading(false);
  };

  const handleConnectWallet = async () => {
    const account = await connectWallet();
    if (account) {
      setConnectedAccount(account);
    }
  };

  const handleCreateNFT = async (e) => {
    e.preventDefault();
    if (!newNFT.image || !newNFT.name || !newNFT.price) {
      alert('Please fill all fields');
      return;
    }

    try {
      // Upload image to IPFS
      const imageUrl = await uploadImageToIPFS(newNFT.image);
      
      // Create and store metadata
      const metadataUrl = await storeNFTMetadata(
        newNFT.name,
        newNFT.description,
        imageUrl
      );

      const priceInWei = ethers.parseEther(newNFT.price);
      
      const success = await createNFT(metadataUrl, priceInWei);
      if (success) {
        setShowCreateModal(false);
        setNewNFT({ name: '', description: '', price: '', image: null });
        loadNFTs();
      }
    } catch (error) {
      console.error('Error creating NFT:', error);
      alert('Error creating NFT. Please try again.');
    }
  };

  const handleBuyNFT = async (tokenId, price) => {
    try {
      const success = await buyNFT(tokenId, price);
      if (success) {
        loadNFTs();
      }
    } catch (error) {
      console.error('Error buying NFT:', error);
    }
  };

  const filteredNFTs = activeCategory === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.category === activeCategory);

  // const handleCategorySelect = (categoryId) => {
  //   setActiveCategory(categoryId);
  //   setIsDropdownOpen(false);
  // };

  // const currentCategory = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="nft-marketplace">
      <div className="marketplace-header">
        <h1>NFT Marketplace</h1>
        <p>Discover, collect, and trade unique digital assets</p>
        <div className="wallet-section">
          {connectedAccount ? (
            <>
              <button className="wallet-btn connected">
                {connectedAccount.slice(0, 8)}...{connectedAccount.slice(-4)}
              </button>
              <button 
                className={`toggle-nfts-btn ${showOwnedNFTs ? 'active' : ''}`}
                onClick={() => setShowOwnedNFTs(!showOwnedNFTs)}
              >
                {showOwnedNFTs ? 'Show Marketplace' : 'Show My NFTs'}
              </button>
              <button className="create-btn" onClick={() => setShowCreateModal(true)}>
                Create NFT
              </button>
            </>
          ) : (
            <button className="wallet-btn" onClick={handleConnectWallet}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      {showOwnedNFTs ? (
        <div className="owned-nfts-section">
          <h2>My NFTs</h2>
          <div className="nft-grid">
            {ownedNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <div className="nft-image">
                  <img src={nft.image} alt={nft.name} />
                </div>
                <div className="nft-info">
                  <h3>{nft.name}</h3>
                  <div className="nft-description">
                    <p>{nft.description}</p>
                  </div>
                  <div className="nft-creator">
                    <span>Created by</span>
                    <span className="creator-address">{nft.creator}</span>
                  </div>
                  <div className="nft-price">
                    <span>Price</span>
                    <span className="price-value">{nft.price} ETH</span>
                  </div>
                  <div className="nft-image-info">
                    <div className="image-hash">
                      <span>Image Hash:</span>
                      <span className="hash-value">{nft.imageHash}</span>
                    </div>
                    {nft.imageHash && (
                      <a 
                        href={`https://ipfs.io/ipfs/${nft.imageHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-image-link"
                      >
                        View Image
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* <div className="filter-section">
            <div className="dropdown-container">
              <div 
                className={`dropdown-header ${isDropdownOpen ? 'active' : ''}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="selected-category">
                  {currentCategory.icon} {currentCategory.name}
                </span>
                <svg 
                  className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
                  width="12" 
                  height="8" 
                  viewBox="0 0 12 8" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M1 1.5L6 6.5L11 1.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {isDropdownOpen && (
                <div className="dropdown-menu">
                  {categories.map(category => (
                    <div
                      key={category.id}
                      className={`dropdown-item ${activeCategory === category.id ? 'active' : ''}`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <span className="category-icon">{category.icon}</span>
                      <span className="category-name">{category.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div> */}
          <div className="nft-grid">
            {filteredNFTs.map(nft => (
              <div key={nft.id} className="nft-card">
                <div className="nft-image">
                  <img src={nft.image} alt={nft.name} />
                </div>
                <div className="nft-info">
                  <h3>{nft.name}</h3>
                  <div className="nft-description">
                    <p>{nft.description}</p>
                  </div>
                  <div className="nft-creator">
                    <span>Created by</span>
                    <span className="creator-address">{nft.creator}</span>
                  </div>
                  <div className="nft-price">
                    <span>Price</span>
                    <span className="price-value">{nft.price} ETH</span>
                  </div>
                  <div className="nft-image-info">
                    <div className="image-hash">
                      <span>Image Hash:</span>
                      <span className="hash-value">{nft.imageHash}</span>
                    </div>
                    {nft.imageHash && (
                      <a 
                        href={`https://ipfs.io/ipfs/${nft.imageHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-image-link"
                      >
                        View Image
                      </a>
                    )}
                  </div>
                  <button className="buy-btn" onClick={() => handleBuyNFT(nft.id, ethers.parseEther(nft.price))}>
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New NFT</h2>
            <form onSubmit={handleCreateNFT}>
              <input
                type="text"
                placeholder="NFT Name"
                value={newNFT.name}
                onChange={(e) => setNewNFT({...newNFT, name: e.target.value})}
              />
              <textarea
                placeholder="Description"
                value={newNFT.description}
                onChange={(e) => setNewNFT({...newNFT, description: e.target.value})}
              />
              <input
                type="number"
                placeholder="Price in ETH"
                value={newNFT.price}
                onChange={(e) => setNewNFT({...newNFT, price: e.target.value})}
              />
              <input
                type="file"
                onChange={(e) => setNewNFT({...newNFT, image: e.target.files[0]})}
              />
              <div className="modal-buttons">
                <button type="submit">Create</button>
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTMarketplace;