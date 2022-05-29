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
import "../common/ERC2981.sol";
import "../libraries/SignatureHelper.sol";

contract FortuneDao is
    ERC2981,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    ERC721Burnable,
    ERC721Votes
{
    mapping(uint256 => bool) public usedNonce;
    mapping(uint256 => bool) public usedTokenId;

    uint256 public mintedCount;
    uint96 public royaltyNumerator;
    uint256 public mintFees;
    uint256 public maxMint;

    constructor(
        uint96 _numerator,
        uint256 _mintFees,
        uint256 _maxMint
    ) ERC721("Fortune Dao", "FDAO") EIP712("Fortune Dao", "1.0.1") {
        royaltyNumerator = _numerator;
        maxMint = _maxMint;
        mintFees = _mintFees;
    }

    function setRoyltyNumerator(uint96 _numerator) external {
        onlyOwner();
        royaltyNumerator = _numerator;
    }

    function verifyValue(uint256 msgValue, uint256 reqValue) private pure {
        require(msgValue >= reqValue, "insuff value");
    }

    function verifyNonce(uint256 _nonce) private {
        require(!usedNonce[_nonce], "used Nonce");
        usedNonce[_nonce] = true;
    }

    function usedId(uint256 tokenId) private {
        require(!usedTokenId[tokenId], "used tokenId");
        usedTokenId[tokenId] = true;
    }

    function handleMaxMint() private {
        require(mintedCount < maxMint, "mint is over");
        mintedCount++;
    }

    function checkBalance(address account) private view {
        require(balanceOf(account) < 10, "balance can not exceed 10");
    }

    function safeMint(
        address to,
        uint256 tokenId,
        string calldata uri
    ) external payable {
        handleMaxMint();
        verifyValue(msg.value, mintFees);
        usedId(tokenId);
        checkBalance(to);
        _setTokenRoyalty(tokenId, feeReceiver(), royaltyNumerator);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    bytes32 private constant MINT_WITH_SIG =
        keccak256(
            "MintWithSig(address to,uint256 tokenId,string uri,uint256 value,uint256 nonce)"
        );

    function mintWithSig(
        address to,
        uint256 tokenId,
        string calldata uri,
        uint256 value,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        handleMaxMint();
        verifyValue(value, mintFees);
        verifyNonce(nonce);
        usedId(tokenId);
        checkBalance(to);

        address signer = ECDSA.recover(
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        MINT_WITH_SIG,
                        to,
                        tokenId,
                        keccak256(bytes(uri)),
                        value,
                        nonce
                    )
                )
            ),
            v,
            r,
            s
        );
        require(owner() == signer, "signer not owner");
        _setTokenRoyalty(tokenId, feeReceiver(), royaltyNumerator);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Votes) {
        super._afterTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
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
        override(ERC721, ERC721Enumerable, ERC2981)
        returns (bool)
    {
        return
            ERC721Enumerable.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }
}
