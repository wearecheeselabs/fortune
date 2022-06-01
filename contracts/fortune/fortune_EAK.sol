// SPDX-License-Identifier: MIT

// File: @openzeppelin/contracts/utils/Context.sol

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

import "../security/Ownable.sol";
import "../tokens/ERC1155/ERC1155.sol";
import "../common/ERC2981.sol";
import "../votes/EIP712.sol";
import "../libraries/ECDSA.sol";

contract FortuneEAK is Ownable, ERC1155, EIP712, ERC2981 {
    string public constant name = "Fortune Treasure Hunting";
    string public constant symbol = "FORT";

    mapping(uint256 => uint256) public supplies; // tokenId => supply value
    mapping(uint256 => uint256) public minted; // tokenId => minted amount
    mapping(uint256 => uint256) public rates; // tokenId => rate value
    mapping(uint256 => bool) public usedNonce; // tokenId => bool used
    mapping(uint256 => bool) public initializedId; // tokenId => bool initialized
    mapping(address => bool) public isMinter; // address => bool isMinter

    mapping(uint256 => string) private tokenURI;

    constructor(address _owner) ERC1155("") EIP712(name, "1.0.1") {
        isMinter[_owner] = true;
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
        _setTokenRoyalty(tokenId, feeReceiver(), royaltyFee);
        tokenURI[tokenId] = _uri;
        emit URI(_uri, tokenId);
    }

    function setToken(
        uint256 tokenId,
        uint256 supply,
        uint256 etherFees
    ) external {
        onlyOwner();
        rates[tokenId] = etherFees;
        supplies[tokenId] = supply;
    }

    function setURI(uint256 _id, string calldata _uri) external {
        onlyOwner();
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    event Withdraw(address to, uint256 value);

    function withdraw(uint256 amount) external {
        payable(feeReceiver()).transfer(amount);
        emit Withdraw(feeReceiver(), amount);
    }

    /// @dev The StructHash of the mint function,
    /// used for verifying the off-chaiin signature
    bytes32 MINT_STRUCT =
        keccak256(
            "MintWithSig(bytes whitelistData,address to,uint256 tokenId,uint256 amount,uint256 nonce)"
        );

    /// @dev Minting tokens to the address `to` with the tokenId
    /// `tokenId` and the amount `amount`.
    /// @param whitelistData the bytes value of the userdata
    /// @param to the address to transfer the minted token to
    /// @param tokenId the tokenId to be minted
    /// @param amount the amount of tokenId to be minted
    /// @param nonce the nonce value for this signature to prevent replay attack
    /// @param v the value of the ECDSA signature
    /// @param r the value of the ECDSA signature
    /// @param s the value of the ECDSA signature
    function mintWithSig(
        bytes calldata whitelistData,
        address to,
        uint256 tokenId,
        uint256 amount, 
        // bool mintAirdrop,
        // uint256 airdropId,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external payable {
        verifyMint(
            whitelistData,
            to,
            tokenId,
            amount,
            // mintAirdrop,
            // airdropId,
            nonce,
            v,
            r,
            s
        );
        uint256 reqValue = rates[tokenId] * amount;
        require(msg.value >= reqValue, "value too low");
        _mint(to, tokenId, amount, "");
        // if (mintAirdrop) _mint(to, airdropId, 1, "");
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
        _mint(to, tokenId, amount, "");
    }

    function verifyMint(
        bytes calldata whitelistData,
        address to,
        uint256 tokenId,
        uint256 amount,
        // bool mintAirdrop,
        // uint256 airdropId,
        uint256 nonce,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) private {
        bytes32 hashedStruct = keccak256(
            abi.encode(
                MINT_STRUCT,
                keccak256(whitelistData),
                to,
                tokenId,
                amount,
                // mintAirdrop,
                // airdropId,
                nonce
            )
        );
        address signer = ECDSA.recover(_hashTypedDataV4(hashedStruct), v, r, s);
        require(!usedNonce[nonce] && signer == owner(), "sig or nonce Err");
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

    function burn(
        address account,
        uint256 _id,
        uint256 _amount
    ) external {
        onlyOwner();
        ERC1155._burn(account, _id, _amount);
    }

    function burnBatch(
        address account,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) external {
        onlyOwner();
        ERC1155._burnBatch(account, _ids, _amounts);
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
}
