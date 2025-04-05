import { useState } from 'react';
import './NFTMarketplace.css';

const NFTMarketplace = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Sample NFT data - in a real app, this would come from your backend/blockchain
  const nfts = [
    {
      id: 1,
      name: "Cosmic Dreamer",
      creator: "0x742...3d9",
      price: "0.5 ETH",
      image: "https://img.freepik.com/premium-photo/divine-connection-earth-stars-cosmic-dreamer-star-whisperer-character-fantasy-fantastic-illustration-generative-ai_850000-12326.jpg?w=1380",
      category: "art"
    },
    {
      id: 2,
      name: "Digital Warrior",
      creator: "0x891...4f2",
      price: "0.8 ETH",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW5dcnd_fle5FEGI4Syi2efXA3pUk8A2HrZA&s",
      category: "gaming"
    },
    {
      id: 3,
      name: "Abstract Thoughts",
      creator: "0x342...9c1",
      price: "0.3 ETH",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvKGCMSftFKPQHsUGKU9Y1jM6YHGCSQwW-fw&s",
      category: "art"
    },
    {
      id: 4,
      name: "Metaverse Land",
      creator: "0x123...4f5",
      price: "2.0 ETH",
      image: "https://images.theconversation.com/files/458455/original/file-20220418-22-wqead9.jpg?ixlib=rb-4.1.0&rect=318%2C0%2C2604%2C1302&q=45&auto=format&w=1356&h=668&fit=crop",
      category: "virtual-world"
    }
  ];

  const categories = [
    { id: 'all', name: 'All NFTs', icon: '🌟' },
    { id: 'art', name: 'Art', icon: '🎨' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'virtual-world', name: 'Virtual World', icon: '🌍' }
  ];

  const filteredNFTs = activeCategory === 'all' 
    ? nfts 
    : nfts.filter(nft => nft.category === activeCategory);

  const handleCategorySelect = (categoryId) => {
    setActiveCategory(categoryId);
    setIsDropdownOpen(false);
  };

  const currentCategory = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="nft-marketplace">
      <div className="marketplace-header">
        <h1>NFT Marketplace</h1>
        <p>Discover, collect, and trade unique digital assets</p>
      </div>

      <div className="filter-section">
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
      </div>

      <div className="nft-grid">
        {filteredNFTs.map(nft => (
          <div key={nft.id} className="nft-card">
            <div className="nft-image">
              <img src={nft.image} alt={nft.name} />
            </div>
            <div className="nft-info">
              <h3>{nft.name}</h3>
              <div className="nft-creator">
                <span>Created by</span>
                <span className="creator-address">{nft.creator}</span>
              </div>
              <div className="nft-price">
                <span>Price</span>
                <span className="price-value">{nft.price}</span>
              </div>
              <button className="buy-btn">
                <span>
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 20 20" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg" 
                    style={{ marginRight: '8px', verticalAlign: 'middle' }}
                  >
                    <path 
                      d="M10 4L18 8L10 12L2 8L10 4Z" 
                      fill="currentColor" 
                      fillOpacity="0.8"
                    />
                    <path 
                      d="M10 12V18" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round"
                    />
                  </svg>
                  Buy Now
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NFTMarketplace; 