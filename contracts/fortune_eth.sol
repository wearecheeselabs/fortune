// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

//import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
////import "@openzeppelin/contracts/access/Ownable.sol";
//import "@openzeppelin/contracts/security/Pausable.sol";
//import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";

import "ERC1155.sol";
import "Pausable.sol";
import "ERC1155Burnable.sol";


contract Fortune is ERC1155, Pausable, ERC1155Burnable {
    string public name = "Fortune Treasure Hunting";
    string public symbol = "FORT";
    address public treasurer;
    address public owner;

//    uint256[] supplies = [4000, 250];
    uint256[] supplies = [9, 4];
    uint256[] minted = [0, 0];
    uint256[] rates = [.001 ether, 0 ether];
    uint256[] WhitelistCount = [0, 0];

    mapping(uint => string) public tokenURI;
    mapping(address => uint) public whitelist;

//    event Log(string msg, address _id, uint count, uint addressvalue);

    constructor() ERC1155("") {
        name = name;
        symbol = symbol;
        treasurer = msg.sender;
        owner = msg.sender;
    }

    function setURI(uint _id, string memory _uri) external {
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

    function withdrawAll() external {
        onlyTreasurer();
        payable(treasurer).transfer(address(this).balance);
    }

    function withdrawPart(uint256 amount) external {
        onlyTreasurer();
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

    function mintAll(address _to)
    external
    payable
    whenNotPaused
    {
        onlyWhitelistAddress(_to);
        require(msg.value >= rates[0], "Not enough ether sent");

        uint _id = isWhitelisted(_to);
        mint(_to, _id);

        if (_id != 1) {
            mint(_to, 1);
        }
        //        _RemoveWhitelist(_to, _id);
        whitelist[_to] = 99;
        //remove whitelist for both ids 1 and 2.
    }


    function mint(address _to, uint _id)
    internal
    whenNotPaused
    {
        onlyWhitelistAddress(_to);
        require(_id <= supplies.length && _id > 0, "Token doesn't exist");

        require(minted[_id - 1] + 1 <= supplies[_id - 1], "Not enough supply");
        _mint(_to, _id, 1, "");

        minted[_id - 1]++;

    }

    function burn(uint _id, uint _amount) external {
        _burn(msg.sender, _id, _amount);
    }

    function burnBatch(uint[] memory _ids, uint[] memory _amounts) external {
        _burnBatch(msg.sender, _ids, _amounts);
    }

    function burnForMint(address _from, uint[] memory _burnIds, uint[] memory _burnAmounts, uint[] memory _mintIds, uint[] memory _mintAmounts) external {
        onlyOwner();
        _burnBatch(_from, _burnIds, _burnAmounts);
        _mintBatch(_from, _mintIds, _mintAmounts, "");
    }

    function uri(uint _id) public override view returns (string memory) {
        return tokenURI[_id];
    }

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
    internal
    whenNotPaused
    override(ERC1155)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }


    function batchWhitelistAddress(address[] memory _addresses, uint256 _id)
    external
    {
        onlyOwner();
        validTokenId(_id);
        for (uint i = 0; i < _addresses.length; i++) {
            // emit Log("in for loop", _addresses[i], _count, whitelist[_addresses[i]]);
            if (whitelist[_addresses[i]] == 0) {
                whitelist[_addresses[i]] = _id;
//                emit Log("batchWhitelistAddress", _addresses[i], WhitelistCount[_id - 1]+1, supplies[_id - 1]);
                require(WhitelistCount[_id - 1] + 1 <= supplies[_id - 1], "Exceed maxSupply");
                WhitelistCount[_id - 1]++;
                if (_id != 1) {
                    require(WhitelistCount[0] + 1 <= supplies[0], "Exceed maxSupply");
                    WhitelistCount[0]++;
                }
            }
        }
    }

    function batchRemoveWhitelist(address[] memory _addresses, uint256 _id)
    external
    {
        onlyOwner();
        validTokenId(_id);
        for (uint i = 0; i < _addresses.length; i++) {
            _RemoveWhitelist(_addresses[i], _id);
        }
    }

    function _RemoveWhitelist(address _address, uint256 _id)
    internal
    {
        onlyOwner();
        //        if (whitelist[_address] != 0 && whitelist[_address] != 99) {
        if (whitelist[_address] == _id) {
            if (_id == 1) {
                whitelist[_address] = 0;
            }
            else {
                whitelist[_address] = 1;
            }
            WhitelistCount[_id - 1]--;
            //            WhitelistCount[0]--;

        }
        //        else {
        //            emit Log("Adress is not already whitelisted", _address, WhitelistCount[_id - 1], whitelist[_address]);
        //        }
    }

    function isWhitelisted(address _address) public view returns (uint) {
        return whitelist[_address];
    }

    function contractBalance() public view returns (uint256)
    {
        onlyOwner();
        return address(this).balance;
    }


    function getWhitelistCount(uint _id) public view returns (uint)
    {
        return WhitelistCount[_id - 1];
    }

    function getMintedCount(uint _id) public view returns (uint)
    {
        return minted[_id - 1];
    }

    function getMaxSupply(uint _id) public view returns (uint)
    {
        return supplies[_id - 1];
    }

    function onlyOwner() internal view {
        require(msg.sender == owner, "You are not the owner to call this function");
    }

    function onlyWhitelistAddress(address _to) internal view {
        require(whitelist[_to] != 0, "Address not whitelisted. Cant mint.");
        require(whitelist[_to] != 99, "Address already minted!");
    }

    function onlyTreasurer() internal view {
        require(msg.sender == treasurer, "Only the current treasurer can call this function");
    }

    function validTokenId(uint256 _id) internal view {
        require(_id <= supplies.length && _id > 0, "Token doesn't exist");
    }
}
