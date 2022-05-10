// SPDX-License-Identifier: MIT

// File: @openzeppelin/contracts/utils/Context.sol

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

import "../security/Pausable.sol";
import "../tokens/ERC1155/ERC1155Burnable.sol";
import "../common/ERC2981.sol";
import "../libraries/SignatureHelper.sol";

contract Fortune is Pausable, ERC1155Burnable, ERC2981 {
    string public constant name = "Fortune Treasure Hunting";
    string public constant symbol = "FORT";
    address public treasurer;
    address public owner;

    bytes32 private immutable DOMAIN_SEPARATOR;

    bytes32 private constant DOMAIN_TYPEHASH =
        keccak256(
            "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
        );

    mapping(uint256 => uint256) public supplies; // tokenId => supply value
    mapping(uint256 => uint256) public minted; // tokenId => minted amount
    mapping(uint256 => uint256) public rates; // tokenId => rate value
    mapping(uint256 => bool) public usedNonce; // tokenId => bool used
    mapping(uint256 => bool) public initializedId; // tokenId => bool initialized
    mapping(address => bool) public isMinter; // address => bool isMinter

    mapping(uint256 => string) private tokenURI;

    constructor(address _owner) ERC1155("") {
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                DOMAIN_TYPEHASH,
                keccak256(bytes(name)), // name
                keccak256(bytes("1.0.1")), // version
                block.chainid,
                address(this)
            )
        );
        isMinter[_owner] = true;
        treasurer = owner = _owner;
    }

    function initToken(
        uint256 tokenId,
        uint256 supply,
        uint256 etherFees,
        uint96 royaltyFee,
        string calldata _uri
    ) external {
        onlyOwner();
        rates[tokenId] = etherFees;
        supplies[tokenId] = supply;
        initializedId[tokenId] = true;
        _setTokenRoyalty(tokenId, treasurer, royaltyFee);
        tokenURI[tokenId] = _uri;
        emit URI(_uri, tokenId);
    }

    function setURI(uint256 _id, string calldata _uri) external {
        onlyOwner();
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function pause() external {
        onlyOwner();
        _pause();
    }

    function unpause() external {
        onlyOwner();
        _unpause();
    }

    event Withdraw(address to, uint256 value);

    function withdraw(uint256 amount) external {
        onlyTreasurer();
        payable(treasurer).transfer(amount);
        emit Withdraw(treasurer, amount);
    }

    function changeTreasurer(address _treasurer) external {
        onlyTreasurer();
        treasurer = _treasurer;
    }

    function changeOwner(address _owner) external {
        onlyOwner();
        owner = _owner;
    }

/// @dev The StructHash of the mint function, 
/// used for verifying the off-chaiin signature
    bytes32 MINT_STRUCT =
        keccak256(
            "MINT(bytes whitelistData,address to,uint256 tokenId,uint256 amount,bool mintAirdrop,uint256 airdropId,uint256 nonce)"
        );


    /// @dev Minting tokens to the address `to` with the tokenId 
    /// `tokenId` and the amount `amount`.
    /// @param whitelistData the bytes value of the userdata
    /// @param to the address to transfer the minted token to
    /// @param tokenId the tokenId to be minted
    /// @param amount the amount of tokenId to be minted
    /// @param mintAirdrop a bool value to determine if to mint airdrop
    /// @param airdropId the airdropId to be minted
    /// @param nonce the nonce value for this signature to prevent replay attack
    /// @param signature the signature value to be verified before minting
    function mintWithSig(
        bytes calldata whitelistData,
        address to,
        uint256 tokenId,
        uint256 amount,
        bool mintAirdrop,
        uint256 airdropId,
        uint256 nonce,
        bytes calldata signature
    ) external payable {
        whenNotPaused();
        verifyMint(
            whitelistData,
            to,
            tokenId,
            amount,
            mintAirdrop,
            airdropId,
            nonce,
            signature
        );
        uint256 reqValue = rates[tokenId] * amount;
        require(msg.value >= reqValue, "value too low");
        _mint(to, tokenId, amount, "");
        if (mintAirdrop) _mint(to, airdropId, 1, "");
    }

/// @dev   Minting tokens to the address `to` 
/// with the tokenId `tokenId` and the amount `amount`.
/// @param to the address to send minted token to
/// @param tokenId the tokenId to mint
/// @param amount the amount of token of tokenId to be minted

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(
            isMinter[msg.sender] && initializedId[tokenId],
            "only minter or not initialized tokenId"
        );
        whenNotPaused();
        _mint(to, tokenId, amount, "");
    }


    function verifyMint(
        bytes calldata whitelistData,
        address to,
        uint256 tokenId,
        uint256 amount,
        bool mintAirdrop,
        uint256 airdropId,
        uint256 nonce,
        bytes calldata signature
    ) private {
        bytes32 hashedStruct = keccak256(
            abi.encode(
                MINT_STRUCT,
                keccak256(whitelistData),
                to,
                tokenId,
                amount,
                mintAirdrop,
                airdropId,
                nonce
            )
        );
        require(
            !usedNonce[nonce] &&
                SignatureHelper.verify(
                    owner,
                    DOMAIN_SEPARATOR,
                    hashedStruct,
                    signature
                ),
            "sig or nonce Err"
        );
        usedNonce[nonce] = true;
        minted[tokenId] += amount;
        // track minted valume and check if token is initialized
        require(
            minted[tokenId] <= supplies[tokenId] && initializedId[tokenId],
            "supply exceeded"
        );
    }

    event SetMinter(address minter, bool isminter);

    function setMinter(address _minter, bool isminter) external {
        onlyOwner();

        isMinter[_minter] = isminter;
        emit SetMinter(_minter, isminter);
    }

    function burn(address account, uint256 _id, uint256 _amount) public override {
        whenNotPaused();
        // onlyTokenOwnerAndCreator(_id);
        super.burn(account, _id, _amount);
    }

    function burnBatch(address account,uint256[] calldata _ids, uint256[] calldata _amounts)
        public override
    {
        whenNotPaused();
        // for (uint256 i = 0; i < _ids.length; i++) {
        //     onlyTokenOwnerAndCreator(_ids[i]);
        // }
        super.burnBatch(account, _ids, _amounts);
    }

    function uri(uint256 _id) public view override returns (string memory) {
        return tokenURI[_id];
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, ERC2981)
        returns (bool)
    {
        return
            ERC2981.supportsInterface(interfaceId) ||
            ERC1155.supportsInterface(interfaceId);
    }

    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function onlyOwner() internal view {
        require(msg.sender == owner, "not owner");
    }

    function onlyTreasurer() internal view {
        require(msg.sender == treasurer, "not treasurer");
    }

}
