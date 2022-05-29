// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "../common/Context.sol";



abstract contract Ownable is Context {
    uint256 public constant delay = 172_800; // delay for admin change
    address private admin;
    address private _feeReceiver;
    address public pendingAdmin; // pending admin variable
    uint256 public changeAdminDelay; // admin change delay variable

    event ChangeAdmin(address sender, address newOwner);
    event RejectPendingAdmin(address sender, address newOwner);
    event AcceptPendingAdmin(address sender, address newOwner);

    function onlyOwner() internal view {
        require(_msgSender() == admin, "caller is not the owner");
    }

    constructor() {
        admin = _msgSender();
        _feeReceiver = _msgSender();
    }

    function changeAdmin(address _admin) external {
        onlyOwner();
        pendingAdmin = _admin;
        changeAdminDelay = block.timestamp + delay;
        emit ChangeAdmin(_msgSender(), pendingAdmin);
    }

    function rejectPendingAdmin() external {
        onlyOwner();
        if (pendingAdmin != address(0)) {
            pendingAdmin = address(0);
            changeAdminDelay = 0;
        }
        emit RejectPendingAdmin(_msgSender(), pendingAdmin);
    }

    function owner() public view returns (address) {
        return admin;
    }

    function feeReceiver() public view returns (address) {
        return payable(_feeReceiver);
    }

    function setFeeReceiver(address feeReceiver_) external {
        onlyOwner();
        _feeReceiver = feeReceiver_;
    }

    function acceptPendingAdmin() external {
        onlyOwner();
        if (changeAdminDelay > 0 && pendingAdmin != address(0)) {
            require(
                block.timestamp > changeAdminDelay,
                "owner apply too early"
            );
            admin = pendingAdmin;
            changeAdminDelay = 0;
            pendingAdmin = address(0);
        }
        emit AcceptPendingAdmin(_msgSender(), admin);
    }
}
