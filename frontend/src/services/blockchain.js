import { ethers } from 'ethers';

const NFTMarketplaceABI = [
    "function tokenCounter() view returns (uint256)",
    "function listedTokens(uint256) view returns (uint256 tokenId, address seller, uint256 price)",
    "function createNFT(string memory tokenURI, uint256 price)",
    "function buyNFT(uint256 tokenId) payable",
    "function getListedTokens() view returns (tuple(uint256 tokenId, address seller, uint256 price)[])"
];

const contractAddress = "0x25aE73AE91E3Dd2c59931BF9F4B54fF056987765"; // Use environment variable for contract address

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