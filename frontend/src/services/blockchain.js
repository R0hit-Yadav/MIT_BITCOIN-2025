import { ethers } from 'ethers';

const NFTMarketplaceABI = [
    "function tokenCounter() view returns (uint256)",
    "function listedTokens(uint256) view returns (uint256 tokenId, address seller, uint256 price, string memory tokenURI)",
    "function createNFT(string memory tokenURI, uint256 price)",
    "function buyNFT(uint256 tokenId) payable",
    "function getListedTokens() view returns (tuple(uint256 tokenId, address seller, uint256 price, string memory tokenURI)[])",
    "function getNFT(uint256 tokenId) view returns (tuple(uint256 tokenId, address seller, uint256 price, string memory tokenURI))",
    "function totalSupply() view returns (uint256)",
    "function ownerOf(uint256 tokenId) view returns (address)"
];

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS; // Use environment variable for contract address NFT2



export const connectWallet = async () => {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            return accounts[0];
        } catch (error) {
            console.error("Error connecting to wallet:", error);
            return null;
        }
    } else {
        alert("Please install MetaMask!");
        return null;
    }
};

export const getContract = () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(contractAddress, NFTMarketplaceABI, provider);
};

export const getContractWithSigner = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, NFTMarketplaceABI, signer);
};

export const createNFT = async (tokenURI, price) => {
    try {
        const contract = await getContractWithSigner();
        const tx = await contract.createNFT(tokenURI, price);
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error creating NFT:", error);
        return false;
    }
};

export const buyNFT = async (tokenId, price) => {
    try {
        const contract = await getContractWithSigner();
        const tx = await contract.buyNFT(tokenId, { value: price });
        await tx.wait();
        return true;
    } catch (error) {
        console.error("Error buying NFT:", error);
        return false;
    }
};

export const getListedNFTs = async () => {
    try {
        const contract = getContract();
        const listedTokens = await contract.getListedTokens();
        return listedTokens;
    } catch (error) {
        console.error("Error fetching listed NFTs:", error);
        return [];
    }
};

export const getOwnedNFTs = async (ownerAddress) => {
    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
            contractAddress,
            NFTMarketplaceABI,
            signer
        );

        // Get the total number of NFTs
        const totalSupply = await contract.totalSupply();
        
        // Array to store owned NFTs
        const ownedNFTs = [];

        // Check each token ID to see if it's owned by the address
        for (let i = 1; i <= totalSupply; i++) {
            try {
                const owner = await contract.ownerOf(i);
                if (owner.toLowerCase() === ownerAddress.toLowerCase()) {
                    const nft = await contract.getNFT(i);
                    ownedNFTs.push({
                        tokenId: i,
                        seller: nft.seller,
                        price: nft.price,
                        tokenURI: nft.tokenURI
                    });
                }
            } catch (error) {
                // Skip if token doesn't exist or other error
                continue;
            }
        }

        return ownedNFTs;
    } catch (error) {
        console.error('Error fetching owned NFTs:', error);
        throw error;
    }
}; 