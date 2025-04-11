// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTMarketplace is ERC721URIStorage, Ownable {
    uint256 public tokenCounter;

    struct ListedToken {
        uint256 tokenId;
        address seller;
        uint256 price;
        string tokenURI;
    }

    mapping(uint256 => ListedToken) public listedTokens;

    constructor() ERC721("MyNFT", "MNFT") Ownable(msg.sender) {
        tokenCounter = 1;
    }

    function createNFT(string memory tokenURI, uint256 price) public {
        uint256 tokenId = tokenCounter;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        listedTokens[tokenId] = ListedToken(tokenId, msg.sender, price, tokenURI);
        tokenCounter++;
    }

    function buyNFT(uint256 tokenId) public payable {
        ListedToken memory item = listedTokens[tokenId];
        require(msg.value >= item.price, "Insufficient ETH sent");

        address seller = item.seller;
        _transfer(seller, msg.sender, tokenId);

        payable(seller).transfer(msg.value);
        delete listedTokens[tokenId];
    }

    function getListedTokens() public view returns (ListedToken[] memory) {
        uint256 count = tokenCounter - 1;
        uint256 index = 0;
        ListedToken[] memory tokens = new ListedToken[](count);

        for (uint256 i = 1; i <= count; i++) {
            if (listedTokens[i].seller != address(0)) {
                tokens[index] = listedTokens[i];
                index++;
            }
        }

        return tokens;
    }

    function getNFT(uint256 tokenId) public view returns (ListedToken memory) {
        require(tokenId < tokenCounter, "Token does not exist");
        return listedTokens[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return tokenCounter - 1;
    }
}
