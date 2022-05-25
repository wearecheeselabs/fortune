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

contract FurtuneDao is
    ERC721,
    ERC2981,
    ERC721Enumerable,
    ERC721URIStorage,
    Ownable,
    ERC721Burnable,
    EIP712,
    ERC721Votes
{

    mapping(uint256 => bool) public usedNonce;
    mapping(uint256 => bool) public usedTokenId;
    bytes32 private immutable DOMAIN_SEPARATOR;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );
        

    uint256 mintedCount;
    address payable receiver;
    uint96 numerator;
    uint256 mintFees;
    uint256  maxMint;

    constructor(address payable _receiver, uint96 _numerator, uint256 _mintFees, uint256 _maxMint)
        ERC721("Fortune Dao", "FDAO")
        EIP712("Fortune Dao", "1.0.1")
    {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes("Fortune Dao")), // name
                keccak256(bytes("1.0.1")), // version
                block.chainid,
                address(this)
            )
        );
        receiver = _receiver;
        numerator = _numerator;
        maxMint = _maxMint;
        mintFees = _mintFees;
    }


    function setRoyltyReceiver(address payable _receiver, uint96 _numerator)
        external
    {
        onlyOwner();
        receiver = _receiver;
        numerator = _numerator;
    }

    function verifyValue(uint256 msgValue, uint256 reqValue)private pure{
        require(msgValue >= reqValue, "insuff value");
    }
    function verifyNonce(uint256 _nonce)private {
        require(!usedNonce[_nonce], 'used Nonce');
        usedNonce[_nonce] = true;
    }

    function usedId(uint256 tokenId) private{
        require(!usedTokenId[tokenId], 'used tokenId');
        usedTokenId[tokenId] = true;
    }

    function handleMaxMint() private{
        require(mintedCount < maxMint,"mint is over");
        mintedCount++;
    }


    function safeMint(
        address to,
        uint256 tokenId,
        string calldata uri
    ) external payable{
        handleMaxMint();
        verifyValue(msg.value, mintFees);
        usedId(tokenId);
        _setTokenRoyalty(tokenId, receiver, numerator);
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    bytes32 private constant MINT_WITH_SIG = keccak256("MintWithSig(address to,uint256 tokenId,string uri,uint256 value)");

    function mintWithSig(
        address to,
        uint256 tokenId,
        string calldata uri,
        uint256 value,
        bytes calldata sig
    )external payable{
        handleMaxMint();
        verifyValue(value, mintFees);
        usedId(tokenId);
        bytes32 hashStruct = keccak256(abi.encode(MINT_WITH_SIG, to,tokenId, keccak256(bytes(uri)),value));
        require(SignatureHelper.verify(owner(), DOMAIN_SEPARATOR, hashStruct, sig),"invalid mint params");
        _setTokenRoyalty(tokenId, receiver, numerator);
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
            super.supportsInterface(interfaceId) ||
            ERC2981.supportsInterface(interfaceId);
    }
}
