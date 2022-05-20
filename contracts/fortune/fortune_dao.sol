// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../tokens/ERC721/ERC721.sol";
import "../tokens/ERC721/ERC721Enumerable.sol";
import "../tokens/ERC721/ERC721URIStorage.sol";
import "../security/Pausable.sol";
import "../security/Ownable.sol";
import "../tokens/ERC721/ERC721Burnable.sol";
import "../votes/EIP712.sol";
import "../tokens/ERC721/ERC721Votes.sol";



contract MyToken is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable, ERC721Burnable, EIP712, ERC721Votes {
    constructor() ERC721("MyToken", "MTK") EIP712("MyToken", "1") {}

    function pause() public  {
        onlyOwner();
        _pause();
    }

    function unpause() public  {
        onlyOwner();
        _unpause();
    }

    function safeMint(address to, uint256 tokenId, string memory uri)
        public
        
    {
        onlyOwner();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        whenNotPaused();
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Votes)
    {
        super._afterTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}