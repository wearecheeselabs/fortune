// SPDX-License-Identifier: MIT

// File: @openzeppelin/contracts/utils/Context.sol

// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

import "../security/Pausable.sol";
import "../tokens/ERC1155/ERC1155Burnable.sol";
import "../tokens/ERC2981/ERC2981.sol";
import "../common/ContentMixin.sol";
import "../common/NativeMetaTransaction.sol";

contract OwnableDelegateProxy { }

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}

contract Fortune is Pausable, ERC1155Burnable, ERC2981 {
    string public name = "Fortune Treasure Hunting";
    string public symbol = "FORT";
    address public treasurer;
    address public owner;
    uint96 public royaltyFee = 1000; // 10%

    mapping(uint256 => uint256) public supplies; // tokenId => supply value
    mapping(uint256 => uint256) public minted; // tokenId => minted amount
    mapping(uint256 => uint256) private rates; // tokenId => rate value
    mapping(uint256 => uint256) private whitelistCount;

    mapping(uint256 => string) public tokenURI;
    mapping(address => uint256) public whitelist;
    //  Change the whitelist mapping to this
    // mapping(address => mapping(uint256=> bool)) public whitelist;

    address proxyRegistryAddress;

    constructor(address _proxyRegistryAddress) ERC1155("") {
        name = name;
        symbol = symbol;
        treasurer = msg.sender;
        owner = msg.sender;
        proxyRegistryAddress = _proxyRegistryAddress;

        supplies[1] = 9;
        supplies[2] = 4;

        rates[1] = .001 ether;
        rates[2] = 0 ether;
        _setDefaultRoyalty(treasurer, royaltyFee);
    }

    function setURI(uint256 _id, string memory _uri) external {
        onlyOwner();
        tokenURI[_id] = _uri;
        emit URI(_uri, _id);
    }

    function pause() public {
        onlyOwner();
        _pause();
    }

    function unpause() public {
        onlyOwner();
        _unpause();
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator)
    external
    {
        onlyOwner();
        _setDefaultRoyalty(receiver, feeNumerator);
    }

    function withdrawAll() external {
        onlyTreasurer();
        _withdraw(address(this).balance);
    }

    function withdrawPart(uint256 amount) external {
        onlyTreasurer();
        _withdraw(amount);
    }

    function _withdraw(uint256 amount) private {
        payable(treasurer).transfer(amount);
    }

    function changeTreasurer(address _treasurer) external {
        onlyTreasurer();
        treasurer = _treasurer;
    }

    function changeOwner(address _owner) external {
        onlyOwner();
        owner = _owner;
    }

    function mintAll(address _to) external payable {
        whenNotPaused();
        onlyWhitelistAddress(_to);
        require(msg.value >= rates[1], "Not enough ether sent");

        uint256 _id = isWhitelisted(_to);
        mint(_to, _id);

        if (_id != 1) {
            mint(_to, 1);
        }
        whitelist[_to] = 99;
    }

    function mint(address _to, uint256 _id) internal {
        //        whenNotPaused();
        onlyWhitelistAddress(_to);
        //        require(_id <= supplies.length && _id > 0, "Token doesn't exist");
        validTokenId(_id);

        require(minted[_id] + 1 <= supplies[_id], "Not enough supply");
        _mint(_to, _id, 1, "");

        minted[_id]++;
    }


    function burn(uint256 _id, uint256 _amount) external {
        whenNotPaused();
        onlyTokenOwner(_id);
        _burn(msg.sender, _id, _amount);
    }

    function burnBatch(uint256[] memory _ids, uint256[] memory _amounts)
    external
    {
        whenNotPaused();
        for (uint256 i = 0; i < _ids.length; i++) {
            onlyTokenOwner(_ids[i]);
        }
        _burnBatch(msg.sender, _ids, _amounts);
    }

    //    function burnForMint(
    //        address _from,
    //        uint256[] memory _burnIds,
    //        uint256[] memory _burnAmounts,
    //        uint256[] memory _mintIds,
    //        uint256[] memory _mintAmounts
    //    ) external {
    //        onlyOwner();
    //        _burnBatch(_from, _burnIds, _burnAmounts);
    //        _mintBatch(_from, _mintIds, _mintAmounts, "");
    //    }

    function uri(uint256 _id) public view override returns (string memory) {
        return tokenURI[_id];
    }

    //    function _beforeTokenTransfer(
    //        address operator,
    //        address from,
    //        address to,
    //        uint256[] memory ids,
    //        uint256[] memory amounts,
    //        bytes memory data
    //    ) internal override(ERC1155) {
    //        whenNotPaused();
    //        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    //    }

    function batchWhitelistAddress(address[] memory _addresses, uint256 _id)
    external
    {
        onlyOwner();
        validTokenId(_id);
        for (uint256 i = 0; i < _addresses.length; i++) {
            // if(!whitelist[_address][_id]){
            // require(
            //     whitelistCount[_id] + 1 <= supplies[_id],
            //     "Exceed maxSupply"
            // );
            // whitelist[_address][_id] =true;
            // whitelistCount[_id]++;
            // }
            // 
            if (whitelist[_addresses[i]] == 0) {
                whitelist[_addresses[i]] = _id;
                require(
                    whitelistCount[_id] + 1 <= supplies[_id],
                    "Exceed maxSupply"
                );
                whitelistCount[_id]++;
                if (_id != 1) {
                    require(
                        whitelistCount[1] + 1 <= supplies[1],
                        "Exceed maxSupply"
                    );
                    whitelistCount[1]++;
                }
            }
        }
    }

    function batchRemoveWhitelist(address[] memory _addresses, uint256 _id)
    external
    {
        // Uncomment the only owner protection
        //        onlyOwner();
        validTokenId(_id);
        for (uint256 i = 0; i < _addresses.length; i++) {
            _RemoveWhitelist(_addresses[i], _id);
        }
    }

    function _RemoveWhitelist(address _address, uint256 _id) internal {
        onlyOwner();
        // if(whitelist[_address][_id])
        // whitelist[_address][_id] = false;
        // very efficient and gas saving compared to what you currently have
        if (whitelist[_address] == _id) {
            if (_id == 1) {
                whitelist[_address] = 0;
            } else {
                whitelist[_address] = 1;
            }
            whitelistCount[_id]--;
        }
    }

    function isWhitelisted(address _address) public view returns (uint256) {
        return whitelist[_address];
        // whitelist[_address][_id]
    }

    function contractBalance() public view returns (uint256) {
        // this is useless: onlyOwner(); removed.
        return address(this).balance;
    }

    function getWhitelistCount(uint256 _id) public view returns (uint256) {
        return whitelistCount[_id];
    }

    function getMintedCount(uint256 _id) public view returns (uint256) {
        return minted[_id];
    }

    function getMaxSupply(uint256 _id) public view returns (uint256) {
        return supplies[_id];
    }

    function onlyOwner() internal view {
        require(
            msg.sender == owner,
            "You are not the owner to call this function"
        );
    }

    function onlyWhitelistAddress(address _to) internal view {
        require(whitelist[_to] != 0, "Address not whitelisted. Cant mint.");
        require(whitelist[_to] != 99, "Address already minted!");
    }

    function onlyTreasurer() internal view {
        require(
            msg.sender == treasurer,
            "Only the current treasurer can call this function"
        );
    }

    //    function validTokenId(uint256 _id) internal view {
    //        require(_id <= supplies.length && _id > 0, "Token doesn't exist");
    //    }
    function validTokenId(uint256 _id) internal view {
        //        require(_id <= supplies.length && _id > 0, "Token doesn't exist");
        require(supplies[_id] != 0, "Token doesn't exist");
    }

    function onlyTokenOwner(uint256 _id) internal view {
        require(
            balanceOf(msg.sender, _id) != 0,
            "You are not the owner of this NFT."
        );
    }
    // The following functions are overrides required by Solidity.
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155) {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }

    function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC1155, ERC2981)
    returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    /**
   * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-free listings.
   */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) override public view returns (bool isOperator) {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(_owner)) == _operator) {
            return true;
        }

        return ERC1155.isApprovedForAll(_owner, _operator);
    }
}
