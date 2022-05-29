// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../security/Ownable.sol";
import "../tokens/ERC1155/ERC1155Burnable.sol";
import "../common/ERC2981.sol";

contract FortuneGenesis is Ownable, ERC1155Burnable, ERC2981 {
    string public constant name = "Fortune Genesis Pack";
    string public constant symbol = "Genesis NFT";

    mapping(uint256 => uint256) public supplies; // tokenId => supply value
    mapping(uint256 => uint256) public minted; // tokenId => minted amount

    mapping(uint256 => string) private tokenURI;
    mapping(address => bool) public isMinter; // address => bool isMinter

    constructor() ERC1155("") {
        isMinter[msg.sender] = true;
    }

    function setURI(uint256 _id, string memory _uri) external {
        onlyOwner();
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function setRoyalty(uint256 tokenId, uint96 royaltyFee) external {
        onlyOwner();
        _setTokenRoyalty(tokenId, feeReceiver(), royaltyFee);
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
        onlyMinter(msg.sender);
        _mint(to, tokenId, amount, "");
    }

    event SetMinter(address minter, bool isminter);

    function setMinter(address _minter, bool isminter) external {
        onlyOwner();

        isMinter[_minter] = isminter;
        emit SetMinter(_minter, isminter);
    }

    function onlyMinter(address account) private view {
        require(isMinter[account], "only minter");
    }

    function burn(
        address account,
        uint256 _id,
        uint256 _amount
    ) public override {
        onlyMinter(msg.sender);
        ERC1155._burn(account, _id, _amount);
    }

    function burnBatch(
        address account,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) public override {
        onlyMinter(msg.sender);
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
}
