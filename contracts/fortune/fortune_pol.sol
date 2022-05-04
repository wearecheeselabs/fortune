// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../security/Pausable.sol";
import "../tokens/ERC1155/ERC1155Burnable.sol";

contract FortunePol is Pausable, ERC1155Burnable {
    string public name = "Fortune Treasure Hunting";
    string public symbol = "FORT";
    address public owner;

    // Change all these arrays to mapping 
    // we might need to mint another tokenId in the nearest future

    //    uint256[] supplies = [3, 3, 3];
    //    uint256[] minted = [0, 0, 0];
    //    uint256[] WhitelistCount = [0, 0, 0];

    // Change the arrays to mapping
    mapping(uint256 => uint256) public supplies; // tokenId => supply value
    mapping(uint256 => uint256) public minted; // tokenId => minted amount
//    mapping(uint256 => uint256) private rates; // tokenId => rate value: We don't have rates for this mint. It is free mint by us for the users.
    mapping(uint256 => uint256) private whitelistCount;

    mapping(uint256 => string) public tokenURI;
    mapping(address => uint256) public whitelist;

    constructor() ERC1155("") {
        name = name;
        symbol = symbol;
        owner = msg.sender;
        for (uint256 _id = 1; _id <= 3; _id++) {
            supplies[_id]=3;
//            minted[_id]=0;
//            whitelistCount[_id]=0;
        }
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

    function changeOwner(address _owner) external {
        onlyOwner();
        owner = _owner;
    }

    function mintAll(address[] memory _to) external {
        whenNotPaused();
        onlyOwner();
        for (uint256 i = 0; i < _to.length; i++) {
            mint(_to[i]);
        }
    }

    // Add when not pause check here
    // You don't want anyone to mint when the contract is paused
    // NSOG: This is an internal function and called from mitAll which can only by called by the owner whenNotPaused() is there. We don't expect users to mint this. We mint it for them.
    function mint(address _to) internal {
        onlyWhitelistAddress(_to);
        uint256 _id = isWhitelisted(_to);
        require(minted[_id] + 1 <= supplies[_id], "Not enough supply");
        _mint(_to, _id, 1, "");
        // Why id -1?
        minted[_id]++;
        whitelist[_to] = 99;
    }

    // Add when not pause check here: Done
    // You don't want anyone to burn token when the contract is paused
    // Add who can burn here, only creator as the current token owner: Added code that only current token owner can burn it.
    // or only admin  should be able to burn
    function burn(uint256 _id, uint256 _amount) external {
        whenNotPaused();
        onlyTokenOwner(_id);
        _burn(msg.sender, _id, _amount);
    }

    // Add when not pause check here: Done
    // You don't want anyone to burn token when the contract is paused
    // Add who can burn here, only creator as the current token owner: Implemented that only the token owner can burn.
    // or only admin  should be able to burn
    function burnBatch(uint256[] memory _ids, uint256[] memory _amounts)
    external
    {
        whenNotPaused();
        for (uint256 i = 0; i < _ids.length; i++) {
            onlyTokenOwner(_ids[i]);
        }
        _burnBatch(msg.sender, _ids, _amounts);
    }

//    // What is the use of this function?. Burn and mint in the same single function
//    // Why are you burning same id and minting same ids to the same address?: It is not the same IDs. burning _burnIds and minting _mintIds. Not so useful function. Can remove if you think it is not required.
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
    public
    {
        onlyOwner();
        validTokenId(_id);
        uint256 count = 0;
        for (uint256 i = 0; i < _addresses.length; i++) {
            if (whitelist[_addresses[i]] == 0) {
                whitelist[_addresses[i]] = _id;
                count++;
            }
        }
        require(
        // Why id -1?: id -1 was to point to the id in the 0 indexed array. Removed it since we moved to mapping.
            whitelistCount[_id] + count <= supplies[_id],
            "Exceed maxSupply"
        );
        // Why id -1?: id -1 was to point to the id in the 0 indexed array. Removed it since we moved to mapping.
        whitelistCount[_id] += count;
    }

    function batchRemoveWhitelist(address[] memory _addresses, uint256 _id)
    public
    {
        onlyOwner();
        validTokenId(_id);
        uint256 count = 0;
        for (uint256 i = 0; i < _addresses.length; i++) {
            if (whitelist[_addresses[i]] == _id) {
                whitelist[_addresses[i]] = 0;
                count++;
            }
        }
        whitelistCount[_id] -= count;
    }

    function isWhitelisted(address _address) public view returns (uint256) {
        return whitelist[_address];
    }

    function getWhitelistCount(uint256 _id) public view returns (uint256) {
        // Why id -1?: id -1 was to point to the id in the 0 indexed array. Removed it since we moved to mapping.
        return whitelistCount[_id];
    }

    function getMintedCount(uint256 _id) public view returns (uint256) {
        // Why id -1?: id -1 was to point to the id in the 0 indexed array. Removed it since we moved to mapping.
        return minted[_id];
    }

    function getMaxSupply(uint256 _id) public view returns (uint256) {
        // Why id -1?: id -1 was to point to the id in the 0 indexed array. Removed it since we moved to mapping.
        return supplies[_id];
    }

    function onlyOwner() internal view {
        require(
            msg.sender == owner,
            "You are not the owner to call this function"
        );
    }

    function onlyWhitelistAddress(address _to) internal view {
        require(whitelist[_to] != 0, "Address not whitelisted. Can't mint.");
        require(whitelist[_to] != 99, "Address already minted!");
    }

    function validTokenId(uint256 _id) internal view {
//        require(_id <= supplies.length && _id > 0, "Token doesn't exist");
        require(supplies[_id] !=0, "Token doesn't exist");
    }
    function onlyTokenOwner(uint256 _id) internal view {
        require(balanceOf(msg.sender, _id) !=0 , "You are not the owner of this NFT.");
    }
}


